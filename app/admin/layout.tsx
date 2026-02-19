import { auth } from "@/lib/auth";
import { handleSignOut } from "@/actions/auth-actions";
import Link from "next/link";
import { redirect } from "next/navigation";
import Header from "@/components/layout/Header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (session?.user?.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const navLinks = [
    { name: "Dashboard", href: "/admin" },
    { name: "Organizations", href: "/admin/organizations" },
    { name: "System Logs", href: "/admin/logs" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col z-40">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 mb-2">
            <div className="rounded-lg bg-indigo-600 p-1.5 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="3" x2="21" y1="10" y2="10" /><line x1="9" x2="9" y1="4" y2="22" /></svg>
            </div>
            <span className="text-lg font-bold tracking-tight">TimetableAI</span>
          </Link>
          <div className="mt-4">
            <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full ring-1 ring-inset ring-blue-400/20">
              Super Admin
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto custom-scrollbar">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2 flex-none pb-6">
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
                Back to Dashboard
            </Link>
            <form action={handleSignOut} className="w-full">
              <button className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                <span>Sign Out</span>
              </button>
            </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0 bg-[#f8fbff]">
        <Header user={{ 
          name: session?.user?.name, 
          email: session?.user?.email, 
          role: session?.user?.role 
        }} />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
