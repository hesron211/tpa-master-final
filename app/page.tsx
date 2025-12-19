"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase";
import { 
  LogOut, 
  BookOpen, 
  Clock, 
  PlayCircle, 
  Loader2, 
  FileText, 
  HelpCircle 
} from "lucide-react";
import Link from "next/link";

// --- DEFINISI TIPE DATA LOKAL ---
// Kita taruh sini agar tidak error saat build jika file types global belum update
interface Course {
  id: number;
  title: string;
  slug: string;
  image_url: string | null;
  category?: string; // Tanda tanya (?) berarti opsional, menghindari error
  created_at?: string;
}

// --- KAMUS ATURAN DURASI UJIAN (HARDCODED) ---
// Sistem akan mencocokkan Judul Mapel dengan aturan ini.
const EXAM_RULES: Record<string, number> = {
  "TPA Verbal": 40,
  "TPA Numerikal": 40,
  "TPA Figural": 35,
  "TBI Structure": 25,
  "TBI Reading": 35,
};

// Durasi Default jika nama mapel tidak ada di daftar
const DEFAULT_DURATION = 30; 

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk menyimpan statistik per Mapel
  const [stats, setStats] = useState<Record<number, { 
    matCount: number, 
    vidCount: number, 
    qCount: number 
  }>>({});

  const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80";

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      
      // 1. Cek User
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      
      setUser({ ...user, full_name: user.user_metadata?.full_name || "Siswa" });

      // 2. Ambil Mapel
      const { data: coursesData } = await supabase
        .from('courses')
        .select('*')
        .order('id');
      
      if (coursesData) {
        setCourses(coursesData);
      }

      // 3. HITUNG STATISTIK (Materi, Video, Soal)
      // Kita ambil semua data ID dan course_id saja (ringan) untuk dihitung di JS
      const { data: allMats } = await supabase.from('materials').select('course_id, video_url');
      const { data: allQs } = await supabase.from('questions').select('course_id');

      // Proses Hitung
      const newStats: any = {};
      
      if (coursesData) {
        coursesData.forEach((c: Course) => {
            // Filter materi milik mapel ini
            const cMats = allMats?.filter((m: any) => m.course_id === c.id) || [];
            // Filter soal milik mapel ini
            const cQs = allQs?.filter((q: any) => q.course_id === c.id) || [];

            newStats[c.id] = {
                matCount: cMats.length, // Total Materi
                vidCount: cMats.filter((m:any) => m.video_url).length, // Total yang ada videonya
                qCount: cQs.length // Total Soal Aktual di Database
            };
        });
      }
      setStats(newStats);
      
      setLoading(false);
    };

    init();
  }, [router]);

  // Fungsi Helper untuk Mendapatkan Durasi Ujian
  const getExamDuration = (title: string) => {
    // Cari apakah judul mapel mengandung kata kunci dari aturan
    const key = Object.keys(EXAM_RULES).find(k => title.includes(k));
    return key ? EXAM_RULES[key] : DEFAULT_DURATION;
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-brand-blue" size={40} /></div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* HEADER */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-brand-blue text-white p-1.5 rounded-lg font-bold text-xl font-heading shadow-md">K</div>
            <span className="font-heading font-bold text-slate-800 text-lg hidden md:block">KelasFokus</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/profile" className="flex items-center gap-3 hover:bg-slate-100 p-2 rounded-xl transition-all group cursor-pointer">
                <div className="text-right hidden md:block">
                    <p className="text-sm font-bold text-slate-700 group-hover:text-brand-blue transition-colors">{user?.full_name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Kelola Akun</p>
                </div>
                <div className="w-10 h-10 bg-brand-blue text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md ring-2 ring-white group-hover:ring-blue-100 transition-all">
                    {user?.email?.charAt(0).toUpperCase()}
                </div>
            </Link>
            <button onClick={handleLogout} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><LogOut size={20} /></button>
          </div>
        </div>
      </header>

      {/* KONTEN UTAMA */}
      <main className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-brand-blue to-brand-dark rounded-3xl p-6 md:p-10 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
            <div className="relative z-10">
                <h1 className="text-2xl md:text-4xl font-bold font-heading mb-2">Halo, {user?.full_name}! 👋</h1>
                <p className="text-blue-100 text-sm md:text-base max-w-lg">
                    Siap untuk belajar hari ini? Pilih materi di bawah dan mulai tingkatkan skor TPA Anda.
                </p>
            </div>
            <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        </div>

        {/* Daftar Mapel */}
        <div>
            <h2 className="text-xl font-bold text-slate-800 mb-6 font-heading flex items-center gap-2">
                <BookOpen className="text-brand-accent"/> Materi Pelajaran
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.length === 0 ? (
                    <div className="col-span-full text-center py-10 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-400">
                        Belum ada materi pelajaran yang tersedia.
                    </div>
                ) : (
                    courses.map((course) => {
                        const s = stats[course.id] || { matCount: 0, vidCount: 0, qCount: 0 };
                        const duration = getExamDuration(course.title); // Ambil Durasi Sesuai Aturan

                        return (
                            <div key={course.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full group">
                                
                                {/* Gambar Thumbnail */}
                                <div className="h-40 bg-slate-200 relative overflow-hidden">
                                    <img 
                                        src={course.image_url ? course.image_url : DEFAULT_IMAGE} 
                                        onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_IMAGE; }}
                                        alt={course.title} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <span className="absolute bottom-3 left-3 text-white text-xs font-bold px-2 py-1 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                                        {/* INI YANG SEBELUMNYA ERROR, SEKARANG AMAN */}
                                        {course.category || "Umum"}
                                    </span>
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="font-bold text-lg text-slate-800 mb-2 font-heading line-clamp-1" title={course.title}>
                                        {course.title}
                                    </h3>
                                    
                                    {/* --- INFORMASI STATISTIK CARD --- */}
                                    <div className="flex-1 space-y-3 mb-6">
                                        
                                        {/* Baris 1: Statistik Materi */}
                                        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                            <div className="flex items-center gap-1">
                                                <FileText size={14} className="text-brand-blue"/> 
                                                <span className="font-bold text-slate-700">{s.matCount}</span> Materi
                                            </div>
                                            <span className="text-slate-300">|</span>
                                            <div className="flex items-center gap-1">
                                                <PlayCircle size={14} className="text-red-500"/> 
                                                <span className="font-bold text-slate-700">{s.vidCount}</span> Video
                                            </div>
                                        </div>

                                        {/* Baris 2: Statistik Ujian */}
                                        <div className="flex items-center justify-between text-xs text-slate-500 bg-orange-50 p-2 rounded-lg border border-orange-100">
                                            <div className="flex items-center gap-1 text-orange-700 font-bold">
                                                <HelpCircle size={14}/> {s.qCount} Soal
                                            </div>
                                            <div className="flex items-center gap-1 text-orange-700 font-bold">
                                                <Clock size={14}/> {duration} Menit
                                            </div>
                                        </div>

                                    </div>

                                    {/* Tombol Aksi */}
                                    <div className="flex gap-2 mt-auto">
                                        <Link href={`/learn/${course.id}`} className="flex-1 text-center py-2.5 bg-brand-blue text-white rounded-xl font-bold text-xs md:text-sm hover:bg-brand-dark transition-colors shadow-lg shadow-blue-100 flex items-center justify-center gap-1">
                                            <BookOpen size={16}/> Materi
                                        </Link>
                                        <Link href={`/exam/${course.id}`} className="flex-1 text-center py-2.5 bg-white text-brand-blue border border-brand-blue rounded-xl font-bold text-xs md:text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-1">
                                            <Clock size={16}/> Ujian
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
      </main>
    </div>
  );
}