"use client";

import { usePathname } from "next/navigation";

interface HeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
}

export default function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  
  // Map pathnames to titles
  const getTitle = (path: string) => {
    if (path === "/dashboard") return "Dashboard";
    if (path.startsWith("/dashboard/teachers")) return "Teachers";
    if (path.startsWith("/dashboard/classes")) return "Classes";
    if (path.startsWith("/dashboard/subjects")) return "Subjects";
    if (path.startsWith("/dashboard/rooms")) return "Rooms";
    if (path.startsWith("/dashboard/assignments")) return "Assignments";
    if (path.startsWith("/dashboard/constraints")) return "Constraints";
    if (path.startsWith("/dashboard/timetable")) return "Timetable";
    if (path.startsWith("/dashboard/billing")) return "Billing";
    if (path.startsWith("/dashboard/settings")) return "Settings";
    if (path === "/admin") return "Admin Dashboard";
    if (path.startsWith("/admin/organizations")) return "Organizations";
    if (path.startsWith("/admin/logs")) return "System Logs";
    return "Dashboard";
  };

  const title = getTitle(pathname);
  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : "U");
  const userName = user.name || user.email?.split("@")[0] || "User";

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm shadow-gray-200/50">
      <h1 className="text-xl font-bold text-slate-800">{title}</h1>
      
      <div className="flex items-center gap-6">
        {/* Notification Icon */}
        <button className="relative p-2 text-slate-400 hover:text-indigo-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          <span className="absolute top-2 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Divider */}
        <div className="h-8 w-[1px] bg-gray-100"></div>

        {/* User Info */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800 leading-none mb-1">{userName}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{user.role?.replace("_", " ") || "Admin"}</p>
          </div>
          
          <div className="h-10 w-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold shadow-sm">
            {userInitial}
          </div>
        </div>
      </div>
    </header>
  );
}
