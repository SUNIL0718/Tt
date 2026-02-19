import { auth } from "@/lib/auth";
import { handleSignOut } from "@/actions/auth-actions";
import Link from "next/link";
import { redirect } from "next/navigation";
import Header from "@/components/layout/Header";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-white">
      {/* Sidebar */}
      <aside className="w-full flex-none md:w-64 bg-slate-900 text-white flex flex-col z-40">
        <div className="flex h-full flex-col px-3 py-4 md:px-2">
          {/* Logo Section */}
          <div className="p-4 mb-6">
            <Link href="/" className="flex items-center gap-2 mb-2">
              <div className="rounded-lg bg-indigo-600 p-1.5 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="3" x2="21" y1="10" y2="10" />
                  <line x1="9" x2="9" y1="4" y2="22" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight">TimetableAI</span>
            </Link>
            <div className="flex items-center gap-2 mt-4">
                <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-full ring-1 ring-inset ring-indigo-400/20">
                    Institution
                </span>
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-between overflow-hidden px-2">
            <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
              <NavLinks />
            </div>
            
            <div className="pt-4 mt-2 border-t border-slate-800 space-y-1 flex-none pb-4">
                {session.user.role === "SUPER_ADMIN" && (
                    <Link href="/admin" className="flex h-[44px] w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-blue-400 hover:bg-slate-800 hover:text-blue-300 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        <span>Admin Panel</span>
                    </Link>
                )}
                
                <form action={handleSignOut} className="w-full">
                  <button className="flex h-[44px] w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                    <span>Sign Out</span>
                  </button>
                </form>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0 bg-[#f8fbff]">
        <Header user={{ 
          name: session.user.name, 
          email: session.user.email, 
          role: session.user.role 
        }} />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function NavLinks() {
  const links = [
    { name: "Dashboard", href: "/dashboard", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg> },
    { name: "Teachers", href: "/dashboard/teachers", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { name: "Classes", href: "/dashboard/classes", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22s1-1 1-1 8-2 8-4h4c0 2 7 3 8 4 0 0 1 1 1 1"/><path d="M10 8V5c0-1.1.9-2 2-2s2 .9 2 2v3"/><rect width="16" height="10" x="4" y="8" rx="2"/></svg> },
    { name: "Subjects", href: "/dashboard/subjects", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></svg> },
    { name: "Departments", href: "/dashboard/departments", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H21l-1.45 2.9a2 2 0 0 1-1.79 1.1H6ZM2 22h20"/><path d="M9 10V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v5"/><path d="M11 22V10"/><path d="M15 22V10"/></svg> },
    { name: "Rooms", href: "/dashboard/rooms", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"/></svg> },
    { name: "Timetable", href: "/dashboard/timetable", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg> },
    { name: "Billing", href: "/dashboard/billing", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg> },
    { name: "Settings", href: "/dashboard/settings", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg> },
  ];

  return (
    <>
      {links.map((link) => {
        return (
          <Link
            key={link.name}
            href={link.href}
            className="flex h-[44px] grow items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors md:flex-none md:justify-start"
          >
            <span className="flex-none">{link.icon}</span>
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
