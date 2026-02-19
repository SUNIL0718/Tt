import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Timetable from "@/lib/models/Timetable";
import PeriodTiming, { IPeriodTiming } from "@/lib/models/PeriodTiming";
import { deleteTimetable } from "@/actions/timetable";
import Link from "next/link";
import { 
  Clock, 
  Calendar, 
  Zap, 
  ChevronRight, 
  Trash2, 
  Layout, 
  Sparkles,
  Info
} from "lucide-react";
import { GenerateTimetableButton } from "@/components/timetable/generate-timetable-button";

async function deleteTimetableAction(id: string) {
    "use server";
    await deleteTimetable(id);
}

export default async function TimetablePage() {
  const session = await auth();
  const orgId = session?.user?.organizationId?.toString();
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
  
  if (!isSuperAdmin && (!orgId || orgId === "[object Object]")) {
    return (
        <div className="flex h-[400px] flex-col items-center justify-center p-8 bg-white rounded-3xl border-2 border-dashed border-slate-100 italic text-slate-400 font-medium">
            Unauthorized: No organization linked to your account.
        </div>
    );
  }

  await connectToDatabase();
  const filter = (orgId && orgId !== "[object Object]") ? { organizationId: orgId } : {};
  
  const [timetables, timingResult] = await Promise.all([
    Timetable.find(filter).sort({ createdAt: -1 }).lean(),
    PeriodTiming.findOne({ organizationId: orgId, isDefault: true }).lean()
  ]);

  const timing = timingResult as unknown as IPeriodTiming;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Grids</h1>
            <p className="text-slate-500 font-medium">Generate and manage institution-wide grids with AI optimization</p>
        </div>
        <GenerateTimetableButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: List or Empty State */}
        <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="h-px flex-1 bg-slate-100" />
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Generated Schedules</h2>
                <div className="h-px flex-1 bg-slate-100" />
            </div>

            {timetables.length === 0 ? (
                <div className="group relative overflow-hidden bg-white p-12 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col items-center text-center">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                    <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                        <Sparkles className="w-10 h-10 text-indigo-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Ready to generate?</h3>
                    <p className="text-slate-500 max-w-sm font-medium mb-8">No timetables have been created yet. Our AI is ready to optimize your first schedule!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {timetables.map((tt: any) => (
                        <div key={tt._id.toString()} className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all duration-300 flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{tt.name}</h3>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        <Calendar className="w-3 h-3" />
                                        Year {tt.year}
                                    </div>
                                </div>
                                <span className={`px-3 py-1 text-[9px] font-black rounded-full uppercase tracking-widest ${
                                    tt.isPublished 
                                    ? "bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-100" 
                                    : "bg-amber-50 text-amber-600 ring-1 ring-inset ring-amber-100"
                                }`}>
                                    {tt.isPublished ? "Published" : "Draft"}
                                </span>
                            </div>

                            <div className="mt-auto flex items-center gap-3">
                                <Link 
                                    href={`/dashboard/timetable/${tt._id.toString()}`}
                                    className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-2xl text-xs font-black hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 hover:shadow-indigo-200"
                                >
                                    <Layout className="w-3.5 h-3.5" />
                                    Open Grid
                                </Link>
                                <form action={deleteTimetableAction.bind(null, tt._id.toString())}>
                                    <button className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </form>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Right Column: Configuration Preview (The "Grid" the user asked for) */}
        <div className="lg:col-span-4">
            <div className="sticky top-6 space-y-6">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Active Grid Template</h2>
                    <Link href="/dashboard/settings" className="text-[10px] font-black text-indigo-500 hover:text-indigo-600 flex items-center gap-1 uppercase tracking-wider">
                        Edit <ChevronRight className="w-3 h-3" />
                    </Link>
                </div>

                {timing ? (
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 bg-slate-50 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 text-white">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 leading-tight">{timing.name}</h4>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Using Institution Default</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-2 space-y-1">
                            {timing.slots.map((slot: any, idx: number) => (
                                <div 
                                    key={idx} 
                                    className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                                        slot.isBreak 
                                        ? 'bg-amber-50/50 text-amber-700' 
                                        : 'hover:bg-slate-50 text-slate-600'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black ${
                                            slot.isBreak ? 'bg-amber-100' : 'bg-slate-100'
                                        }`}>
                                            {idx + 1}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black">{slot.label}</span>
                                            <span className="text-[10px] opacity-60 font-bold">{slot.startTime} - {slot.endTime}</span>
                                        </div>
                                    </div>
                                    {slot.isBreak && <Layout className="w-3 h-3 opacity-40" />}
                                </div>
                            ))}
                        </div>

                        <div className="p-6 bg-indigo-50/30 border-t border-indigo-50">
                            <div className="flex gap-2 text-indigo-700">
                                <Info className="w-4 h-4 flex-shrink-0" />
                                <p className="text-[10px] font-bold leading-relaxed">
                                    This grid definition will be used for all new AI-generated timetables.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-amber-50 p-8 rounded-[2rem] border border-amber-100 text-center">
                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600">
                            <Zap className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-amber-800 mb-2">No Configuration</h4>
                        <p className="text-xs text-amber-700/70 font-medium mb-4">Please set up your period timings in settings before generating.</p>
                        <Link 
                            href="/dashboard/settings"
                            className="inline-block bg-amber-600 text-white px-6 py-2 rounded-xl text-xs font-black hover:bg-amber-700 transition-all"
                        >
                            Go to Settings
                        </Link>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
