"use server";

import connectToDatabase from "@/lib/db";
import Teacher from "@/lib/models/Teacher";
import Class from "@/lib/models/Class";
import Subject from "@/lib/models/Subject";
import Room from "@/lib/models/Room";
import Department from "@/lib/models/Department";
import ImportLog from "@/lib/models/ImportLog";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function bulkImportData(entityType: string, data: any[], fileName: string) {
  const session = await auth();
  if (!session?.user?.organizationId) {
    throw new Error("Unauthorized: No organization linked to your account.");
  }

  const orgId = session.user.organizationId;
  const userId = session.user.id;

  if (!userId) {
    throw new Error("Unauthorized: User ID not found in session.");
  }

  await connectToDatabase();

  // Create an initial log
  const log = await ImportLog.create({
    organizationId: orgId,
    userId: userId,
    entityType,
    fileName,
    totalRows: data.length,
    status: "PENDING",
  });

  let successCount = 0;
  let errorCount = 0;
  const errors: any[] = [];

  try {
    const getVal = (row: any, ...keys: string[]) => {
      for (const key of keys) {
          // Direct match
          if (row[key] !== undefined) return row[key];
          // Case-insensitive/fuzzy match
          const lowerKey = key.toLowerCase();
          const foundKey = Object.keys(row).find(k => k.toLowerCase() === lowerKey || k.toLowerCase().replace(/[^a-z0-9]/g, '') === lowerKey.replace(/[^a-z0-9]/g, ''));
          if (foundKey) return row[foundKey];
      }
      return undefined;
    };

    // 1. Prefetch departments for lookup
    const departments = await Department.find({ organizationId: orgId }).lean();
    const findDeptId = (nameOrCode: string | undefined) => {
        if (!nameOrCode) return undefined;
        const search = nameOrCode.toString().trim().toLowerCase();
        const dept = departments.find(d => 
            d.name.trim().toLowerCase() === search || 
            d.code?.trim().toLowerCase() === search
        );
        return dept?._id;
    };

    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        try {
            if (entityType === "TEACHER") {
                let name = getVal(row, "Name", "Teacher Name", "Full Name")?.toString().trim();
                const email = getVal(row, "Email", "Email Address")?.toString().trim().toLowerCase();
                const initials = getVal(row, "Initials")?.toString().trim();
                const maxPeriods = getVal(row, "Max Periods Per Week", "Max Load", "MaxPeriods");
                const deptVal = getVal(row, "Department", "Dept");

                if (!name) throw new Error("Name is required");

                // Check for duplicate by email or name
                let existing = null;
                if (email) {
                    existing = await Teacher.findOne({ 
                        organizationId: orgId, 
                        email: email 
                    });
                } else {
                    existing = await Teacher.findOne({
                        organizationId: orgId,
                        name: { $regex: new RegExp(`^${name}$`, "i") }
                    });
                }

                if (existing) {
                    errors.push({ row: i + 1, message: `Teacher ${name}${email ? ` (${email})` : ''} already exists.`, data: row });
                    errorCount++;
                    continue;
                }
                
                await Teacher.create({
                    name: name,
                    email: email,
                    initials: initials || name.substring(0, 3).toUpperCase(),
                    maxPeriods: Number(maxPeriods) || 30,
                    departmentId: findDeptId(deptVal),
                    organizationId: orgId,
                });
            } else if (entityType === "CLASS") {
                const name = getVal(row, "Name", "Class Name", "Grade")?.toString().trim();
                const section = getVal(row, "Section", "Section Name", "Semester")?.toString().trim();
                const deptVal = getVal(row, "Department", "Dept");

                if (!name || !section) throw new Error("Name and Section are required");

                const existing = await Class.findOne({
                    organizationId: orgId,
                    name: { $regex: new RegExp(`^${name}$`, "i") },
                    section: { $regex: new RegExp(`^${section}$`, "i") }
                });
                if (existing) {
                    errors.push({ row: i + 1, message: `Class ${name}-${section} already exists.`, data: row });
                    errorCount++;
                    continue;
                }

                await Class.create({
                    name: name,
                    section: section,
                    departmentId: findDeptId(deptVal),
                    organizationId: orgId,
                });
            } else if (entityType === "SUBJECT") {
                const name = getVal(row, "Name", "Subject Name", "Course Name")?.toString().trim();
                const code = getVal(row, "Code", "Subject Code")?.toString().trim();
                const type = getVal(row, "Type", "Subject Type", "Type (THEORY/LAB)")?.toString().trim();
                const deptVal = getVal(row, "Department", "Dept");

                if (!name) throw new Error("Subject Name is required");

                const existing = await Subject.findOne({
                    organizationId: orgId,
                    name: { $regex: new RegExp(`^${name}$`, "i") }
                });
                if (existing) {
                    errors.push({ row: i + 1, message: `Subject ${name} already exists.`, data: row });
                    errorCount++;
                    continue;
                }

                await Subject.create({
                    name: name,
                    code: code,
                    type: type?.toUpperCase() === "LAB" ? "LAB" : "THEORY",
                    departmentId: findDeptId(deptVal),
                    organizationId: orgId,
                });
            } else if (entityType === "ROOM") {
                const name = getVal(row, "Name", "Room Name", "Room Number")?.toString().trim();
                const capacity = getVal(row, "Capacity", "Room Capacity", "Seats");
                const type = getVal(row, "Type", "Room Type", "Type (CLASSROOM/LAB)")?.toString().trim();

                if (!name) throw new Error("Room Name is required");

                const existing = await Room.findOne({
                    organizationId: orgId,
                    name: { $regex: new RegExp(`^${name}$`, "i") }
                });
                if (existing) {
                    errors.push({ row: i + 1, message: `Room ${name} already exists.`, data: row });
                    errorCount++;
                    continue;
                }

                await Room.create({
                    name: name,
                    capacity: Number(capacity) || 40,
                    type: type?.toUpperCase() === "LAB" ? "LAB" : "CLASSROOM",
                    organizationId: orgId,
                });
            } else if (entityType === "DEPARTMENT") {
                const name = getVal(row, "Name", "Department Name")?.toString().trim();
                const code = getVal(row, "Code", "Department Code")?.toString().trim();

                if (!name) throw new Error("Department Name is required");

                const existing = await Department.findOne({
                    organizationId: orgId,
                    name: { $regex: new RegExp(`^${name}$`, "i") }
                });
                if (existing) {
                    errors.push({ row: i + 1, message: `Department ${name} already exists.`, data: row });
                    errorCount++;
                    continue;
                }

                await Department.create({
                    name: name,
                    code: code,
                    organizationId: orgId,
                });
            }
            successCount++;
        } catch (err: any) {
            errorCount++;
            errors.push({ row: i + 1, message: err.message, data: row });
        }
    }

    // Update log
    log.status = errorCount === 0 ? "COMPLETED" : (successCount === 0 ? "FAILED" : "PARTIAL");
    log.successCount = successCount;
    log.errorCount = errorCount;
    log.errors = errors;
    await log.save();

    revalidatePath("/dashboard/teachers");
    revalidatePath("/dashboard/classes");
    revalidatePath("/dashboard/subjects");
    revalidatePath("/dashboard/rooms");

    return {
        success: true,
        summary: {
            success: successCount,
            failed: errorCount,
            total: data.length
        }
    };
  } catch (globalErr: any) {
    log.status = "FAILED";
    log.errors.push({ row: 0, message: globalErr.message });
    await log.save();
    return { success: false, error: globalErr.message };
  }
}

export async function getImportHistory(entityType: string) {
    const session = await auth();
    if (!session?.user?.organizationId) return [];

    await connectToDatabase();
    return await ImportLog.find({ 
        organizationId: session.user.organizationId,
        entityType 
    }).sort({ createdAt: -1 }).limit(10).lean();
}


