"use client";

import { useState } from "react";
import TimetableGrid from "./timetable-grid";
import ClasswiseTable from "./classwise-table";
import TeacherwiseTable from "./teacherwise-table";
import { LayoutGrid, Users, BookOpen } from "lucide-react";

interface Props {
  timetableId: string;
  slots: any[];
  classes: any[];
  entries: any[];
  teachers: any[];
  subjects: any[];
  rooms: any[];
}

export default function TimetableViews({
  timetableId,
  slots,
  classes,
  entries,
  teachers,
  subjects,
  rooms,
}: Props) {
  const [activeTab, setActiveTab] = useState<"grid" | "classwise" | "teacherwise">("grid");

  return (
    <div className="space-y-6">
      <div className="print:hidden flex rounded-xl bg-slate-100 p-1 w-fit border border-slate-200 shadow-sm">
        <button
          onClick={() => setActiveTab("grid")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-black transition-all ${
            activeTab === "grid"
              ? "bg-white text-indigo-600 shadow-sm border border-slate-200/50"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
          }`}
        >
          <LayoutGrid className="w-4 h-4" /> Editable Grid
        </button>
        <button
          onClick={() => setActiveTab("classwise")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-black transition-all ${
            activeTab === "classwise"
              ? "bg-white text-indigo-600 shadow-sm border border-slate-200/50"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
          }`}
        >
          <BookOpen className="w-4 h-4" /> View Class-wise
        </button>
        <button
          onClick={() => setActiveTab("teacherwise")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-black transition-all ${
            activeTab === "teacherwise"
              ? "bg-white text-indigo-600 shadow-sm border border-slate-200/50"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
          }`}
        >
          <Users className="w-4 h-4" /> View Teacher-wise
        </button>
      </div>

      {activeTab === "grid" && (
        <TimetableGrid
          timetableId={timetableId}
          slots={slots}
          classes={classes}
          entries={entries}
          teachers={teachers}
          subjects={subjects}
          rooms={rooms}
        />
      )}

      {activeTab === "classwise" && <ClasswiseTable timetableId={timetableId} slots={slots} />}
      {activeTab === "teacherwise" && <TeacherwiseTable timetableId={timetableId} slots={slots} />}
    </div>
  );
}
