"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Clock, ArrowRight, Library, Loader2, User, LogOut } from "lucide-react";
import { createClient } from "../lib/supabase";
import { Course } from "../types";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      
      // 1. Cek User Login
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // 2. Ambil Kursus
      const { data } = await supabase.from('courses').select('*').order('id');
      if (data) setCourses(data);
      
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="font-bold text-xl text-blue-600 flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          E-Learning TPA/TBI
        </div>
        
        {/* Logic Tombol Login/Logout */}
        {loading ? (
          <div className="w-20 h-8 bg-slate-100 animate-pulse rounded"></div>
        ) : user ? (
          <div className="flex items-center gap-4">
            <Link href="/profile" className="flex items-center gap-2 group cursor-pointer">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
                <User size={16} />
              </div>
              <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 hidden md:block transition">
                Halo, {user.email?.split('@')[0]}
              </span>
            </Link>
          </div>
        ) : (
          <Link href="/login" className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition shadow-lg shadow-blue-200">
            Masuk Akun
          </Link>
        )}
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-12 md:py-20 text-center bg-blue-600 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Siapkan Dirimu Menembus Batas
          </h1>
          <p className="text-blue-100 max-w-2xl mx-auto text-lg mb-8 leading-relaxed">
            Platform belajar mandiri dengan materi video, modul lengkap, dan simulasi CAT (Computer Assisted Test) sesuai standar terbaru.
          </p>
          {!user && (
             <Link href="/login" className="inline-block bg-white text-blue-600 px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition hover:scale-105">
               Daftar Gratis Sekarang
             </Link>
          )}
        </div>
      </section>

      {/* Daftar Kursus */}
      <section className="max-w-6xl mx-auto px-6 py-16 -mt-10 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
          <div className="flex items-center gap-3 mb-8">
            <Library className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-800">Pilih Materi Belajar</h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin w-8 h-8 text-blue-600" /></div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="group relative bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg hover:border-blue-300 transition-all flex flex-col">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>
                    <div className="flex gap-4 mt-3 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {course.duration_minutes} Menit
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {course.question_count} Soal
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-slate-100 flex gap-2">
                    {/* BAGIAN INI YANG SUDAH DIPERBAIKI (Jadi Link ke /learn) */}
                    <Link 
                      href={`/learn/${course.id}`}
                      className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-200 transition text-center flex items-center justify-center"
                    >
                      Materi
                    </Link>
                    
                    <Link 
                      href={user ? `/exam/${course.id}` : "/login"} 
                      className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                    >
                      Ujian CAT <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}