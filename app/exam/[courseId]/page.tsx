"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase";
import { 
    Loader2, ChevronRight, ChevronLeft, Timer, Crown, Grid, X, XCircle
} from "lucide-react";
import MarkdownText from "../../../components/MarkdownText";
import Link from "next/link";

type Question = {
  id: number;
  question_text: string;
  question_image_url: string | null;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string;
  correct_option: string;
  explanation: string | null;
  options?: { key: string; text: string }[];
};

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.courseId as string;

  // STATE DATA
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [totalAvailableInDB, setTotalAvailableInDB] = useState(0);

  // STATE UJIAN
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({}); 
  const [doubtful, setDoubtful] = useState<Record<number, boolean>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [showSidebar, setShowSidebar] = useState(false);

  // GANTI LINK LYNK.ID ANDA
  const LYNK_ID_URL = "https://lynk.id/kelasfokus";

  // TIMER
  const [timeLeft, setTimeLeft] = useState(30 * 60); 
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!courseId) return;

    const fetchExam = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      // 1. CEK STATUS & DURASI PREMIUM (BARU)
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status, premium_until')
        .eq('id', user.id)
        .single();

      // Logika Validasi Waktu
      const now = new Date();
      const validUntil = profile?.premium_until ? new Date(profile.premium_until) : null;
      
      const isPremiumActive = 
        profile?.subscription_status === 'premium' && 
        validUntil && 
        validUntil > now;

      setIsPremium(!!isPremiumActive);

      // 2. Ambil Soal
      const { data } = await supabase
        .from('questions')
        .select('*')
        .eq('course_id', courseId)
        .order('id', { ascending: true });

      if (data) {
        setTotalAvailableInDB(data.length);
        
        let finalData = data;
        // Limit 5 soal jika TIDAK Premium Aktif
        if (!isPremiumActive) {
            finalData = data.slice(0, 5); 
        }

        const formattedQuestions = finalData.map((q: any) => ({
            ...q,
            options: [
                { key: 'A', text: q.option_a },
                { key: 'B', text: q.option_b },
                { key: 'C', text: q.option_c },
                { key: 'D', text: q.option_d },
                { key: 'E', text: q.option_e },
            ].filter((opt: any) => opt.text)
        }));
        setQuestions(formattedQuestions);
      }
      setLoading(false);
    };

    fetchExam();
  }, [courseId, router]);

  // TIMER LOGIC
  useEffect(() => {
    if (loading || isFinished || questions.length === 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current as NodeJS.Timeout);
          handleFinish(true); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [loading, isFinished, questions]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (key: string) => {
    if (isFinished) return;
    const currentQ = questions[currentIdx];
    setAnswers({ ...answers, [currentQ.id]: key });
  };

  const handleToggleDoubt = () => {
    const currentQ = questions[currentIdx];
    setDoubtful(prev => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }));
  };

  const jumpToQuestion = (index: number) => {
    setCurrentIdx(index);
    setShowSidebar(false);
  };

  const handleFinish = (isAuto = false) => {
    if (!isAuto && !confirm("Yakin ingin menyelesaikan ujian?")) return;
    if (timerRef.current) clearInterval(timerRef.current);

    let correctCount = 0;
    questions.forEach(q => { if (answers[q.id] === q.correct_option) correctCount++; });

    setScore(Math.round((correctCount / questions.length) * 100));
    setIsFinished(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-brand-blue"/></div>;
  if (questions.length === 0) return <div className="p-8 text-center">Soal belum tersedia.</div>;

  const currQ = questions[currentIdx];

  // --- TAMPILAN HASIL ---
  if (isFinished) {
    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Promo jika Trial */}
                {!isPremium && (
                    <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl p-6 text-white text-center shadow-lg">
                        <Crown size={32} className="mx-auto mb-2 text-white"/>
                        <h2 className="text-xl font-bold font-heading mb-1">Versi Percobaan Selesai</h2>
                        <p className="text-orange-50 text-sm mb-4">Anda baru mengerjakan 5 dari {totalAvailableInDB} soal.</p>
                        <div className="flex gap-2 justify-center mt-4">
                             <a href={LYNK_ID_URL} target="_blank" className="px-6 py-2 bg-white text-orange-600 font-bold rounded-xl hover:bg-orange-50">Beli Premium</a>
                             <Link href="/redeem" className="px-6 py-2 bg-orange-600/30 border border-white/50 text-white font-bold rounded-xl">Punya Kode?</Link>
                        </div>
                    </div>
                )}
                
                <div className="bg-white p-8 rounded-3xl border shadow-lg text-center">
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Hasil Ujian</h1>
                    <div className={`text-6xl font-heading font-bold mb-4 ${score >= 70 ? 'text-green-500' : 'text-red-500'}`}>{score}</div>
                    <div className="mt-8 flex justify-center gap-4">
                        <button onClick={() => router.push('/')} className="px-6 py-3 bg-slate-100 font-bold rounded-xl">Dashboard</button>
                        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-brand-blue text-white font-bold rounded-xl">Ulangi</button>
                    </div>
                </div>

                {/* Pembahasan */}
                <div className="space-y-6">
                    {questions.map((q, idx) => {
                        const isCorrect = answers[q.id] === q.correct_option;
                        return (
                            <div key={q.id} className={`bg-white p-6 rounded-2xl border-l-4 shadow-sm ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
                                <div className="font-bold text-slate-400 text-sm mb-2">No. {idx + 1}</div>
                                <div className="mb-4 text-slate-800 font-medium"><MarkdownText content={q.question_text} /></div>
                                <div className="p-3 bg-slate-50 rounded-lg text-sm mb-2">
                                    Jawaban Anda: <span className="font-bold">{answers[q.id] || "-"}</span> | Kunci: <span className="font-bold text-brand-blue">{q.correct_option}</span>
                                </div>
                                {q.explanation && <div className="text-sm text-slate-600 bg-blue-50 p-3 rounded-lg"><MarkdownText content={q.explanation} /></div>}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
  }

  // --- TAMPILAN UJIAN (CAT STYLE) ---
  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans overflow-hidden">
        <header className="bg-white border-b px-4 py-3 flex justify-between items-center flex-shrink-0 z-20">
            <div className="flex items-center gap-2">
                <button onClick={() => router.push('/')} className="p-2 hover:bg-slate-100 rounded-lg"><XCircle size={20} className="text-slate-400"/></button>
                <div className="hidden md:block">
                    <h1 className="font-bold text-slate-800">Ujian Online</h1>
                    <p className="text-xs text-slate-500">Soal {currentIdx + 1} / {questions.length}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold text-lg border ${timeLeft < 300 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                    <Timer size={20} /> {formatTime(timeLeft)}
                </div>
                <button onClick={() => setShowSidebar(!showSidebar)} className="md:hidden p-2 bg-slate-100 rounded-lg">
                    {showSidebar ? <X size={20}/> : <Grid size={20}/>}
                </button>
            </div>
        </header>

        <div className="flex flex-1 overflow-hidden relative">
            {/* AREA SOAL */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
                <div className="max-w-3xl mx-auto mb-20">
                    {!isPremium && (
                        <div className="bg-yellow-50 border border-orange-200 p-3 rounded-xl flex items-center gap-2 text-xs font-bold text-orange-800 mb-6 sticky top-0 z-10 shadow-sm">
                            <Crown size={16}/> Mode Trial: 5 Soal. <a href={LYNK_ID_URL} target="_blank" className="underline hover:text-orange-600">Beli Full Akses</a>
                        </div>
                    )}

                    <div className="bg-white rounded-3xl shadow-sm border p-6 md:p-10 relative">
                        <label className="absolute top-6 right-6 flex items-center gap-2 cursor-pointer select-none">
                            <input 
                                type="checkbox" 
                                checked={!!doubtful[currQ.id]} 
                                onChange={handleToggleDoubt}
                                className="w-5 h-5 text-yellow-500 rounded focus:ring-yellow-500 border-slate-300"
                            />
                            <span className={`text-sm font-bold px-2 py-1 rounded-md transition-colors ${doubtful[currQ.id] ? 'bg-yellow-100 text-yellow-700' : 'text-slate-400 bg-slate-50'}`}>Ragu-ragu</span>
                        </label>

                        {currQ.question_image_url && (
                            <img src={currQ.question_image_url} alt="Soal" className="max-h-60 rounded-lg border mb-6 object-contain bg-slate-50 mx-auto" />
                        )}
                        
                        <div className="text-lg text-slate-800 mb-8 mt-8 leading-relaxed">
                            <MarkdownText content={currQ.question_text} />
                        </div>

                        <div className="space-y-3">
                            {currQ.options?.map((opt) => {
                                const isSelected = answers[currQ.id] === opt.key;
                                return (
                                    <button 
                                        key={opt.key}
                                        onClick={() => handleSelectAnswer(opt.key)}
                                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 group ${isSelected ? 'border-brand-blue bg-blue-50' : 'border-slate-200 hover:border-brand-blue hover:bg-slate-50'}`}
                                    >
                                        <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg font-bold text-sm ${isSelected ? 'bg-brand-blue text-white' : 'bg-slate-100 text-slate-500'}`}>
                                            {opt.key}
                                        </div>
                                        <div className="flex-1 pt-1 text-slate-700"><MarkdownText content={opt.text} /></div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </main>

            {/* NAVIGASI GRID */}
            <aside className={`absolute md:static top-0 right-0 h-full w-full md:w-80 bg-white border-l shadow-xl md:shadow-none transition-transform duration-300 z-10 ${showSidebar ? 'translate-x-0' : 'translate-x-full md:translate-x-0'} flex flex-col`}>
                <div className="p-4 border-b font-bold text-slate-800 flex justify-between items-center bg-slate-50">
                    <span>Navigasi Soal</span>
                    <button onClick={() => setShowSidebar(false)} className="md:hidden"><X size={20}/></button>
                </div>
                
                <div className="grid grid-cols-3 gap-2 p-4 text-[10px] font-bold text-center border-b">
                    <div className="bg-green-100 text-green-700 p-1 rounded">{Object.keys(answers).length} <br/> Dijawab</div>
                    <div className="bg-yellow-100 text-yellow-700 p-1 rounded">{Object.values(doubtful).filter(Boolean).length} <br/> Ragu</div>
                    <div className="bg-slate-100 text-slate-500 p-1 rounded">{questions.length - Object.keys(answers).length} <br/> Kosong</div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-5 gap-2">
                        {questions.map((q, idx) => {
                            const isAnswered = !!answers[q.id];
                            const isDoubtful = !!doubtful[q.id];
                            const isCurrent = currentIdx === idx;
                            let bgClass = "bg-white border-slate-200 text-slate-600";
                            if (isCurrent) bgClass = "ring-2 ring-brand-blue border-brand-blue bg-blue-50 text-brand-blue";
                            else if (isDoubtful) bgClass = "bg-yellow-400 text-white border-yellow-500";
                            else if (isAnswered) bgClass = "bg-green-500 text-white border-green-600";

                            return (
                                <button key={q.id} onClick={() => jumpToQuestion(idx)} className={`aspect-square rounded-lg border font-bold text-sm flex flex-col items-center justify-center transition-all ${bgClass}`}>
                                    {idx + 1}
                                    {isAnswered && !isDoubtful && <span className="text-[8px] leading-none opacity-80">{answers[q.id]}</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>
                
                <div className="p-4 border-t">
                    <button onClick={() => handleFinish(false)} className="w-full py-3 bg-brand-blue text-white font-bold rounded-xl hover:bg-brand-dark transition-colors shadow-lg shadow-blue-200">
                        Selesai Ujian
                    </button>
                </div>
            </aside>
        </div>

        <footer className="bg-white border-t p-4 flex justify-between items-center md:hidden z-20">
            <button onClick={() => setCurrentIdx(p => Math.max(0, p - 1))} disabled={currentIdx === 0} className="flex items-center gap-2 text-slate-600 font-bold disabled:opacity-30">
                <ChevronLeft size={20}/> Sebelumnya
            </button>
            <button onClick={() => setCurrentIdx(p => Math.min(questions.length - 1, p + 1))} disabled={currentIdx === questions.length - 1} className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-lg font-bold disabled:opacity-50 disabled:bg-slate-300">
                Selanjutnya <ChevronRight size={20}/>
            </button>
        </footer>
    </div>
  );
}