"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase"; // Pastikan path ini sesuai struktur folder Anda
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Ticket, 
  LogOut, 
  Menu, 
  X,
  GraduationCap
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Logika Highlight Menu:
  // 1. Jika menu Dashboard (/admin), harus persis sama.
  // 2. Jika menu lain (misal /admin/courses), highlight juga jika membuka sub-halaman (misal /admin/courses/create)
  const isActive = (path: string) => {
    if (path === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(path);
  };

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: "Materi & Soal", // Digabung agar rapi
      href: "/admin/courses",
      icon: <BookOpen size={20} />,
    },
    {
      label: "Data Siswa",
      href: "/admin/users",
      icon: <Users size={20} />,
    },
    {
      label: "Manajemen Voucher",
      href: "/admin/vouchers",
      icon: <Ticket size={20} />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex text-slate-800">
      
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside 
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 z-30 transition-transform duration-300 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } flex flex-col shadow-sm`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-600">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center shadow-md">
                    <GraduationCap size={20} />
                </div>
                <span className="font-bold text-lg text-slate-800 tracking-tight">Admin Panel</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-slate-600">
                <X size={20}/>
            </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                        isActive(item.href)
                        ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                >
                    {item.icon}
                    {item.label}
                </Link>
            ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-100">
            <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 text-red-500 font-medium hover:bg-red-50 rounded-xl transition-colors"
            >
                <LogOut size={20} />
                Keluar
            </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile Header */}
        <header className="bg-white border-b border-slate-200 p-4 md:hidden flex items-center gap-4 sticky top-0 z-10">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                <Menu size={20}/>
            </button>
            <span className="font-bold text-slate-800">KelasFokus Admin</span>
        </header>

        {/* Content Render Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
            {children}
        </main>

      </div>
    </div>
  );
}