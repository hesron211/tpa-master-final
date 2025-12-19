"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase";
import { ArrowLeft, PlayCircle, FileText, Lock, Crown, ChevronRight } from "lucide-react";
import Link from "next/link";
import MarkdownText from "../../../components/MarkdownText";

export default function LearnPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.courseId as string;

  const [materials, setMaterials] = useState<any[]>([]);
  const [selectedMat, setSelectedMat] = useState<any>(null);
  const [isPremium, setIsPremium] = useState(false); 
  const [loading, setLoading] = useState(true);

  // GANTI DENGAN LINK LYNK.ID ANDA
  const LYNK_ID_URL = "https://lynk.id/kelasfokus"; 

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      
      // 1. Cek User
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      // 2. CEK STATUS & DURASI PREMIUM (BARU)
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status, premium_until') // Ambil tanggal expired
        .eq('id', user.id)
        .single();
      
      // Logika Validasi Waktu
      const now = new Date();
      const validUntil = profile?.premium_until ? new Date(profile.premium_until) : null;
      
      // User dianggap Premium jika: Status 'premium' DAN Tanggalnya Masih Berlaku
      const isPremiumActive = 
        profile?.subscription_status === 'premium' && 
        validUntil && 
        validUntil > now;

      setIsPremium(!!isPremiumActive);

      // 3. Ambil Materi
      const { data: matData } = await supabase
        .from('materials')
        .select('*')
        .eq('course_id', courseId)
        .order('id', { ascending: true });

      if (matData) {
        setMaterials(matData);
        if (matData.length > 0) setSelectedMat(matData[0]);
      }
      setLoading(false);
    };

    fetchData();
  }, [courseId, router]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-400">
        Memuat materi...
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-80 bg-white border-r flex flex-col h-1/3 md:h-full overflow-hidden">
        <div className="p-4 border-b flex items-center gap-2 bg-slate-50">
            <button onClick={() => router.push('/')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-500">
                <ArrowLeft size={20}/>
            </button>
            <h2 className="font-bold text-slate-800 text-sm md:text-base">Daftar Materi</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {materials.map((m, idx) => {
                // Logika Kunci: Jika bukan premium, kunci materi ke-4 dst (index >= 3)
                const isLocked = !isPremium && idx >= 3; 

                return (
                    <button 
                        key={m.id}
                        disabled={isLocked}
                        onClick={() => setSelectedMat(m)}
                        className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all border ${
                            selectedMat?.id === m.id 
                            ? 'bg-brand-blue text-white shadow-md border-brand-blue' 
                            : isLocked 
                                ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-transparent' 
                                : 'hover:bg-blue-50 text-slate-700 border-transparent hover:border-blue-100'
                        }`}
                    >
                        {isLocked ? (
                            <Lock size={18} className="text-slate-300 flex-shrink-0"/>
                        ) : (
                            m.video_url ? <PlayCircle size={18} className="flex-shrink-0"/> : <FileText size={18} className="flex-shrink-0"/>
                        )}
                        
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold line-clamp-1">{m.title}</p>
                            <span className={`text-[10px] opacity-80 uppercase tracking-wider font-bold ${isLocked ? 'text-red-300' : ''}`}>
                                {isLocked ? "Terkunci" : (m.video_url ? "Video" : "Bacaan")}
                            </span>
                        </div>

                        {selectedMat?.id === m.id && !isLocked && <ChevronRight size={16} className="opacity-50"/>}
                    </button>
                );
            })}

            {/* Banner Upgrade */}
            {!isPremium && materials.length > 3 && (
                <div className="mt-6 p-5 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border border-orange-100 text-center space-y-3 shadow-sm">
                    <div className="w-10 h-10 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto">
                        <Crown size={20}/>
                    </div>
                    <div>
                        <p className="text-sm text-slate-800 font-bold">Materi Terkunci?</p>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Beli paket akses Premium untuk membuka seluruh materi dan latihan soal.
                        </p>
                    </div>
                    
                    <a href={LYNK_ID_URL} target="_blank" rel="noopener noreferrer" className="block w-full py-2.5 bg-orange-500 text-white text-xs font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200">
                        Beli Akses Premium
                    </a>
                    <Link href="/redeem" className="block w-full py-2.5 bg-white text-orange-600 border border-orange-200 text-xs font-bold rounded-xl hover:bg-orange-50 transition-colors">
                        Punya Kode Voucher?
                    </Link>
                </div>
            )}
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <main className="flex-1 h-2/3 md:h-full overflow-y-auto p-4 md:p-8 bg-slate-50">
        {selectedMat ? (
            <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-slate-100 min-h-full">
                <div className="mb-6 border-b pb-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-brand-blue mb-2 uppercase tracking-wider">
                        {selectedMat.video_url ? <PlayCircle size={14}/> : <FileText size={14}/>}
                        {selectedMat.video_url ? "Video Pembelajaran" : "Materi Bacaan"}
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 font-heading leading-tight">
                        {selectedMat.title}
                    </h1>
                </div>
                
                {selectedMat.video_url && (
                    <div className="aspect-video rounded-2xl overflow-hidden bg-black mb-8 shadow-lg ring-4 ring-slate-100">
                       <iframe 
                         className="w-full h-full"
                         src={`https://www.youtube.com/embed/${selectedMat.video_url.split('v=')[1]?.split('&')[0]}`} 
                         title={selectedMat.title}
                         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                         allowFullScreen
                       ></iframe>
                    </div>
                )}

                <div className="prose prose-slate prose-lg max-w-none text-slate-700">
                    <MarkdownText content={selectedMat.content} />
                </div>
            </div>
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                <FileText size={48} className="opacity-20"/>
                <p>Pilih materi di sidebar untuk mulai belajar.</p>
            </div>
        )}
      </main>
    </div>
  );
}