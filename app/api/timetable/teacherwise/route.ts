import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import TimetableEntry from "@/lib/models/TimetableEntry";
import "@/lib/models/Class";    // Ensure models are registered
import "@/lib/models/Subject";
import "@/lib/models/Teacher";
import "@/lib/models/Room";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const timetableId = searchParams.get("timetableId");

    if (!timetableId) {
      return NextResponse.json({ error: "timetableId is required" }, { status: 400 });
    }

    await connectToDatabase();

    // Fetch entries and populate references
    const entries = await TimetableEntry.find({ timetableId }).populate([
      { path: "classId", select: "name section" },
      { path: "subjectId", select: "name code type" },
      { path: "teacherId", select: "name" },
      { path: "roomId", select: "name" },
    ]).lean();

    // Group by teacher
    const teacherwiseData: Record<string, any[]> = {};
    for (const entry of entries) {
      if (!entry.teacherId) continue; // Skip entries without teacher
      
      const teacher = entry.teacherId as any;
      const teacherName = teacher.name;
      
      if (!teacherwiseData[teacherName]) {
        teacherwiseData[teacherName] = [];
      }
      
      const cls = entry.classId as any;
      const className = cls ? `${cls.name} ${cls.section || ""}`.trim() : "Unknown";

      teacherwiseData[teacherName].push({
        day: entry.day,
        period: entry.periodIndex,
        class: className,
        subject: entry.subjectId ? (entry.subjectId as any).name : null,
        room: entry.roomId ? (entry.roomId as any).name : null,
      });
    }

    return NextResponse.json({ success: true, data: teacherwiseData });

  } catch (error: any) {
    console.error("Error fetching teacherwise timetable:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
