import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import PeriodTiming from "@/lib/models/PeriodTiming";
import PeriodTimingForm from "@/components/timetable/period-timing-form";
import { deletePeriodTiming, setDefaultPeriodTiming } from "@/actions/period-timing";
import { Clock, Calendar, Trash2, CheckCircle } from "lucide-react";

async function deleteTimingAction(id: string) {
    "use server";
    await deletePeriodTiming(id);
}

async function setDefaultTimingAction(id: string) {
    "use server";
    await setDefaultPeriodTiming(id);
}

export default async function SettingsPage() {
  const session = await auth();
  const orgId = session?.user?.organizationId?.toString();
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
  
  if (!isSuperAdmin && (!orgId || orgId === "[object Object]")) {
    return <div>Unauthorized: No organization linked to your account.</div>;
  }

  await connectToDatabase();
  const filter = (orgId && orgId !== "[object Object]") ? { organizationId: orgId } : {};
  const timings = await PeriodTiming.find(filter).lean();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Timetable Setup</h1>
        <p className="text-slate-500 font-medium">Configure your institution&apos;s working hours, lecture slots, and break timings</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12">
          <PeriodTimingForm />
        </div>

        <div className="lg:col-span-12">
          <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-slate-200" />
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Stored Schedules</h2>
              <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {timings.length === 0 ? (
              <div className="col-span-full py-12 flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="w-8 h-8 text-slate-200" />
                </div>
                <p className="text-slate-400 font-bold italic">No schedules defined yet.</p>
              </div>
            ) : (
                timings.map((timing: any) => (
                    <div key={timing._id.toString()} className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div className="space-y-1">
                                <h3 className="font-black text-slate-900 flex items-center gap-2">
                                    {timing.name}
                                    {timing.isDefault && (
                                        <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-black tracking-widest uppercase">Default</span>
                                    )}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                                    <Clock className="w-3 h-3" />
                                    {timing.slots.length} Slots Detected
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {!timing.isDefault && (
                                    <form action={setDefaultTimingAction.bind(null, timing._id.toString())}>
                                        <button className="p-2 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all" title="Set as Default">
                                            <CheckCircle className="w-4 h-4" />
                                        </button>
                                    </form>
                                )}
                                <form action={deleteTimingAction.bind(null, timing._id.toString())}>
                                    <button className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete Schedule">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </form>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                <span>Day Start</span>
                                <span>Day End</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-slate-50 p-2 rounded-lg text-center font-bold text-slate-600 text-sm">
                                    {timing.slots[0]?.startTime}
                                </div>
                                <div className="w-4 h-px bg-slate-200" />
                                <div className="flex-1 bg-slate-50 p-2 rounded-lg text-center font-bold text-slate-600 text-sm">
                                    {timing.slots[timing.slots.length - 1]?.endTime}
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
