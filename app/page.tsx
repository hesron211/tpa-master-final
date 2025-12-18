"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../lib/supabase";
import { Course } from "../types";
import { LogOut, BookOpen, Clock, BarChart3, ChevronRight, PlayCircle, Loader2 } from "lucide-react";
import BrandLogo from "../components/BrandLogo"; 

export default function Dashboard() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }
      setUserEmail(user.email || "");

      const { data } = await supabase.from('courses').select('*').order('id');
      if (data) setCourses(data);
      
      setLoading(false);
    };
    init();
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <Loader2 className="animate-spin text-brand-blue" size={40} />
        <p className="text-slate-500 font-medium font-heading animate-pulse">Memuat Kelas Fokus...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* HEADER BARU */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-20 flex justify-between items-center">
          {/* Panggil Logo Disini */}
          <BrandLogo />

          {/* User Info & Logout */}
          <div className="flex items-center gap-3 md:gap-6">
            <div className="hidden md:flex flex-col items-end">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Student</span>
                <span className="text-sm font-bold text-slate-800">{userEmail.split('@')[0]}</span>
            </div>
            <div className="h-8 w-[1px] bg-slate-200 hidden md:block"></div>
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-bold text-sm"
            >
              <LogOut size={18} />
              <span className="hidden md:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* KONTEN UTAMA */}
      <main className="max-w-5xl mx-auto px-4 py-10">
        
        {/* Banner Selamat Datang */}
        <div className="bg-gradient-to-br from-brand-blue to-brand-dark rounded-3xl p-8 md:p-12 text-white shadow-xl shadow-blue-200/50 mb-12 overflow-hidden relative">
            <div className="relative z-10 max-w-2xl">
                <h1 className="text-3xl md:text-4xl font-bold mb-4 font-heading leading-tight">
                    Siap Taklukkan TPA?
                </h1>
                <p className="text-blue-100 text-lg mb-8 leading-relaxed opacity-90">
                    Konsistensi adalah kunci. Pilih modul di bawah dan mulai fokus belajar hari ini.
                </p>
                <div className="flex flex-wrap gap-4">
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2">
                        <BookOpen size={18} className="text-brand-accent"/> {courses.length} Modul Tersedia
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2">
                        <BarChart3 size={18} className="text-brand-accent"/> Progress Tracker
                    </div>
                </div>
            </div>
            {/* Hiasan background abstrak */}
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-brand-accent/20 rounded-full blur-3xl"></div>
        </div>

        {/* Grid Modul Belajar */}
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-800 font-heading flex items-center gap-3">
                <div className="p-2 bg-brand-accent/10 rounded-lg text-brand-accent">
                    <PlayCircle size={24}/> 
                </div>
                Daftar Modul
            </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link 
              key={course.id} 
              href={`/exam/${course.id}`}
              className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-brand-blue hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 relative overflow-hidden flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors duration-300 shadow-sm">
                    <BookOpen size={28} />
                </div>
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 uppercase tracking-wide">
                    <Clock size={12}/> {course.duration_minutes} Menit
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 mb-3 font-heading group-hover:text-brand-blue transition-colors">
                {course.title}
              </h3>
              <p className="text-sm text-slate-500 mb-8 line-clamp-2 leading-relaxed">
                Latihan intensif dan pembahasan lengkap untuk materi {course.title}.
              </p>

              <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between text-brand-blue font-bold group-hover:translate-x-1 transition-transform">
                <span className="text-sm">Mulai Belajar</span>
                <ChevronRight size={18} />
              </div>
            </Link>
          ))}
        </div>
        
        {/* Footer */}
        <div className="mt-20 text-center">
            <p className="text-slate-400 text-sm font-medium">
                &copy; {new Date().getFullYear()} <span className="text-slate-600 font-bold">KelasFokus</span>. Learning Platform.
            </p>
        </div>

      </main>
    </div>
  );
}