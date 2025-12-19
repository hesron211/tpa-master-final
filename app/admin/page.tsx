"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../lib/supabase";
// Tambahkan 'Users' di import icon
import { BookOpen, FileText, HelpCircle, Loader2, ChevronRight, BarChart, Users } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // State statistik (Ditambah 'users')
  const [stats, setStats] = useState({
    courses: 0,
    materials: 0,
    questions: 0,
    users: 0, 
  });

  useEffect(() => {
    // GANTI EMAIL INI DENGAN EMAIL ADMIN ANDA YANG SEBENARNYA
    const ADMIN_EMAIL = "tes@coba.com"; 

    const checkAdmin = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      // Cek apakah user login dan emailnya sesuai admin
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push("/"); 
        return;
      }

      // --- HITUNG DATA DARI 4 TABEL (Parallel Request) ---
      const [coursesCount, materialsCount, questionsCount, usersCount] = await Promise.all([
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('materials').select('*', { count: 'exact', head: true }),
        supabase.from('questions').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }), // Hitung user
      ]);

      setStats({
        courses: coursesCount.count || 0,
        materials: materialsCount.count || 0,
        questions: questionsCount.count || 0,
        users: usersCount.count || 0,
      });

      setLoading(false);
    };
    checkAdmin();
  }, [router]);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-brand-blue"/></div>;

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-2 font-heading">Dashboard Admin</h1>
        <p className="text-slate-500 mb-8">Selamat datang di pusat kontrol KelasFokus.</p>
        
        {/* --- BAGIAN 1: KARTU STATISTIK (4 KARTU) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {/* Kartu 1: User/Siswa */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
                <div className="p-4 bg-purple-100 text-purple-600 rounded-xl">
                    <Users size={28} />
                </div>
                <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Siswa</p>
                    <p className="text-3xl font-bold font-heading text-slate-800">{stats.users}</p>
                </div>
            </div>

            {/* Kartu 2: Mapel */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
                <div className="p-4 bg-blue-100 text-blue-600 rounded-xl">
                    <BookOpen size={28} />
                </div>
                <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Mapel Aktif</p>
                    <p className="text-3xl font-bold font-heading text-slate-800">{stats.courses}</p>
                </div>
            </div>

            {/* Kartu 3: Materi */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
                <div className="p-4 bg-orange-100 text-orange-600 rounded-xl">
                    <FileText size={28} />
                </div>
                <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Materi Belajar</p>
                    <p className="text-3xl font-bold font-heading text-slate-800">{stats.materials}</p>
                </div>
            </div>

            {/* Kartu 4: Soal */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
                <div className="p-4 bg-green-100 text-green-600 rounded-xl">
                    <HelpCircle size={28} />
                </div>
                <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Bank Soal</p>
                    <p className="text-3xl font-bold font-heading text-slate-800">{stats.questions}</p>
                </div>
            </div>
        </div>

        {/* --- BAGIAN 2: MENU UTAMA (3 KOLOM) --- */}
        <h2 className="text-xl font-bold text-slate-800 mb-6 font-heading flex items-center gap-2">
            <BarChart size={24} className="text-brand-accent"/> Menu Pengelolaan
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Menu 1: Kelola Materi */}
            <Link href="/admin/materi" className="group bg-white p-6 rounded-2xl border hover:border-brand-blue hover:shadow-lg transition-all flex flex-col justify-between h-full">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-4 bg-blue-50 text-brand-blue rounded-xl group-hover:bg-brand-blue group-hover:text-white transition-colors">
                        <FileText size={32} />
                    </div>
                    <ChevronRight className="text-slate-300 group-hover:text-brand-blue group-hover:translate-x-1 transition-transform"/>
                </div>
                <div>
                    <h3 className="text-lg font-bold font-heading text-slate-800">Materi & Video</h3>
                    <p className="text-slate-500 text-sm mt-1">Input materi bacaan dan link YouTube pembelajaran.</p>
                </div>
            </Link>

            {/* Menu 2: Kelola Soal */}
            <Link href="/admin/questions" className="group bg-white p-6 rounded-2xl border hover:border-brand-blue hover:shadow-lg transition-all flex flex-col justify-between h-full">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-4 bg-green-50 text-green-600 rounded-xl group-hover:bg-green-600 group-hover:text-white transition-colors">
                        <HelpCircle size={32} />
                    </div>
                    <ChevronRight className="text-slate-300 group-hover:text-brand-blue group-hover:translate-x-1 transition-transform"/>
                </div>
                <div>
                    <h3 className="text-lg font-bold font-heading text-slate-800">Bank Soal Ujian</h3>
                    <p className="text-slate-500 text-sm mt-1">Input soal pilihan ganda, gambar, kunci, dan pembahasan.</p>
                </div>
            </Link>

            {/* Menu 3: Kelola User (BARU) */}
            <Link href="/admin/users" className="group bg-white p-6 rounded-2xl border hover:border-brand-blue hover:shadow-lg transition-all flex flex-col justify-between h-full">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-4 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        <Users size={32} />
                    </div>
                    <ChevronRight className="text-slate-300 group-hover:text-brand-blue group-hover:translate-x-1 transition-transform"/>
                </div>
                <div>
                    <h3 className="text-lg font-bold font-heading text-slate-800">Data Siswa</h3>
                    <p className="text-slate-500 text-sm mt-1">Lihat daftar pengguna terdaftar dan waktu bergabung.</p>
                </div>
            </Link>

        </div>
      </div>
    </div>
  );
}