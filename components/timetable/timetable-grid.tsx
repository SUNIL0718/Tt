"use client";

import { useState, useEffect, useRef } from "react";
import { X, BookOpen, Users, MapPin, ChevronDown, Calendar } from "lucide-react";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"] as const;
type Day = typeof DAYS[number];

const DAY_STYLES: Record<string, { header: string; headerText: string; cell: string }> = {
  MONDAY:    { header: "bg-yellow-100",  headerText: "text-yellow-700",  cell: "bg-yellow-50/30"  },
  TUESDAY:   { header: "bg-green-100",   headerText: "text-green-700",   cell: "bg-green-50/30"   },
  WEDNESDAY: { header: "bg-blue-100",    headerText: "text-blue-700",    cell: "bg-blue-50/30"    },
  THURSDAY:  { header: "bg-pink-100",    headerText: "text-pink-700",    cell: "bg-pink-50/30"    },
  FRIDAY:    { header: "bg-purple-100",  headerText: "text-purple-700",  cell: "bg-purple-50/30"  },
  SATURDAY:  { header: "bg-orange-100",  headerText: "text-orange-700",  cell: "bg-orange-50/30"  },
};

interface Slot { label: string; startTime: string; endTime: string; isBreak: boolean; }
interface ClassItem { _id: string; name: string; section: string; departmentName?: string; departmentCode?: string; }
interface TeacherItem { _id: string; name: string; color?: string; }
interface SubjectItem { _id: string; name: string; code?: string; type?: string; }
interface RoomItem { _id: string; name: string; type?: string; }
interface EntryData {
  day: string; periodIndex: number;
  classId: { _id: string };
  subjectId?: { name: string; code?: string; type?: string };
  teacherId?: { name: string; color?: string };
  roomId?: { name: string };
  type?: "THEORY" | "LAB";
}
interface CellOverride {
  subjectId?: string; subjectName?: string; subjectCode?: string; subjectType?: string;
  teacherId?: string; teacherName?: string; teacherColor?: string;
  roomId?: string; roomName?: string;
  type?: "THEORY" | "LAB";
}

interface Props {
  timetableId: string;
  slots: Slot[];
  classes: ClassItem[];
  entries: EntryData[];
  teachers: TeacherItem[];
  subjects: SubjectItem[];
  rooms: RoomItem[];
}

function getLectureLabel(label: string) {
  return label.replace(/period/gi, "Lecture");
}

interface EditPopupProps {
  cellKey: string;
  slotLabel: string;
  day: string;
  current: CellOverride;
  teachers: TeacherItem[];
  subjects: SubjectItem[];
  rooms: RoomItem[];
  onSave: (updates: { key: string; val: CellOverride }[]) => void;
  onClear: (key: string) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLTableCellElement | null>;
}

function EditPopup({ cellKey, slotLabel, day, current, teachers, subjects, rooms, onSave, onClear, onClose, anchorRef }: EditPopupProps) {
  const [subjectId, setSubjectId] = useState(current.subjectId || "");
  const [teacherId, setTeacherId] = useState(current.teacherId || "");
  const [roomId, setRoomId] = useState(current.roomId || "");
  const [type, setType] = useState<"THEORY" | "LAB">(current.type || "THEORY");
  const [selectedDays, setSelectedDays] = useState<string[]>([day]);
  const popupRef = useRef<HTMLDivElement>(null);

  // Position popup near the cell
  const [pos, setPos] = useState({ top: 0, left: 0 });
  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      const popupHeight = 420; // Increased height for day selector
      const popupWidth = 300; // Approx width
      
      let top = rect.bottom + 4;
      let left = rect.left;
      
      // Keep within horizontal viewport
      if (left + popupWidth > window.innerWidth) {
        left = window.innerWidth - popupWidth - 20;
      }
      if (left < 10) left = 10;
      
      // Keep within vertical viewport (flip up if needed)
      if (rect.bottom + popupHeight > window.innerHeight) {
         top = rect.top - popupHeight - 4;
         // Prevent going off top of screen
         if (top < 10) {
           // Put it in the middle of the screen if it can't fit above or below perfectly
           top = (window.innerHeight - popupHeight) / 2;
         }
      }

      setPos({ top, left });
    }
  }, [anchorRef]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node) &&
          anchorRef.current && !anchorRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, anchorRef]);

  function handleSave() {
    const sub = subjects.find(s => s._id === subjectId);
    const tch = teachers.find(t => t._id === teacherId);
    const rm = rooms.find(r => r._id === roomId);
    
    // Parse the current cellKey to get classId and periodIndex
    // key format: `${cls._id}:${day}:${periodIndex}`
    const pieces = cellKey.split(":");
    if (pieces.length < 3) {
        console.error("Invalid cellKey format:", cellKey);
        onClose();
        return;
    }
    const classId = pieces[0];
    const periodIndex = pieces[2];
    
    // Create updates for all selected days
    const updates = selectedDays.map(d => ({
      key: `${classId}:${d}:${periodIndex}`,
      val: {
        subjectId: sub?._id, subjectName: sub?.name, subjectCode: sub?.code, subjectType: sub?.type,
        teacherId: tch?._id, teacherName: tch?.name, teacherColor: tch?.color,
        roomId: rm?._id, roomName: rm?.name,
        type: type,
      }
    }));

    onSave(updates);
    onClose();
  }

  return (
    <div
      ref={popupRef}
      className="fixed z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-200/60 w-72 p-4"
      style={{ top: pos.top, left: pos.left }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs font-black text-slate-800">{getLectureLabel(slotLabel)}</div>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-3">
        {/* Day Select */}
        <div>
             <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">
                <Calendar className="w-3 h-3" /> Apply to Days
             </label>
             <div className="flex flex-wrap gap-1.5">
                {DAYS.map(d => (
                    <button
                        key={d}
                        onClick={() => {
                            if (selectedDays.includes(d)) {
                                if (selectedDays.length > 1) setSelectedDays(prev => prev.filter(day => day !== d));
                            } else {
                                setSelectedDays(prev => [...prev, d]);
                            }
                        }}
                        className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase transition-all border ${
                            selectedDays.includes(d)
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                        }`}
                    >
                        {d.slice(0, 3)}
                    </button>
                ))}
             </div>
        </div>

        {/* Subject */}
        <div>
          <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
            <BookOpen className="w-3 h-3" /> Subject
          </label>
          <div className="relative">
            <select
              value={subjectId}
              onChange={e => {
                setSubjectId(e.target.value);
                // Auto-select type based on subject
                const sub = subjects.find(s => s._id === e.target.value);
                if (sub && sub.type === "LAB") setType("LAB");
                else if (sub) setType("THEORY");
              }}
              className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 pr-8 focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors"
            >
              <option value="">— Select Subject —</option>
              {subjects.map(s => (
                <option key={s._id} value={s._id}>
                  {s.name}{s.code ? ` (${s.code})` : ""}{s.type === "LAB" ? " 🔬" : ""}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Type Selection */}
        <div>
          <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
             Session Type
          </label>
          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
             <button
                onClick={() => setType("THEORY")}
                className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wide rounded-lg transition-all ${
                   type === "THEORY" 
                   ? "bg-white text-indigo-600 shadow-sm border border-slate-100" 
                   : "text-slate-400 hover:text-slate-600"
                }`}
             >
                Theory
             </button>
             <button
                onClick={() => setType("LAB")}
                 className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wide rounded-lg transition-all ${
                   type === "LAB" 
                   ? "bg-white text-purple-600 shadow-sm border border-slate-100" 
                   : "text-slate-400 hover:text-slate-600"
                }`}
             >
                Lab
             </button>
          </div>
        </div>


        {/* Teacher */}
        <div>
          <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
            <Users className="w-3 h-3" /> Teacher
          </label>
          <div className="relative">
            <select
              value={teacherId}
              onChange={e => setTeacherId(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 pr-8 focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors"
            >
              <option value="">— Select Teacher —</option>
              {teachers.map(t => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Room */}
        <div>
          <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
            <MapPin className="w-3 h-3" /> Room
          </label>
          <div className="relative">
            <select
              value={roomId}
              onChange={e => setRoomId(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 pr-8 focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors"
            >
              <option value="">— Select Room —</option>
              {rooms
                .filter(r => {
                    if (type === "LAB") return r.type === "LAB";
                    // If Theory, show either ALL or just non-labs? 
                    // User said "Start Scheduling -> If the Lab is selected, show only the Lab Rooms".
                    // Implies strict for Lab. For Theory, usually any room works, but let's prioritize Classrooms.
                    // But maybe user wants flexibility. 
                    // Let's filter strictly: Theory -> Classroom, Lab -> Lab? 
                    // Or Theory -> All except Lab?
                    // Safe bet: If Lab selected -> Check r.type === "LAB".
                    // If Theory selected -> Check r.type !== "LAB" (or r.type usually "CLASSROOM").
                    // Let's assume r.type exists.
                    if (type === "THEORY") return r.type !== "LAB"; 
                    return true;
                })
                .map(r => (
                <option key={r._id} value={r._id}>{r.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={handleSave}
          className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-xs font-black hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
        >
          Save
        </button>
        <button
          onClick={() => { onClear(cellKey); onClose(); }}
          className="px-3 py-2 bg-red-50 text-red-500 rounded-xl text-xs font-black hover:bg-red-100 transition-colors border border-red-100"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

export default function TimetableGrid({ timetableId, slots, classes, entries, teachers, subjects, rooms }: Props) {
  const storageKey = `timetable_overrides_v2_${timetableId}`;
  const [overrides, setOverrides] = useState<Record<string, CellOverride>>({});
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingMeta, setEditingMeta] = useState<{ slotLabel: string; day: string } | null>(null);
  const cellRef = useRef<HTMLTableCellElement | null>(null);

  if (classes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-[2.5rem] border border-dashed border-slate-200 text-center animate-in fade-in duration-700">
        <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6">
          <Users className="w-10 h-10 text-indigo-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">No Classes Found</h3>
        <p className="text-slate-500 max-w-sm font-medium mb-8">
          You need to add classes to your organization before you can view or generate a timetable grid.
        </p>
        <a 
          href="/dashboard/classes" 
          className="bg-indigo-600 text-white px-8 py-3 rounded-2xl text-sm font-black hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100"
        >
          Add Your First Class
        </a>
      </div>
    );
  }

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setOverrides(JSON.parse(saved));
    } catch {}
  }, [storageKey]);

  function openEdit(key: string, slotLabel: string, day: string, ref: HTMLTableCellElement) {
    cellRef.current = ref;
    setEditingKey(key);
    setEditingMeta({ slotLabel, day });
  }

  function saveOverride(updates: { key: string; val: CellOverride }[]) {
    const updated = { ...overrides };
    updates.forEach(u => {
        updated[u.key] = u.val;
    });
    setOverrides(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  }

  function clearOverride(key: string) {
    const updated = { ...overrides };
    delete updated[key];
    setOverrides(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  }

  const currentOverride = editingKey ? (overrides[editingKey] || {}) : {};

  return (
    <>
      {/* Edit Popup */}
      {editingKey && editingMeta && (
        <EditPopup
          cellKey={editingKey}
          slotLabel={editingMeta.slotLabel}
          day={editingMeta.day}
          current={currentOverride}
          teachers={teachers}
          subjects={subjects}
          rooms={rooms}
          onSave={saveOverride}
          onClear={clearOverride}
          onClose={() => setEditingKey(null)}
          anchorRef={cellRef}
        />
      )}

      <div className="space-y-8">
        {classes.map((cls) => (
          <div key={cls._id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Class Header */}
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-sm">
                  {cls.departmentName ? cls.departmentName.charAt(0) : cls.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900">{cls.departmentName || cls.name}</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    {cls.name} • Semester {cls.section}
                  </p>
                </div>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                Optimized
              </span>
            </div>

            {/* Grid */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs" style={{ tableLayout: "fixed" }}>
                <colgroup>
                  <col style={{ width: "88px" }} />
                  {DAYS.map(d => <col key={d} />)}
                </colgroup>
                <thead>
                  <tr>
                    <th className="border border-slate-200 bg-slate-100 px-2 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">
                      TIME SLOT
                    </th>
                    {DAYS.map(day => (
                      <th key={day} className={`border border-slate-200 px-2 py-2 text-[10px] font-black uppercase tracking-widest text-center ${DAY_STYLES[day].header} ${DAY_STYLES[day].headerText}`}>
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {slots.map((slot, sIdx) => {
                    if (slot.isBreak) {
                      return (
                        <tr key={`break-${sIdx}`}>
                          <td className="border border-slate-200 bg-amber-50 px-2 py-1.5 text-center">
                            <div className="text-[9px] font-black text-amber-600">{slot.startTime}</div>
                            <div className="text-[9px] font-black text-amber-600">{slot.endTime}</div>
                          </td>
                          <td colSpan={6} className="border border-slate-200 bg-amber-50 text-center py-1.5">
                            <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">☕ {getLectureLabel(slot.label)}</span>
                          </td>
                        </tr>
                      );
                    }

                    const periodIndex = slots.slice(0, sIdx + 1).filter(s => !s.isBreak).length;

                    return (
                      <tr key={`period-${sIdx}`} className="hover:bg-slate-50/50 transition-colors">
                        {/* Time Slot */}
                        <td className="border border-slate-200 bg-slate-50 px-2 py-2 text-center align-middle">
                          <div className="text-[9px] font-black text-slate-600 uppercase tracking-wide leading-tight">
                            {getLectureLabel(slot.label)}
                          </div>
                          <div className="text-[8px] text-slate-400 font-semibold mt-0.5">{slot.startTime}–{slot.endTime}</div>
                        </td>

                        {/* Day Cells */}
                        {DAYS.map(day => {
                          const cellKey = `${cls._id}:${day}:${periodIndex}`;
                          const override = overrides[cellKey];
                          const generated = entries.find(e =>
                            e.classId._id === cls._id && e.day === day && e.periodIndex === periodIndex
                          );

                          // What to display: override takes priority over generated
                          const displaySubjectName = override?.subjectName ?? generated?.subjectId?.name;
                          const displaySubjectCode = override?.subjectCode ?? generated?.subjectId?.code;
                          // Use override type if available, otherwise fallback to subject's type or 'THEORY'
                          const displaySubjectType = override?.type ?? override?.subjectType ?? (generated?.type || generated?.subjectId?.type);
                          const displayTeacherName = override?.teacherName ?? generated?.teacherId?.name;
                          const displayTeacherColor = override?.teacherColor ?? generated?.teacherId?.color;
                          const displayRoomName = override?.roomName ?? generated?.roomId?.name;
                          const hasContent = !!displaySubjectName;

                          return (
                            <td
                              key={`${day}-${sIdx}`}
                              ref={editingKey === cellKey ? (el) => { if (el) cellRef.current = el; } : undefined}
                              className={`border border-slate-200 p-0 align-top ${DAY_STYLES[day].cell} cursor-pointer group`}
                              onClick={(e) => openEdit(cellKey, slot.label, day, e.currentTarget)}
                            >
                              {hasContent ? (
                                <div className="p-2 min-h-[60px] relative">
                                  <div className="font-bold text-slate-800 text-[11px] leading-tight mb-0.5">
                                    {displaySubjectName}
                                  </div>
                                  <div className="flex items-center gap-1 flex-wrap mb-1">
                                    {displaySubjectCode && (
                                      <span className="text-[8px] font-black bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-md uppercase">
                                        {displaySubjectCode}
                                      </span>
                                    )}
                                    {displaySubjectType === "LAB" && (
                                      <span className="text-[8px] font-black bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-md uppercase">LAB</span>
                                    )}
                                  </div>
                                  {displayTeacherName && (
                                    <div className="text-[9px] text-slate-500 font-semibold flex items-center gap-1">
                                      <span className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: displayTeacherColor || "#94a3b8" }} />
                                      {displayTeacherName}
                                    </div>
                                  )}
                                  {displayRoomName && (
                                    <div className="text-[8px] text-slate-400 font-semibold mt-0.5">📍 {displayRoomName}</div>
                                  )}
                                  {/* Edit hint */}
                                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[8px] bg-white border border-slate-200 text-slate-400 px-1 py-0.5 rounded shadow-sm">✏️</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="min-h-[60px] flex items-center justify-center">
                                  <span className="text-[9px] text-slate-300 group-hover:text-indigo-400 font-bold transition-colors group-hover:bg-indigo-50 px-2 py-1 rounded-lg">
                                    + Add
                                  </span>
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
    </>
  );
}
