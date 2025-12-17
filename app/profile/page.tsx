"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase";
import { ArrowLeft, User, History, Calendar, Award, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

// Tipe data gabungan (Hasil Ujian + Nama Kursus)
type ExamHistory = {
  id: number;
  created_at: string;
  score: number;
  course_id: number;
  courses: {
    title: string;
    question_count: number;
  };
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [history, setHistory] = useState<ExamHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      
      // 1. Cek User
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      // 2. Ambil Riwayat Ujian (Join dengan tabel courses)
      // Kita ambil data exam_results, DAN minta data 'title' dari tabel courses yang terhubung
      const { data, error } = await supabase
        .from('exam_results')
        .select(`
          id,
          created_at,
          score,
          course_id,
          courses (
            title,
            question_count
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }); // Yang terbaru di atas

      if (!error && data) {
        // @ts-ignore (Supabase type inference kadang butuh setup ribet, kita ignore dulu biar jalan)
        setHistory(data);
      }
      setLoading(false);
    };

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center bg-slate-50">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Tombol Kembali */}
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold mb-6 transition">
          <ArrowLeft size={20} /> Kembali ke Dashboard
        </Link>

        <div className="grid md:grid-cols-3 gap-6">
          
          {/* KARTU PROFIL (KIRI) */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 text-center sticky top-10">
              <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User size={40} />
              </div>
              <h2 className="font-bold text-slate-800 break-all">{user?.email}</h2>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide">Member TPA Master</p>
              
              <div className="mt-6 pt-6 border-t border-slate-100">
                <button 
                  onClick={handleLogout}
                  className="w-full py-2 bg-red-50 text-red-600 rounded-lg font-bold hover:bg-red-100 transition flex items-center justify-center gap-2"
                >
                  <LogOut size={16} /> Keluar Akun
                </button>
              </div>
            </div>
          </div>

          {/* KARTU RIWAYAT (KANAN) */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                <History className="text-blue-600" />
                <h2 className="font-bold text-lg text-slate-800">Riwayat Tryout</h2>
              </div>
              
              {history.length === 0 ? (
                <div className="p-10 text-center text-slate-500">
                  <p>Kamu belum mengerjakan tryout apapun.</p>
                  <Link href="/" className="text-blue-600 font-bold mt-2 inline-block hover:underline">Mulai Ujian Sekarang</Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {history.map((item) => (
                    <div key={item.id} className="p-6 hover:bg-slate-50 transition flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      
                      {/* Info Mapel */}
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg mb-1">{item.courses?.title || "Ujian Terhapus"}</h3>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} /> 
                            {new Date(item.created_at).toLocaleDateString('id-ID', { 
                              day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Skor */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="block text-xs text-slate-400 uppercase font-bold">Skor Kamu</span>
                          <span className={`text-2xl font-extrabold ${item.score > 50 ? 'text-green-600' : 'text-blue-600'}`}>
                            {item.score}
                          </span>
                        </div>
                        {item.score > 50 && (
                           <Award className="text-yellow-500 w-8 h-8" />
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}