"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface Slot {
  label: string;
  startTime: string;
  endTime: string;
  isBreak: boolean;
}

interface Props {
  timetableId: string;
  slots: Slot[];
}

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"] as const;

export default function TeacherwiseTable({ timetableId, slots }: Props) {
  const [data, setData] = useState<Record<string, any[]> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/timetable/teacherwise?timetableId=${timetableId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setData(json.data);
        }
      })
      .finally(() => setLoading(false));
  }, [timetableId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 bg-white rounded-3xl border border-slate-200 animate-in fade-in">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
        <p className="text-slate-500 font-bold">No teacher-wise data available.</p>
      </div>
    );
  }

  // Filter out breaks to align with periodIndex
  const activeSlots = slots.filter((s) => !s.isBreak);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {Object.entries(data).map(([teacherName, entries]) => (
        <div key={teacherName} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">{teacherName}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs text-center" style={{ tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: "90px" }} />
                {DAYS.map((d) => (
                  <col key={d} />
                ))}
              </colgroup>
              <thead>
                <tr>
                  <th className="border border-slate-200 bg-slate-100 px-2 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    PERIOD
                  </th>
                  {DAYS.map((day) => (
                    <th key={day} className="border border-slate-200 bg-slate-100 px-2 py-2 text-[10px] font-black uppercase tracking-widest text-slate-700">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeSlots.map((slot, sIdx) => {
                  const periodIndex = sIdx + 1;
                  return (
                    <tr key={`period-${periodIndex}`} className="hover:bg-slate-50/50 transition-colors">
                      <td className="border border-slate-200 bg-slate-50 px-2 py-3">
                        <div className="text-[10px] font-black text-slate-700 uppercase">{slot.label.replace(/period/gi, "Period")}</div>
                        <div className="text-[8px] text-slate-400 font-bold mt-1">{slot.startTime}–{slot.endTime}</div>
                      </td>
                      {DAYS.map((day) => {
                        const cellData = entries.find((e) => e.day === day && e.period === periodIndex);
                        return (
                          <td key={`${day}-${periodIndex}`} className="border border-slate-200 p-2 align-top">
                            {cellData ? (
                              <div className="flex flex-col gap-1 min-h-[50px] justify-center items-center">
                                <span className="font-bold text-[11px] text-slate-800 leading-tight block">{cellData.class}</span>
                                {cellData.subject && (
                                  <span className="text-[9px] font-semibold text-slate-500 bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-md">
                                    {cellData.subject}
                                  </span>
                                )}
                                {cellData.room && <span className="text-[8px] text-slate-400">📍 {cellData.room}</span>}
                              </div>
                            ) : (
                              <div className="flex flex-col min-h-[50px] justify-center items-center">
                                <span className="text-[10px] text-slate-300 font-bold">-</span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
