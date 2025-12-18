"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../../lib/supabase";
import { Course } from "../../../types";
import { ChevronLeft, PlayCircle, FileText, Loader2 } from "lucide-react";
import MarkdownText from "../../../components/MarkdownText";

// Definisikan tipe Materi disini karena belum ada di types global
type Material = {
  id: number;
  title: string;
  content: string;
  video_url?: string;
};

export default function LearningPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId;

  const [course, setCourse] = useState<Course | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMat, setActiveMat] = useState<Material | null>(null);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      
      // Cek Login
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      // Ambil Info Mapel
      const { data: courseData } = await supabase.from('courses').select('*').eq('id', courseId).single();
      setCourse(courseData);

      // Ambil Materi
      const { data: matData } = await supabase.from('materials').select('*').eq('course_id', courseId).order('id');
      if (matData && matData.length > 0) {
        setMaterials(matData);
        setActiveMat(matData[0]); // Buka materi pertama otomatis
      }
      setLoading(false);
    };
    init();
  }, [courseId, router]);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-brand-blue"/></div>;
  if (!course) return <div className="p-10 text-center">Kursus tidak ditemukan.</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* SIDEBAR DAFTAR MATERI */}
      <aside className="w-full md:w-80 bg-white border-r h-auto md:h-screen overflow-y-auto sticky top-0">
        <div className="p-4 border-b">
            <Link href="/" className="flex items-center text-sm text-slate-500 hover:text-brand-blue mb-4">
                <ChevronLeft size={16}/> Kembali ke Dashboard
            </Link>
            <h2 className="font-bold text-lg font-heading text-slate-800">{course.title}</h2>
            <p className="text-xs text-slate-500">Daftar Materi Belajar</p>
        </div>
        <div className="p-2 space-y-1">
            {materials.length === 0 && <p className="text-sm text-slate-400 p-4 text-center">Belum ada materi.</p>}
            {materials.map((m, idx) => (
                <button 
                    key={m.id} 
                    onClick={() => setActiveMat(m)}
                    className={`w-full text-left p-3 rounded-lg text-sm flex items-start gap-3 transition-colors ${activeMat?.id === m.id ? 'bg-brand-blue text-white font-bold shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                    <div className="mt-0.5">{m.video_url ? <PlayCircle size={16}/> : <FileText size={16}/>}</div>
                    <span>{idx + 1}. {m.title}</span>
                </button>
            ))}
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <main className="flex-1 p-4 md:p-8 h-auto md:h-screen overflow-y-auto">
        {activeMat ? (
            <div className="max-w-3xl mx-auto space-y-6">
                
                {/* Judul Materi */}
                <h1 className="text-2xl md:text-3xl font-bold font-heading text-slate-800 border-b pb-4">
                    {activeMat.title}
                </h1>

                {/* Video Player (Jika ada) */}
                {activeMat.video_url && (
                    <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-lg">
                        <iframe 
                            width="100%" height="100%" 
                            src={activeMat.video_url} 
                            title={activeMat.title} 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                        ></iframe>
                    </div>
                )}

                {/* Teks Materi */}
                {activeMat.content && (
                    <div className="bg-white p-6 md:p-8 rounded-2xl border shadow-sm prose prose-blue max-w-none">
                        <MarkdownText content={activeMat.content} />
                    </div>
                )}

                {/* Tombol Lanjut Ujian */}
                <div className="pt-10 flex justify-end">
                    <Link 
                        href={`/exam/${courseId}`} 
                        className="px-6 py-3 bg-brand-accent text-white font-bold rounded-xl shadow-lg hover:shadow-orange-200 hover:-translate-y-1 transition-all flex items-center gap-2"
                    >
                        Sudah Paham? Lanjut Latihan Soal <ChevronLeft className="rotate-180" size={20}/>
                    </Link>
                </div>
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <FileText size={48} className="mb-4 opacity-20"/>
                <p>Pilih materi di samping untuk mulai belajar.</p>
            </div>
        )}
      </main>

    </div>
  );
}