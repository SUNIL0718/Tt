"use client";

import { useState, useEffect } from "react";
import { createPeriodTiming } from "@/actions/period-timing";
import { useRouter } from "next/navigation";
import { 
  Clock, 
  Settings, 
  Coffee, 
  Calendar, 
  RefreshCw, 
  Save, 
  AlertCircle, 
  CheckCircle2,
  Trash2
} from "lucide-react";
import { generateSlots } from "@/lib/utils/time-slots";

export default function PeriodTimingForm() {
  const router = useRouter();
  const [name, setName] = useState("Regular Schedule");
  const [isDefault, setIsDefault] = useState(true);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("16:00");
  const [slotDuration, setSlotDuration] = useState(45);
  const [breakEnabled, setBreakEnabled] = useState(true);
  const [breakStartTime, setBreakStartTime] = useState("13:00");
  const [breakDuration, setBreakDuration] = useState(60);
  
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [lastGenerated, setLastGenerated] = useState<number>(0);

  // Auto-generate preview whenever inputs change
  useEffect(() => {
    handleGenerate();
  }, [startTime, endTime, slotDuration, breakEnabled, breakStartTime, breakDuration]);

  const handleGenerate = () => {
    console.log("Generating slots with:", { startTime, endTime, slotDuration, breakEnabled, breakStartTime, breakDuration });
    const generated = generateSlots(
      startTime,
      endTime,
      slotDuration,
      breakEnabled,
      breakStartTime,
      breakDuration
    );
    console.log("Generated slots:", generated.length);
    setSlots(generated);
    setLastGenerated(Date.now());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (slots.length === 0) {
        setMessage("Please generate valid slots first.");
        return;
    }
    
    setLoading(true);
    const result = await createPeriodTiming({ name, slots, isDefault });
    setLoading(false);
    
    if (result.success) {
        setMessage("Schedule saved successfully!");
        router.refresh();
    } else {
        setMessage(result.message || "Failed to save.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Configuration */}
      <form onSubmit={handleSubmit} className="lg:col-span-12 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Settings className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-slate-900">Timetable Configuration</h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-bold text-slate-700 mb-1.5 block">Schedule Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-slate-600"
                            placeholder="e.g. Regular Schedule"
                        />
                    </div>

                    <div className="space-y-4 pt-2">
                        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                            <Clock className="w-4 h-4 text-slate-400" />
                            Working Hours
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Start Time</label>
                                <div className="relative">
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">End Time</label>
                                <div className="relative">
                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <label className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-3">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            Lecture Slot Duration
                        </label>
                        <select 
                            value={slotDuration}
                            onChange={(e) => setSlotDuration(Number(e.target.value))}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-600 appearance-none bg-slate-50/50 cursor-pointer"
                        >
                            <option value={30}>30 Minutes</option>
                            <option value={40}>40 Minutes</option>
                            <option value={45}>45 Minutes</option>
                            <option value={50}>50 Minutes</option>
                            <option value={60}>1 Hour</option>
                        </select>
                    </div>

                    <div className="pt-4 border-t space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                                <Coffee className="w-4 h-4 text-slate-400" />
                                Lunch Break
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={breakEnabled} 
                                    onChange={(e) => setBreakEnabled(e.target.checked)}
                                    className="sr-only peer" 
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>

                        {breakEnabled && (
                            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Break Start</label>
                                    <div className="relative">
                                        <input
                                            type="time"
                                            value={breakStartTime}
                                            onChange={(e) => setBreakStartTime(e.target.value)}
                                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Duration</label>
                                    <select 
                                        value={breakDuration}
                                        onChange={(e) => setBreakDuration(Number(e.target.value))}
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm appearance-none bg-white cursor-pointer"
                                    >
                                        <option value={15}>15 Mins</option>
                                        <option value={20}>20 Mins</option>
                                        <option value={30}>30 Mins</option>
                                        <option value={45}>45 Mins</option>
                                        <option value={60}>1 Hour</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-3 pt-4 border-t">
                    <div className="flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={loading || slots.length === 0}
                            className="flex-1 bg-indigo-600 text-white rounded-xl py-3 font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {loading ? "Saving..." : "Save Configuration"}
                        </button>
                        <button
                            type="button"
                            onClick={handleGenerate}
                            className="bg-emerald-600 text-white rounded-xl py-3 px-6 font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Generate Grid
                        </button>
                    </div>
                    
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={isDefault}
                            onChange={(e) => setIsDefault(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span className="text-sm font-medium text-slate-500 group-hover:text-slate-700 transition-colors">Set as institution default</span>
                    </label>
                </div>
                
                {message && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 animate-in zoom-in duration-300 ${
                        message.includes("success") ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                        {message.includes("success") ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <p className="text-sm font-bold">{message}</p>
                    </div>
                )}
            </div>

            {/* Right Column: Preview */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-[500px]">
                <div className="flex items-center justify-between pb-4 border-b mb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Generated Time Slots</h3>
                            <div className="flex items-center gap-2">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total: {slots.length} slots</p>
                                {lastGenerated > 0 && (
                                    <p className="text-[10px] text-slate-300 font-medium">
                                        • Last generated {new Date(lastGenerated).toLocaleTimeString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                    {slots.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                                <Clock className="w-8 h-8 text-slate-200" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-400 text-sm">No slots generated yet</h4>
                                <p className="text-xs text-slate-300 mt-1">Save configuration and click "Generate Grid"</p>
                            </div>
                        </div>
                    ) : (
                        slots.map((slot, i) => (
                            <div 
                                key={i} 
                                className={`group p-4 rounded-xl border flex items-center justify-between transition-all hover:shadow-md ${
                                    slot.isBreak ? 'bg-amber-50 border-amber-100' : 'bg-white border-slate-100 hover:border-indigo-100'
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${
                                        slot.isBreak ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                                    }`}>
                                        {slot.isBreak ? <Coffee className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className={`text-sm font-bold ${slot.isBreak ? 'text-amber-700' : 'text-slate-900'}`}>
                                            {slot.label}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                            <span>{slot.startTime}</span>
                                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                            <span>{slot.endTime}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`text-[10px] font-black tracking-widest uppercase px-2 py-1 rounded-full ${
                                    slot.isBreak ? 'bg-amber-200/50 text-amber-700' : 'bg-slate-100 text-slate-500'
                                }`}>
                                    {Math.round((timeToMinutes(slot.endTime) - timeToMinutes(slot.startTime)))} Min
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      </form>
    </div>
  );
}

function timeToMinutes(time: string): number {
  if (!time) return 0;
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}
