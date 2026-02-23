"use server";

import connectToDatabase from "@/lib/db";
import Timetable from "@/lib/models/Timetable";
import TimetableEntry from "@/lib/models/TimetableEntry";
import Teacher from "@/lib/models/Teacher";
import Subject from "@/lib/models/Subject";
import Class from "@/lib/models/Class";
import TeacherConstraint from "@/lib/models/TeacherConstraint";
import Room from "@/lib/models/Room";
import PeriodTiming from "@/lib/models/PeriodTiming";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { TimetableGenerator, Slot } from "@/lib/algorithm/generator";

import { ITeacher } from "@/lib/models/Teacher";
import { ISubject } from "@/lib/models/Subject";
import { IClass } from "@/lib/models/Class";

import { IPeriodTiming } from "@/lib/models/PeriodTiming";

export async function generateTimetableAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.organizationId) {
    console.error("[GenerateAction] Unauthorized: No organization ID");
    return { message: "Unauthorized" };
  }

  const name = formData.get("name") as string || "Draft Timetable";
  const year = parseInt(formData.get("year") as string) || new Date().getFullYear();
  const departmentId = formData.get("departmentId") as string || undefined;
  const classId = formData.get("classId") as string || undefined;
  const timetableId = formData.get("timetableId") as string || undefined;

  console.log(`[GenerateAction] Starting generation for org: ${session.user.organizationId}, name: ${name}, dept: ${departmentId}, class: ${classId}`);

  try {
    await connectToDatabase();
    const orgId = session.user.organizationId;

    // 1. Fetch all required data
    const filter: any = { organizationId: orgId };
    
    // Departments filter
    if (departmentId) {
      // If filtering by department, we need to find which classes belong to this department
      // But currently Class model has departmentId, references Department.
      // So we can filter Classes by departmentId directly.
      // HOWEVER, Subjects and Teachers also have departmentId.
      // Ideally, the user selects a scope.
      
      // If we filter teachers/subjects by department, we might miss cross-department teachers?
      // For now, let's keep it simple: Filter classes by department.
      // Filter subjects by department? Maybe.
    }

    // Filter scope
    const classFilter: any = { organizationId: orgId };
    if (classId) {
       classFilter._id = classId;
    } else if (departmentId) {
       classFilter.departmentId = departmentId;
    }

    const [teachers, subjects, classes, constraints, rooms, timing] = await Promise.all([
      Teacher.find({ organizationId: orgId }).lean(), // Fetch all teachers to allow cross-dept
      Subject.find({ organizationId: orgId }).lean(), // Fetch all subjects
      Class.find(classFilter).lean(), // Filter classes by scope
      TeacherConstraint.find({ organizationId: orgId }).lean(),
      Room.find({ organizationId: orgId }).lean(),
    ]);

    let timing = await PeriodTiming.findOne({ organizationId: orgId, isDefault: true }).lean();
    if (!timing) {
      timing = await PeriodTiming.findOne({ organizationId: orgId }).sort({ createdAt: -1 }).lean();
    }

    if (!timing) {
      console.warn("[GenerateAction] Validation failed: No timing defined");
      return { message: "Please define period timings in Settings first." };
    }
    if (teachers.length === 0) {
      return { message: "Please add at least one teacher before generating." };
    }
    if (subjects.length === 0) {
      return { message: "Please add at least one subject before generating." };
    }
    if (classes.length === 0) {
      return { message: "No classes found for the selected scope." };
    }

    console.log(`[GenerateAction] Data: ${teachers.length} teachers, ${subjects.length} subjects, ${classes.length} classes, ${rooms.length} rooms`);

    // 2. Auto-build assignments: assign each subject to each class with a round-robin teacher
    //    Each subject gets ~periodsPerWeek based on type (LAB=2, THEORY=4)
    const assignments: any[] = [];
    let teacherIdx = 0;

    classes.forEach((cls: any) => {
      // For specific class/department, we should ideally restrict subjects too?
      // For now, assigning ALL subjects to these classes.
      // In a real app, Class -> Subjects mapping exists. Here we blindly assign.
      // IMPROVEMENT: Filter subjects if departmentId is set?
      const scopeSubjects = departmentId 
        ? subjects.filter((s: any) => s.departmentId?.toString() === departmentId)
        : subjects;
        
      const targetSubjects = scopeSubjects.length > 0 ? scopeSubjects : subjects;

      targetSubjects.forEach((sub: any) => {
        // Assign teacher... ideally based on department too
        const eligibleTeachers = departmentId 
            ? teachers.filter((t: any) => t.departmentId?.toString() === departmentId)
            : teachers;
        const validTeachers = eligibleTeachers.length > 0 ? eligibleTeachers : teachers;

        const teacher = validTeachers[teacherIdx % validTeachers.length] as any;
        teacherIdx++;
        assignments.push({
          _id: `${cls._id}-${sub._id}`,
          teacherId: { _id: teacher._id.toString(), name: teacher.name },
          subjectId: { _id: sub._id.toString(), name: sub.name, code: sub.code || sub.name.slice(0, 3).toUpperCase(), type: sub.type || "THEORY" },
          classId: { _id: cls._id.toString(), name: cls.name, section: cls.section },
          periodsPerWeek: sub.type === "LAB" ? 2 : 4,
        });
      });
    });

    console.log(`[GenerateAction] Auto-built ${assignments.length} assignments`);

    // 3. Prepare Slots from PeriodTiming (MONDAY-SATURDAY, filtering out breaks)
    const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    const slots: Slot[] = [];
    
    days.forEach(day => {
      (timing as any).slots.forEach((slot: any, index: number) => {
        if (!slot.isBreak) {
          slots.push({ day, periodIndex: index + 1 });
        }
      });
    });

    console.log(`[GenerateAction] Total slots prepared: ${slots.length}`);

    // 4. Run Generator
    const generator = new TimetableGenerator(
      assignments as any, 
      constraints as any, 
      slots, 
      rooms
    );
    
    const results = generator.generate();

    if (!results || results.length === 0) {
      console.warn("[GenerateAction] Generation failed or produced no entries");
      return { message: "Could not generate a conflict-free timetable. Try adding more rooms or relaxing constraints." };
    }

    console.log(`[GenerateAction] Generation success: ${results.length} entries created`);

    // 5. Delete existing entries if re-generating
    let targetTimetableId = timetableId;
    
    if (targetTimetableId) {
       // Delete entries ONLY for the classes we just generated for
       // This preserves other classes' timetables
       const classIds = classes.map((c: any) => c._id);
       await TimetableEntry.deleteMany({ 
         timetableId: targetTimetableId,
         classId: { $in: classIds }
       });
    } else {
      const newTimetable = await Timetable.create({
        name,
        year,
        organizationId: orgId,
      });
      targetTimetableId = newTimetable._id.toString();
    }

    const entriesToSave = results.map(res => ({
      ...res,
      timetableId: targetTimetableId,
    }));

    await TimetableEntry.insertMany(entriesToSave);

    console.log(`[GenerateAction] Saved successfully: ID ${targetTimetableId}`);

    revalidatePath("/dashboard/timetable");
    if (targetTimetableId) revalidatePath(`/dashboard/timetable/${targetTimetableId}`);
    
    return { 
      message: departmentId ? "Department-wise timetable generated!" : "Timetable generated successfully!", 
      success: true, 
      id: targetTimetableId 
    };

  } catch (error) {
    console.error("[GenerateAction] Fatal Error:", error);
    return { message: "Database Error: " + (error as Error).message };
  }
}

export async function deleteTimetable(id: string) {
    const session = await auth();
    if (!session?.user?.organizationId) return { message: "Unauthorized" };
  
    try {
      await connectToDatabase();
      await Promise.all([
          Timetable.findOneAndDelete({ _id: id, organizationId: session.user.organizationId }),
          TimetableEntry.deleteMany({ timetableId: id })
      ]);
      revalidatePath("/dashboard/timetable");
      return { message: "Timetable deleted." };
    } catch (error) {
      return { message: "Database Error." };
    }
}

export async function clearTimetableEntries(id: string) {
  const session = await auth();
  if (!session?.user?.organizationId) return { message: "Unauthorized" };

  try {
    await connectToDatabase();
    // Verify ownership
    const timetable = await Timetable.findOne({ _id: id, organizationId: session.user.organizationId });
    if (!timetable) return { message: "Timetable not found or unauthorized." };

    await TimetableEntry.deleteMany({ timetableId: id });
    
    revalidatePath("/dashboard/timetable");
    revalidatePath(`/dashboard/timetable/${id}`);
    return { message: "Timetable data cleared.", success: true };
  } catch (error) {
    return { message: "Database Error: " + (error as Error).message };
  }
}
