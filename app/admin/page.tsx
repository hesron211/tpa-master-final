"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../lib/supabase";
import { Course } from "../../types";
import { Loader2, PlusCircle, Save, Eye, EyeOff, Video, Image as ImageIcon, X, Upload } from "lucide-react";
import MarkdownText from "../../components/MarkdownText";

// --- GANTI EMAIL ---
const ADMIN_EMAIL = "tes@coba.com"; 
// ------------------

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Form State
  const [selectedCourse, setSelectedCourse] = useState("");
  const [category, setCategory] = useState("Figural");
  const [questionText, setQuestionText] = useState("");
  const [explanation, setExplanation] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("A");
  
  // State Teks Opsi
  const [options, setOptions] = useState({ A: "", B: "", C: "", D: "", E: "" });

  // State Gambar Soal Utama
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // State Gambar Opsi (A-E)
  const [optionFiles, setOptionFiles] = useState<Record<string, File | null>>({ A: null, B: null, C: null, D: null, E: null });
  const [optionPreviews, setOptionPreviews] = useState<Record<string, string | null>>({ A: null, B: null, C: null, D: null, E: null });

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== ADMIN_EMAIL) { alert("Akses ditolak."); router.push("/"); return; }
      const { data } = await supabase.from('courses').select('*').order('id');
      if (data) {
        setCourses(data);
        if(data.length > 0) setSelectedCourse(data[0].id.toString());
      }
      setLoading(false);
    };
    init();
  }, [router]);

  // Handle Gambar Soal Utama
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle Gambar Opsi (A-E)
  const handleOptionFileChange = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setOptionFiles(prev => ({ ...prev, [key]: file }));
      setOptionPreviews(prev => ({ ...prev, [key]: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const supabase = createClient();
    
    // 1. Upload Gambar Soal Utama
    let mainImageUrl = null;
    if (imageFile) {
      const fileName = `main-${Date.now()}-${imageFile.name}`;
      const { error: upErr } = await supabase.storage.from('question-images').upload(fileName, imageFile);
      if (!upErr) {
        const { data } = supabase.storage.from('question-images').getPublicUrl(fileName);
        mainImageUrl = data.publicUrl;
      }
    }

    // 2. Upload Gambar Opsi (Looping A-E)
    const finalOptions = [];
    const keys = ['A', 'B', 'C', 'D', 'E'] as const;

    for (const key of keys) {
        let optImageUrl = undefined;
        const file = optionFiles[key];

        if (file) {
            const fileName = `opt-${key}-${Date.now()}-${file.name}`;
            const { error: upErr } = await supabase.storage.from('question-images').upload(fileName, file);
            if (!upErr) {
                const { data } = supabase.storage.from('question-images').getPublicUrl(fileName);
                optImageUrl = data.publicUrl;
            }
        }

        finalOptions.push({
            id: key,
            text: options[key], // Teks tetap disimpan (bisa kosong)
            image_url: optImageUrl // Link gambar (jika ada)
        });
    }

    // 3. Simpan ke Database
    const { error } = await supabase.from('questions').insert({
      course_id: parseInt(selectedCourse),
      category: category,
      question_text: questionText,
      options: finalOptions, // JSON yang sudah ada link gambarnya
      correct_answer: correctAnswer,
      explanation: explanation,
      image_url: mainImageUrl
    });

    if (error) {
      alert("Gagal: " + error.message);
    } else {
      alert("Soal berhasil disimpan!");
      // Reset Form
      setQuestionText("");
      setOptions({ A: "", B: "", C: "", D: "", E: "" });
      setExplanation("");
      setImageFile(null);
      setImagePreview(null);
      setOptionFiles({ A: null, B: null, C: null, D: null, E: null });
      setOptionPreviews({ A: null, B: null, C: null, D: null, E: null });
    }
    setSubmitting(false);
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><PlusCircle className="text-blue-600"/> Input Soal (Text & Gambar)</h1>
            <Link href="/admin/materi" className="px-4 py-2 bg-white border rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Video size={18}/> Input Materi</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* FORM */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Mata Pelajaran</label>
                      <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
                      {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Kategori</label>
                      <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"/>
                  </div>
                </div>

                {/* Upload Soal Utama */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                   <label className="block text-sm font-bold text-blue-800 mb-2 flex items-center gap-2"><ImageIcon size={18}/> Gambar Soal Utama</label>
                   <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"/>
                   {imagePreview && (
                      <div className="mt-2 relative inline-block">
                        <img src={imagePreview} alt="Preview" className="h-24 rounded border"/>
                        <button type="button" onClick={() => {setImageFile(null); setImagePreview(null);}} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><X size={12}/></button>
                      </div>
                   )}
                </div>

                <textarea rows={3} value={questionText} onChange={(e) => setQuestionText(e.target.value)} placeholder="Teks pertanyaan (Boleh kosong jika soal full gambar)..." className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"/>

                {/* Opsi Jawaban (Text + Gambar) */}
                <div className="space-y-4 bg-slate-50 p-4 rounded-xl border">
                  <label className="block text-sm font-bold text-slate-700">Pilihan Jawaban</label>
                  {(['A', 'B', 'C', 'D', 'E'] as const).map((opt) => (
                      <div key={opt} className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white p-3 rounded-lg border">
                          <div className="flex items-center gap-3 w-full">
                            <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-white ${opt === correctAnswer ? 'bg-green-600' : 'bg-slate-400'}`}>{opt}</div>
                            
                            {/* Input Teks */}
                            <input type="text" placeholder={`Teks ${opt} (Opsional)`} value={options[opt]} onChange={(e) => setOptions({...options, [opt]: e.target.value})} className="flex-1 p-2 border rounded-lg text-sm outline-none focus:border-blue-500"/>
                            
                            {/* Tombol Upload Kecil */}
                            <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 p-2 rounded-lg text-slate-600 transition" title="Upload Gambar Opsi">
                                <Upload size={18}/>
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleOptionFileChange(opt, e)}/>
                            </label>
                            
                            <input type="radio" name="correct" checked={correctAnswer === opt} onChange={() => setCorrectAnswer(opt)} className="w-5 h-5 accent-green-600 cursor-pointer"/>
                          </div>
                          
                          {/* Preview Gambar Opsi */}
                          {optionPreviews[opt] && (
                             <div className="relative inline-block ml-11 sm:ml-0">
                                <img src={optionPreviews[opt]!} alt="Opt" className="h-12 rounded border"/>
                                <button type="button" onClick={() => {
                                    setOptionFiles(prev => ({...prev, [opt]: null}));
                                    setOptionPreviews(prev => ({...prev, [opt]: null}));
                                }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><X size={10}/></button>
                             </div>
                          )}
                      </div>
                  ))}
                </div>

                <textarea rows={2} value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder="Pembahasan..." className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"/>

                <button type="submit" disabled={submitting} className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg">
                  {submitting ? <Loader2 className="animate-spin"/> : <Save size={20}/>} Simpan Soal
                </button>
            </form>
            </div>

            {/* PREVIEW */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit sticky top-10">
                <div className="flex justify-between items-center mb-4 border-b pb-4">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2">{previewMode ? <Eye size={20} className="text-blue-600"/> : <EyeOff size={20} className="text-slate-400"/>} Preview</h2>
                    <button onClick={() => setPreviewMode(!previewMode)} className="text-xs bg-slate-100 px-3 py-1 rounded-full font-bold hover:bg-slate-200">{previewMode ? "Hide" : "Show"}</button>
                </div>

                {previewMode ? (
                    <div>
                        {imagePreview && <img src={imagePreview} alt="Main" className="max-w-full rounded-lg border mb-4"/>}
                        {questionText && <div className="mb-4 font-medium"><MarkdownText content={questionText}/></div>}
                        
                        <div className="space-y-2">
                            {(['A', 'B', 'C', 'D', 'E'] as const).map(opt => (
                                <button key={opt} className={`w-full text-left p-3 rounded-lg border flex items-center gap-3 ${correctAnswer === opt ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${correctAnswer === opt ? 'bg-green-600' : 'bg-slate-300'}`}>{opt}</div>
                                    <div className="flex-1">
                                        {/* Tampilkan Gambar Opsi Jika Ada */}
                                        {optionPreviews[opt] && <img src={optionPreviews[opt]!} className="h-16 object-contain mb-1 block"/>}
                                        {/* Tampilkan Teks Jika Ada */}
                                        {options[opt] && <span className="text-sm"><MarkdownText content={options[opt]}/></span>}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 text-slate-400">Preview dimatikan.</div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}