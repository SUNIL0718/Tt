import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Organization from "@/lib/models/Organization";
import User from "@/lib/models/User";
import Teacher from "@/lib/models/Teacher";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") return <div>Unauthorized</div>;

  await connectToDatabase();

  const [orgCount, userCount, teacherCount] = await Promise.all([
    Organization.countDocuments(),
    User.countDocuments(),
    Teacher.countDocuments(),
  ]);

  const recentOrgs = await Organization.find().sort({ createdAt: -1 }).limit(5).lean();

  return (
    <div className="p-8 space-y-12">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">System Overview</h1>
        <p className="text-gray-500 mt-1">Global platform metrics and institutional growth.</p>
      </header>

      {/* Global Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Institutions" value={orgCount} color="blue" />
        <StatCard title="Total Users" value={userCount} color="purple" />
        <StatCard title="Total Teachers" value={teacherCount} color="orange" />
        <StatCard title="Est. Monthly Revenue" value="$4,250" color="green" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
          {/* Recent Organizations */}
          <div className="lg:col-span-2 bg-white rounded-2xl border shadow-sm overflow-hidden">
               <div className="p-6 border-b bg-gray-50 flex items-center justify-between">
                    <h2 className="font-bold text-gray-900">Recent Signups</h2>
                    <a href="/admin/organizations" className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All</a>
               </div>
               <div className="divide-y">
                    {recentOrgs.map((org: any) => (
                        <div key={org._id.toString()} className="p-4 flex items-center justify-between hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold uppercase">
                                    {org.name.substring(0, 1)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{org.name}</p>
                                    <p className="text-xs text-gray-500">{org.type} • {new Date(org.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${
                                org.subscriptionStatus === "ACTIVE" ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                                {org.subscriptionStatus}
                            </span>
                        </div>
                    ))}
               </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
                <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl">
                    <h2 className="font-bold mb-4">Maintenance Mode</h2>
                    <p className="text-sm text-slate-400 mb-6">Temporarily disable platform writes for all organizations during updates.</p>
                    <button className="w-full bg-slate-800 border border-slate-700 py-2.5 rounded-lg text-sm font-bold text-slate-300 hover:text-white transition-colors">
                        Enter Read-Only Mode
                    </button>
                </div>
          </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: number | string; color: string }) {
    const colors: Record<string, string> = {
        blue: "text-blue-600 bg-blue-50 border-blue-100",
        purple: "text-purple-600 bg-purple-50 border-purple-100",
        orange: "text-orange-600 bg-orange-50 border-orange-100",
        green: "text-green-600 bg-green-50 border-green-100",
    };
    return (
        <div className={`p-6 rounded-2xl border shadow-sm ${colors[color]}`}>
            <p className="text-xs font-bold uppercase tracking-widest opacity-70">{title}</p>
            <p className="text-3xl font-black mt-2">{value}</p>
        </div>
    );
}
