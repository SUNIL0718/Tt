import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Timetable, { ITimetable } from "@/lib/models/Timetable";
import TimetableEntry from "@/lib/models/TimetableEntry";
import PeriodTiming from "@/lib/models/PeriodTiming";
import Class from "@/lib/models/Class";
import Teacher from "@/lib/models/Teacher";
import Subject from "@/lib/models/Subject";
import Room from "@/lib/models/Room";
import Department from "@/lib/models/Department";
import { notFound } from "next/navigation";
import { ChevronLeft, Users, Calendar } from "lucide-react";
import Link from "next/link";
import TimetableGrid from "@/components/timetable/timetable-grid";
import TimetableActions from "@/components/timetable/timetable-actions";
import { ExternalLink } from "lucide-react";

import Organization from "@/lib/models/Organization";
import { IPeriodTiming } from "@/lib/models/PeriodTiming";

export default async function TimetableDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return <div>Unauthorized</div>;

  await connectToDatabase();
  const orgId = session.user.organizationId?.toString();
  const isSuperAdmin = session.user.role === "SUPER_ADMIN";

  if (!isSuperAdmin && (!orgId || orgId === "[object Object]")) {
    return <div>Unauthorized: No organization linked to your account.</div>;
  }

  const timetableQuery = isSuperAdmin ? { _id: id } : { _id: id, organizationId: orgId };

  const [timetableResult, entries, timingResult, classes, teachers, subjects, rooms, departments] = await Promise.all([
    Timetable.findOne(timetableQuery).lean(),
    TimetableEntry.find({ timetableId: id })
      .populate({ path: "teacherId", select: "name initials color", strictPopulate: false })
      .populate({ path: "subjectId", select: "name code type", strictPopulate: false })
      .populate({ path: "classId", select: "name section", strictPopulate: false })
      .populate({ path: "roomId", select: "name", strictPopulate: false })
      .lean(),
    PeriodTiming.findOne({ organizationId: orgId, isDefault: true }).lean(),
    Class.find({ organizationId: orgId })
      .populate({ path: "departmentId", select: "name code", strictPopulate: false })
      .sort({ name: 1, section: 1 })
      .lean(),
    Teacher.find({ organizationId: orgId }).sort({ name: 1 }).lean(),
    Subject.find({ organizationId: orgId }).sort({ name: 1 }).lean(),
    Room.find({ organizationId: orgId }).sort({ name: 1 }).lean(),
    Department.find({ organizationId: orgId }).sort({ name: 1 }).lean(),
  ]);

  const timetable = timetableResult as unknown as ITimetable;
  const timing = timingResult as unknown as IPeriodTiming;

  if (!timetable) notFound();
  if (!timing) return (
    <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
      <p className="text-slate-500 font-bold">Timing configuration not found. Please set timings in Settings.</p>
    </div>
  );

  // Serialize for client component
  const serializedClasses = classes.map((c: any) => ({
    _id: c._id.toString(),
    name: c.name,
    section: c.section,
    departmentName: c.departmentId?.name,
    departmentCode: c.departmentId?.code,
    departmentId: c.departmentId?._id?.toString(), // For filtering in UI
  }));

  const serializedEntries = entries.map((e: any) => ({
    day: e.day,
    periodIndex: e.periodIndex,
    classId: { _id: e.classId._id?.toString() ?? e.classId.toString() },
    subjectId: e.subjectId ? { name: e.subjectId.name, code: e.subjectId.code, type: e.subjectId.type } : undefined,
    teacherId: e.teacherId ? { name: e.teacherId.name, color: e.teacherId.color } : undefined,
    roomId: e.roomId ? { name: e.roomId.name } : undefined,
  }));

  const serializedSlots = (timing.slots as any[]).map(s => ({
    label: s.label, startTime: s.startTime, endTime: s.endTime, isBreak: s.isBreak,
  }));

  const serializedTeachers = teachers.map((t: any) => ({
    _id: t._id.toString(), name: t.name, color: t.color,
  }));

  const serializedSubjects = subjects.map((s: any) => ({
    _id: s._id.toString(), name: s.name, code: s.code, type: s.type,
  }));

  const serializedRooms = rooms.map((r: any) => ({
    _id: r._id.toString(), name: r.name, type: r.type,
  }));

  const serializedDepartments = (departments || []).map((d: any) => ({
    _id: d._id.toString(), name: d.name, code: d.code,
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link href="/dashboard/timetable" className="inline-flex items-center gap-1 text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-600 mb-1">
            <ChevronLeft className="w-3 h-3" /> Back to Grids
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{timetable.name}</h1>
          <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
            <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Year {timetable.year}</div>
            <div className="flex items-center gap-1.5"><Users className="w-3 h-3" /> {classes.length} Classes</div>
            <a 
              href="/timetable-grid.html" 
              target="_blank" 
              className="flex items-center gap-1 text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-600 transition-colors ml-2"
            >
              <ExternalLink className="w-3 h-3" /> Interactive Grid Template
            </a>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TimetableActions 
            timetableId={id}
            timetableName={timetable.name}
            slots={serializedSlots}
            classes={serializedClasses}
            entries={serializedEntries}
            teachers={serializedTeachers}
            subjects={serializedSubjects}
            rooms={serializedRooms}
            departments={serializedDepartments}
          />
        </div>
      </div>

      {/* Editable Grid */}
      <TimetableGrid
        timetableId={id}
        slots={serializedSlots}
        classes={serializedClasses}
        entries={serializedEntries}
        teachers={serializedTeachers}
        subjects={serializedSubjects}
        rooms={serializedRooms}
      />
    </div>
  );
}
