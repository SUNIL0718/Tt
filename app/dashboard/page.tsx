import { auth } from "@/lib/auth";
import { handleSignOut } from "@/actions/auth-actions";
import { redirect } from "next/navigation";
import connectToDatabase from "@/lib/db";
import Teacher from "@/lib/models/Teacher";
import Class from "@/lib/models/Class";
import Subject from "@/lib/models/Subject";
import Room from "@/lib/models/Room";
import Timetable from "@/lib/models/Timetable";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  
  await connectToDatabase();
  const orgId = session.user.organizationId?.toString();
  const isSuperAdmin = session.user.role === "SUPER_ADMIN";
  
  if (!isSuperAdmin && (!orgId || orgId === "[object Object]")) {
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-red-100 shadow-sm">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Session Error</h2>
            <p className="mt-2 text-gray-600 max-w-md">Your session has become corrupted or has expired. Please sign out and sign back in to continue.</p>
            <form action={handleSignOut} className="mt-6">
                <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                    Sign Out & Reset
                </button>
            </form>
        </div>
      );
  }

  // Construct a safe query filter
  const filter = (orgId && orgId !== "[object Object]") 
    ? { organizationId: orgId } 
    : (isSuperAdmin ? {} : { _id: null }); // Super Admins see global counts if no orgId

  const [teacherCount, classCount, subjectCount, roomCount, timetableCount] = await Promise.all([
    Teacher.countDocuments(filter),
    Class.countDocuments(filter),
    Subject.countDocuments(filter),
    Room.countDocuments(filter),
    Timetable.countDocuments(filter),
  ]);

  return (
    <main className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 font-medium">
          Welcome back, <span className="text-indigo-600 font-bold">{session.user.name || session.user.email?.split('@')[0]}</span>! Here&apos;s a summary of your institution.
        </p>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Card title="Total Teachers" value={teacherCount} color="blue" />
        <Card title="Total Classes" value={classCount} color="purple" />
        <Card title="Total Subjects" value={subjectCount} color="green" />
        <Card title="Total Rooms" value={roomCount} color="orange" />
        <Card title="Timetables" value={timetableCount} color="red" />
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
           <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">Quick Stats</h2>
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Welcome back! Your institution has <strong>{teacherCount}</strong> active staff members 
                        managing <strong>{classCount}</strong> classes.
                    </p>
                </div>
           </div>
           
           <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">Actions</h2>
                <div className="flex flex-wrap gap-3">
                    <a href="/dashboard/timetable" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                        Generate Grid
                    </a>
                    <a href="/dashboard/settings" className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">
                        Manage Timings
                    </a>
                </div>
           </div>
      </div>
    </main>
  );
}

function Card({ title, value, color }: { title: string; value: number | string; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
    green: "bg-green-50 text-green-700 border-green-100",
    orange: "bg-orange-50 text-orange-700 border-orange-100",
    red: "bg-red-50 text-red-700 border-red-100",
  };

  return (
    <div className={`rounded-xl border p-6 shadow-sm ${colors[color] || colors.blue}`}>
      <h3 className="text-sm font-medium opacity-80">{title}</h3>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}
