"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock, CheckCircle, AlertCircle, Loader2, RotateCcw, Home, XCircle, BookOpen, Save } from "lucide-react";
import clsx from "clsx";
import { createClient } from "../../../lib/supabase";
import { Question, Course } from "../../../types";
import MarkdownText from "../../../components/MarkdownText";

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId; 

  const [course, setCourse] = useState<Course | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); 

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [stats, setStats] = useState({ correct: 0, wrong: 0, empty: 0 });

  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const initExam = async () => {
      if (!courseId) return;
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { alert("Anda harus login."); router.push("/login"); return; }

      const { data: courseData } = await supabase.from('courses').select('*').eq('id', courseId).single();
      if (courseData) {
        setCourse(courseData);
        setTimeLeft(courseData.duration_minutes * 60);
      }

      const { data: questionData } = await supabase.from('questions').select('*').eq('course_id', courseId).order('id', { ascending: true });
      if (questionData) setQuestions(questionData);
      setLoading(false);
    };
    initExam();
  }, [courseId, router]);

  useEffect(() => {
    if (!loading && !isFinished && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) { handleFinish(true); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [loading, isFinished, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleFinish = async (force: boolean = false) => {
    if (!force && !confirm("Yakin ingin mengakhiri ujian?")) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSaving(true); 

    let correctCount = 0, wrongCount = 0, emptyCount = 0;
    questions.forEach((q) => {
      const ans = answers[q.id];
      if (!ans) emptyCount++; else if (ans === q.correct_answer) correctCount++; else wrongCount++;
    });
    const finalScore = correctCount * 5;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await supabase.from('exam_results').insert({
        user_id: user.id, course_id: courseId, score: finalScore,
        correct_answers: correctCount, wrong_answers: wrongCount, empty_answers: emptyCount
      });
    }

    setStats({ correct: correctCount, wrong: wrongCount, empty: emptyCount });
    setScore(finalScore);
    setIsFinished(true);
    setSaving(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectOption = (optId: string) => {
    if (isFinished) return;
    setAnswers((prev) => ({ ...prev, [questions[currentIdx].id]: optId }));
  };

  if (loading) return <div className="min-h-screen flex flex-col justify-center items-center gap-2"><Loader2 className="animate-spin text-blue-600 w-10 h-10"/><p>Memuat Soal CAT...</p></div>;
  if (saving) return <div className="min-h-screen flex flex-col justify-center items-center gap-4 bg-white/80 z-50 fixed inset-0"><Loader2 className="animate-spin text-green-600 w-12 h-12"/><h2 className="text-xl font-bold text-slate-800">Menyimpan Hasil...</h2></div>;
  if (!course || questions.length === 0) return <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center"><p>Belum ada soal.</p><Link href="/" className="text-blue-600 font-bold mt-2">Kembali</Link></div>;

  if (isFinished) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden text-center">
            <div className={`p-8 text-white ${score > (questions.length * 5) / 2 ? 'bg-green-600' : 'bg-blue-600'}`}>
              <h2 className="text-xl font-bold opacity-90">Hasil {course.title}</h2>
              <div className="text-6xl font-extrabold my-4">{score}</div>
              <p className="opacity-80">Skor Maksimal: {questions.length * 5}</p>
            </div>
            <div className="p-6">
               <div className="grid grid-cols-3 gap-4 mb-6">
                 <div className="p-3 bg-green-50 rounded-xl border border-green-100 text-green-700 font-bold flex flex-col"><span className="text-2xl">{stats.correct}</span> Benar</div>
                 <div className="p-3 bg-red-50 rounded-xl border border-red-100 text-red-700 font-bold flex flex-col"><span className="text-2xl">{stats.wrong}</span> Salah</div>
                 <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-slate-700 font-bold flex flex-col"><span className="text-2xl">{stats.empty}</span> Kosong</div>
               </div>
               <div className="flex gap-3 justify-center">
                   <button onClick={() => window.location.reload()} className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 flex items-center gap-2"><RotateCcw size={18}/> Ulangi</button>
                   <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2"><Home size={18}/> Beranda</Link>
               </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800 px-2 flex items-center gap-2"><BookOpen size={20}/> Pembahasan Lengkap</h3>
            {questions.map((q, idx) => {
              const userAns = answers[q.id];
              const isCorrect = userAns === q.correct_answer;
              return (
                <div key={q.id} className={`bg-white rounded-xl p-6 border-l-4 shadow-sm ${isCorrect ? 'border-green-500' : 'border-red-500'}`}>
                   <div className="flex justify-between mb-4">
                      <span className="font-bold text-slate-500">No. {idx + 1}</span>
                      {isCorrect ? <span className="text-green-600 font-bold text-sm flex items-center gap-1"><CheckCircle size={14}/> Benar</span> : <span className="text-red-600 font-bold text-sm flex items-center gap-1"><XCircle size={14}/> Salah</span>}
                   </div>
                   
                   {/* Tampilkan Gambar di Pembahasan */}
                   {q.image_url && <img src={q.image_url} alt="Soal" className="max-w-full h-auto max-h-60 rounded-lg border mb-4"/>}

                   <div className="text-lg font-medium text-slate-800 mb-4 pb-4 border-b"><MarkdownText content={q.question_text} /></div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="bg-slate-50 p-3 rounded-lg"><span className="text-xs text-slate-500 uppercase block mb-1">Jawaban Kamu</span><span className="font-bold">{userAns || "-"}</span></div>
                      <div className="bg-green-50 p-3 rounded-lg border border-green-100"><span className="text-xs text-green-600 uppercase block mb-1">Kunci Jawaban</span><span className="font-bold text-green-800">{q.correct_answer}</span></div>
                   </div>
                   <div className="mt-4 bg-yellow-50 p-4 rounded-lg text-slate-700 text-sm leading-relaxed border border-yellow-100">
                      <strong className="text-yellow-800 block mb-1">Pembahasan:</strong>
                      <MarkdownText content={q.explanation || "Tidak ada pembahasan."} />
                   </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    );
  }

  const currQ = questions[currentIdx];
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b px-4 md:px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
             <Link href="/" className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><ChevronLeft/></Link>
             <div>
                <h1 className="font-bold text-slate-800 text-sm md:text-base">{course.title}</h1>
                <p className="text-xs text-slate-500 hidden md:block">Mode Ujian CAT</p>
             </div>
        </div>
        <div className={clsx("flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold shadow-sm border", timeLeft < 60 ? "bg-red-50 text-red-600 border-red-200 animate-pulse" : "bg-blue-50 text-blue-700 border-blue-100")}>
            <Clock size={18} /><span>{formatTime(timeLeft)}</span>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        <section className="md:col-span-8 flex flex-col">
            <div className="bg-white rounded-2xl p-6 md:p-8 border shadow-sm flex-1">
                <div className="flex justify-between mb-6">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded text-sm font-bold">Soal {currentIdx + 1} <span className="font-normal text-slate-400">/ {questions.length}</span></span>
                </div>
                
                {/* TAMPILKAN GAMBAR SOAL DI SINI */}
                {currQ.image_url && (
                    <div className="mb-6 flex justify-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <img src={currQ.image_url} alt="Gambar Soal" className="max-w-full h-auto max-h-80 rounded-lg"/>
                    </div>
                )}

                <div className="text-lg md:text-xl font-medium text-slate-800 mb-8"><MarkdownText content={currQ.question_text} /></div>
                <div className="space-y-3">
                    {currQ.options.map((opt) => (
                        <button 
    key={opt.id} 
    onClick={() => handleSelectOption(opt.id)} 
    className={clsx("w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4", 
    answers[currQ.id] === opt.id ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "border-slate-100 hover:border-blue-200 bg-white")}
>
    <div className={clsx("mt-1 w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-sm border transition-colors", answers[currQ.id] === opt.id ? "bg-blue-500 text-white border-blue-500" : "bg-slate-100 text-slate-500 border-slate-200")}>
        {opt.id}
    </div>
    
    <div className="flex-1">
        {/* LOGIKA BARU: Tampilkan Gambar Opsi */}
        {opt.image_url && (
            <img 
                src={opt.image_url} 
                alt={`Option ${opt.id}`} 
                className="h-24 object-contain mb-2 rounded-md border border-slate-200 bg-white" 
            />
        )}
        
        {/* Teks Opsi */}
        {opt.text && (
            <span className="text-slate-700 font-medium block">
                <MarkdownText content={opt.text} />
            </span>
        )}
    </div>
</button>
                    ))}
                </div>
            </div>

            <div className="flex justify-between mt-6">
                <button disabled={currentIdx === 0} onClick={() => setCurrentIdx(p => p - 1)} className="flex items-center gap-2 px-5 py-3 bg-white border rounded-xl font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"><ChevronLeft size={20}/> Prev</button>
                {currentIdx === questions.length - 1 ? (
                    <button onClick={() => handleFinish(false)} className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200"><CheckCircle size={20}/> Selesai</button>
                ) : (
                    <button onClick={() => setCurrentIdx(p => p + 1)} className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200">Next <ChevronRight size={20}/></button>
                )}
            </div>
        </section>

        <aside className="md:col-span-4">
            <div className="bg-white rounded-2xl p-5 border shadow-sm sticky top-24">
                <div className="mb-4 font-bold text-slate-800 text-sm uppercase tracking-wide">Navigasi Soal</div>
                <div className="grid grid-cols-5 gap-2">
                    {questions.map((q, idx) => (
                        <button key={q.id} onClick={() => setCurrentIdx(idx)} className={clsx("h-10 rounded-lg font-bold text-sm border transition-all", idx === currentIdx ? "bg-blue-600 text-white border-blue-600 ring-2 ring-blue-200" : answers[q.id] ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-white text-slate-400 border-slate-100 hover:bg-slate-50")}>{idx + 1}</button>
                    ))}
                </div>
            </div>
        </aside>
      </main>
    </div>
  );
}