"use client";

import { Download, Printer, Trash2, AlertTriangle, Sparkles, X, ChevronDown, Check, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import { clearTimetableEntries, generateTimetableAction } from "@/actions/timetable";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  timetableId: string;
  timetableName: string;
  slots: any[];
  classes: any[];
  entries: any[];
  teachers: any[];
  subjects: any[];
  rooms: any[];
  departments: any[];
}

export default function TimetableActions({ timetableId, timetableName, slots, classes, entries, departments = [] }: Props) {
  const router = useRouter();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  
  // Generation states
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  async function handleGenerate() {
    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append("timetableId", timetableId);
      if (selectedDeptId) formData.append("departmentId", selectedDeptId);
      if (selectedClassId) formData.append("classId", selectedClassId);
      
      const res = await generateTimetableAction(formData);
      if (res.success) {
        setShowGenerateModal(false);
        router.refresh();
      } else {
        alert(res.message);
      }
    } catch {
      alert("Failed to generate");
    } finally {
      setIsGenerating(false);
    }
  }
  
  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    // Flatten data for CSV
    // Columns: Class, Day, Period, Time, Subject, Type, Teacher, Room
    const rows: any[] = [];

    classes.forEach(cls => {
      const classEntries = entries.filter(e => e.classId._id === cls._id);
      
      classEntries.forEach(entry => {
        const slot = slots[entry.periodIndex - 1]; // 0-based index from 1-based periodIndex
        if (!slot) return;

        rows.push({
          Class: `${cls.name} ${cls.section}`,
          Day: entry.day,
          Period: entry.periodIndex,
          Time: `${slot.startTime} - ${slot.endTime}`,
          Subject: entry.subjectId?.name || "Free",
          Code: entry.subjectId?.code || "",
          Type: entry.type || entry.subjectId?.type || "THEORY",
          Teacher: entry.teacherId?.name || "N/A",
          Room: entry.roomId?.name || "N/A",
        });
      });
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Timetable");

    // Generate file
    XLSX.writeFile(workbook, `${timetableName.replace(/\s+/g, "_")}_timetable.csv`);
    // Generate file
    XLSX.writeFile(workbook, `${timetableName.replace(/\s+/g, "_")}_timetable.csv`);
  };

  async function handleClear() {
    setIsClearing(true);
    try {
      const res = await clearTimetableEntries(timetableId);
      if (res.success) {
        // Clear local overrides as well
        localStorage.removeItem(`timetable_overrides_v2_${timetableId}`);
        setShowClearConfirm(false);
        router.refresh();
      } else {
        alert(res.message);
      }
    } catch {
      alert("Failed to clear");
    } finally {
      setIsClearing(false);
    }
  }

  return (
    <div className="flex items-center gap-3 print:hidden">
      <button
        onClick={() => setShowGenerateModal(true)}
        className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-xs font-black hover:bg-indigo-100 transition-all border border-indigo-100 shadow-sm"
      >
        <Sparkles className="w-4 h-4" />
        Generate Grid
      </button>
      <button
        onClick={handleExportCSV}
        className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all shadow-sm"
      >
        <Download className="w-4 h-4 text-emerald-500" />
        Export CSV
      </button>
      <button
        onClick={handlePrint}
        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200"
      >
        <Printer className="w-4 h-4" />
        Print / PDF
      </button>
      <button
        onClick={() => setShowClearConfirm(true)}
        className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-100 transition-all shadow-sm"
      >
        <Trash2 className="w-4 h-4" />
        Clear All
      </button>

      {/* Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-2">Clear Grid?</h3>
              <p className="text-xs text-slate-500 font-medium mb-6 leading-relaxed">
                Are you sure you want to delete all entries from <span className="font-bold text-slate-700">{timetableName}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  disabled={isClearing}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClear}
                  disabled={isClearing}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                >
                  {isClearing ? "Clearing..." : "Yes, Clear All"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
              <div className="bg-indigo-600 px-6 py-6 text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                    <Sparkles className="w-24 h-24" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-xl font-black tracking-tight mb-1">Smart Grid Generator</h3>
                    <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest opacity-80">Populate grid with optimized assignments</p>
                  </div>
              </div>

              <div className="p-8">
                  <div className="space-y-6">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Target Department</label>
                        <div className="grid grid-cols-1 gap-2">
                           <button 
                            onClick={() => setSelectedDeptId("")}
                            className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                              selectedDeptId === "" 
                              ? "border-indigo-500 bg-indigo-50/50 text-indigo-700" 
                              : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200"
                            }`}
                           >
                              <div className="flex items-center gap-3 text-left">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${selectedDeptId === "" ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-400"}`}>
                                  ALL
                                </div>
                                <div>
                                  <span className="text-xs font-black block">Complete Institution</span>
                                  <span className="text-[9px] opacity-60 font-bold uppercase tracking-wider">Generate for all departments</span>
                                </div>
                              </div>
                              {selectedDeptId === "" && <Check className="w-4 h-4" />}
                           </button>

                           {departments.map((dept: any) => (
                             <button 
                              key={dept._id}
                              onClick={() => setSelectedDeptId(dept._id)}
                              className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                                selectedDeptId === dept._id
                                ? "border-indigo-500 bg-indigo-50/50 text-indigo-700" 
                                : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200"
                              }`}
                             >
                                <div className="flex items-center gap-3 text-left">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black ${selectedDeptId === dept._id ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-400"}`}>
                                    {dept.code || dept.name.slice(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <span className="text-xs font-black block">{dept.name}</span>
                                    <span className="text-[9px] opacity-60 font-bold uppercase tracking-wider">Fill {dept.code} specific periods</span>
                                  </div>
                                </div>
                                {selectedDeptId === dept._id && <Check className="w-4 h-4" />}
                             </button>
                           ))}
                        </div>
                      </div>

                      {/* Class Selection (Only if Dept is selected or All? Let's allow Class selection if no dept or specific dept) */}
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Specific Class (Optional)</label>
                        <select 
                           className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all appearance-none"
                           onChange={(e) => setSelectedClassId(e.target.value)}
                           value={selectedClassId}
                        >
                           <option value="">— Generate for All Classes in Scope —</option>
                           {classes
                             .filter(c => !selectedDeptId || !c.departmentId || c.departmentId._id === selectedDeptId || c.departmentId === selectedDeptId) // Filter by dept if selected
                             .map((cls: any) => (
                               <option key={cls._id} value={cls._id}>
                                 {cls.name} (Semester {cls.section})
                               </option>
                           ))}
                        </select>
                      </div>

                      <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3">
                         <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                         <p className="text-[10px] text-amber-800 font-bold leading-relaxed">
                            <span className="block mb-1 uppercase tracking-wider">Warning</span>
                            This will RE-GENERATE the selected scope. Existing entries for the affected classes will be replaced with new optimized assignments.
                         </p>
                      </div>

                      <div className="flex gap-3 pt-2">
                         <button 
                          onClick={() => setShowGenerateModal(false)}
                          disabled={isGenerating}
                          className="flex-1 py-4 text-xs font-black text-slate-400 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all uppercase tracking-widest"
                         >
                            Back
                         </button>
                         <button 
                          onClick={handleGenerate}
                          disabled={isGenerating}
                          className="flex-[2] py-4 text-xs font-black text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                         >
                            {isGenerating ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4" />
                                Generate Grid
                              </>
                            )}
                         </button>
                      </div>
                  </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
