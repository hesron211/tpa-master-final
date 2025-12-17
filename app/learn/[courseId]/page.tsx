"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../../lib/supabase";
import { Course } from "../../../types";
import MarkdownText from "../../../components/MarkdownText";
import { ChevronLeft, PlayCircle, FileText, ArrowRight, Loader2 } from "lucide-react";

// Tipe data Materi
type Material = {
  id: number;
  title: string;
  video_url: string;
  content: string;
};

export default function LearnPage() {
  const params = useParams();
  const courseId = params.courseId;

  const [course, setCourse] = useState<Course | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk memilih materi mana yang sedang dibuka (default materi pertama)
  const [activeMaterial, setActiveMaterial] = useState<Material | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!courseId) return;
      const supabase = createClient();

      // 1. Ambil Info Kursus
      const { data: courseData } = await supabase.from('courses').select('*').eq('id', courseId).single();
      setCourse(courseData);

      // 2. Ambil Materi Belajar
      const { data: matData } = await supabase.from('materials').select('*').eq('course_id', courseId).order('id');
      
      if (matData && matData.length > 0) {
        setMaterials(matData);
        setActiveMaterial(matData[0]); // Buka materi pertama otomatis
      }
      
      setLoading(false);
    };

    fetchData();
  }, [courseId]);

  if (loading) return <div className="min-h-screen flex justify-center items-center"><Loader2 className="animate-spin text-blue-600 w-10 h-10"/></div>;

  if (!materials.length) return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 text-center p-4">
      <p className="text-slate-500 font-medium mb-4">Belum ada materi untuk kursus ini.</p>
      <Link href="/" className="text-blue-600 font-bold hover:underline">Kembali ke Dashboard</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* SIDEBAR DAFTAR MATERI (KIRI) */}
      <aside className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col h-auto md:h-screen sticky top-0">
        <div className="p-6 border-b border-slate-100">
            <Link href="/" className="text-slate-500 hover:text-blue-600 flex items-center gap-2 text-sm font-bold mb-4">
                <ChevronLeft size={16}/> Dashboard
            </Link>
            <h1 className="font-bold text-xl text-slate-800">{course?.title}</h1>
            <p className="text-xs text-slate-400 mt-1">{materials.length} Modul Pembelajaran</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {materials.map((mat, idx) => (
                <button 
                    key={mat.id}
                    onClick={() => setActiveMaterial(mat)}
                    className={`w-full text-left p-4 rounded-xl text-sm font-medium transition flex items-start gap-3
                        ${activeMaterial?.id === mat.id ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'text-slate-600 hover:bg-slate-50 border border-transparent'}
                    `}
                >
                    <div className={`mt-0.5 min-w-[24px] h-6 rounded-full flex items-center justify-center text-xs border ${activeMaterial?.id === mat.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-300'}`}>
                        {idx + 1}
                    </div>
                    <span>{mat.title}</span>
                </button>
            ))}
        </div>

        {/* Tombol Lanjut Ujian di Bawah Sidebar */}
        <div className="p-4 border-t border-slate-100">
            <Link 
                href={`/exam/${courseId}`} 
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-100"
            >
                Lanjut Ujian CAT <ArrowRight size={16}/>
            </Link>
        </div>
      </aside>

      {/* KONTEN UTAMA (KANAN) */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto h-screen">
         <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Judul Materi */}
            <div>
                <span className="text-blue-600 font-bold tracking-wide text-sm uppercase mb-2 block">Materi Belajar</span>
                <h2 className="text-3xl font-extrabold text-slate-900">{activeMaterial?.title}</h2>
            </div>

            {/* Video Youtube */}
            {activeMaterial?.video_url && (
                <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-black">
                    <iframe 
                        width="100%" 
                        height="100%" 
                        src={activeMaterial.video_url} 
                        title="YouTube video player" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                    ></iframe>
                </div>
            )}

            {/* Teks Materi (Markdown + Rumus) */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100 text-slate-800 font-bold text-lg">
                    <FileText className="text-blue-600" /> Ringkasan Materi
                </div>
                {/* Menggunakan komponen MarkdownText kita supaya rumus matematika tampil bagus */}
                <div className="text-slate-700 leading-relaxed text-lg">
                    <MarkdownText content={activeMaterial?.content || ""} />
                </div>
            </div>

         </div>
      </main>
    </div>
  );
}