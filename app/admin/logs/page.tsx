import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Log from "@/lib/models/Log";

export default async function AdminLogsPage() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") return <div>Unauthorized</div>;

  await connectToDatabase();
  const logs = await Log.find()
    .sort({ createdAt: -1 })
    .limit(100)
    .populate("userId", "name email")
    .lean();

  return (
    <div className="p-8 space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">System Logs</h1>
        <p className="text-gray-500 text-sm">Monitor system events and administrative actions.</p>
      </header>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-gray-50 border-b text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">Level</th>
                    <th className="px-6 py-4">Source</th>
                    <th className="px-6 py-4">Message</th>
                    <th className="px-6 py-4">User</th>
                </tr>
            </thead>
            <tbody className="divide-y text-sm font-mono">
                {logs.map((log: any) => (
                    <tr key={log._id.toString()} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                            {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                log.level === "ERROR" || log.level === "CRITICAL" ? 'bg-red-100 text-red-700' :
                                log.level === "WARNING" ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                                {log.level}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 font-bold uppercase text-[10px]">
                            {log.source}
                        </td>
                        <td className="px-6 py-4 text-gray-900 break-words max-w-md">
                            {log.message}
                            {log.metadata && (
                                <div className="mt-1 text-[10px] text-gray-400 bg-gray-50 p-2 rounded overflow-auto">
                                    {JSON.stringify(log.metadata)}
                                </div>
                            )}
                        </td>
                        <td className="px-6 py-4">
                            <div className="text-gray-900">{log.userId?.name || "System"}</div>
                            <div className="text-[10px] text-gray-500">{log.userId?.email || ""}</div>
                        </td>
                    </tr>
                ))}
                {logs.length === 0 && (
                    <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                            No system logs found. Administrative actions will appear here.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
}
