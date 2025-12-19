"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { createClient } from "../../../lib/supabase";
import { Course } from "../../../types";
import { Loader2, Plus, Upload, Save, CheckCircle, XCircle, ArrowLeft, Image as ImageIcon, Trash2, Edit, RefreshCw } from "lucide-react";
import Link from "next/link";
import MarkdownText from "../../../components/MarkdownText";

// Tipe Data Soal untuk Tabel
type Question = {
  id: number;
  course_id: number;
  question_text: string;
  question_image_url: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string;
  correct_option: string;
  explanation: string;
  courses?: { title: string }; // Join table
};

export default function AdminQuestionsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  
  // State untuk Mode Edit
  const [editId, setEditId] = useState<number | null>(null);

  // State Form
  const [formData, setFormData] = useState<any>({
    course_id: "",
    question_text: "",
    question_image_url: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    option_e: "",
    correct_option: "A",
    explanation: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const supabase = createClient();
    const { data: courseData } = await supabase.from('courses').select('*').order('id');
    if (courseData) setCourses(courseData);
    fetchQuestions();
  };

  const fetchQuestions = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('questions')
      .select('*, courses(title)')
      .order('id', { ascending: false })
      .limit(50);
    
    // @ts-ignore
    if (data) setQuestions(data);
    setLoading(false);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const uploadFileToSupabase = async (file: File): Promise<string | null> => {
    try {
        setUploading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `question-images/${fileName}`;
        const supabase = createClient();
        const { error } = await supabase.storage.from('material_images').upload(filePath, file);
        if (error) throw error;
        const { data } = supabase.storage.from('material_images').getPublicUrl(filePath);
        setUploading(false);
        return data.publicUrl;
    } catch (error: any) {
        alert("Gagal upload: " + error.message);
        setUploading(false);
        return null;
    }
  };

  const handleMainImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const url = await uploadFileToSupabase(e.target.files[0]);
    if (url) setFormData({ ...formData, question_image_url: url });
  };

  const handleOptionImageUpload = async (e: ChangeEvent<HTMLInputElement>, optionKey: string) => {
    if (!e.target.files?.length) return;
    const url = await uploadFileToSupabase(e.target.files[0]);
    if (url) {
        setFormData((prev: any) => ({ ...prev, [optionKey]: `![](${url})` }));
    }
  };

  const resetForm = () => {
    setEditId(null);
    setFormData({
        course_id: "", question_text: "", question_image_url: "",
        option_a: "", option_b: "", option_c: "", option_d: "", option_e: "",
        correct_option: "A", explanation: "",
    });
  };

  const handleEdit = (q: Question) => {
    setEditId(q.id);
    // Pastikan semua field terisi string kosong jika null dari database
    setFormData({
        course_id: q.course_id.toString(),
        question_text: q.question_text || "", 
        question_image_url: q.question_image_url || "",
        option_a: q.option_a || "",
        option_b: q.option_b || "",
        option_c: q.option_c || "",
        option_d: q.option_d || "",
        option_e: q.option_e || "",
        correct_option: q.correct_option || "A",
        explanation: q.explanation || "",
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if(!confirm("Yakin ingin menghapus soal ini?")) return;
    const supabase = createClient();
    await supabase.from('questions').delete().eq('id', id);
    fetchQuestions();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.course_id) { alert("Pilih Mapel dulu!"); return; }
    
    setLoading(true);
    const supabase = createClient();
    
    let error;
    if (editId) {
        const { error: err } = await supabase.from('questions').update(formData).eq('id', editId);
        error = err;
    } else {
        const { error: err } = await supabase.from('questions').insert([formData]);
        error = err;
    }

    if (error) {
      alert("Gagal menyimpan: " + error.message);
    } else {
      setSuccessMsg(editId ? "Soal berhasil diupdate!" : "Soal berhasil disimpan!");
      resetForm();
      fetchQuestions();
      setTimeout(() => setSuccessMsg(""), 3000);
    }
    setLoading(false);
  };

  if (loading && courses.length === 0) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-brand-blue"/></div>;

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-5xl mx-auto">
        
        <Link href="/admin" className="inline-flex items-center text-slate-500 hover:text-brand-blue mb-6 text-sm font-bold transition-colors">
            <ArrowLeft size={18} className="mr-2"/> Kembali ke Dashboard
        </Link>

        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 font-heading flex items-center gap-3">
                <div className="bg-brand-accent text-white rounded-xl p-2 shadow-md">
                    {editId ? <Edit size={24}/> : <Plus size={24}/>}
                </div>
                {editId ? "Edit Soal" : "Input Bank Soal"}
            </h1>
            {editId && (
                <button onClick={resetForm} className="text-red-500 font-bold text-sm flex items-center gap-1 bg-red-50 px-3 py-2 rounded-lg hover:bg-red-100">
                    <XCircle size={16}/> Batal Edit
                </button>
            )}
        </div>

        {successMsg && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 animate-bounce shadow-sm">
                <CheckCircle size={20}/> {successMsg}
            </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100 space-y-8 mb-12">
          
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4 uppercase text-xs tracking-wider">1. Konfigurasi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Mata Pelajaran</label>
                    <select name="course_id" value={formData.course_id} onChange={handleChange} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-brand-blue outline-none bg-white" required>
                    <option value="">-- Pilih Mapel --</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Gambar Soal (Opsional)</label>
                    <div className="flex items-center gap-3">
                        {!formData.question_image_url ? (
                            <label className="cursor-pointer bg-white hover:bg-blue-50 text-brand-blue border border-brand-blue px-4 py-3 rounded-xl flex items-center gap-2 transition-all font-bold text-sm shadow-sm w-full justify-center">
                                <Upload size={18}/> Upload
                                <input type="file" accept="image/*" onChange={handleMainImageUpload} className="hidden" disabled={uploading} />
                            </label>
                        ) : (
                            <div className="flex items-center gap-3 w-full">
                                <div className="h-12 w-12 bg-slate-200 rounded-lg overflow-hidden border">
                                    <img src={formData.question_image_url} className="h-full w-full object-cover"/>
                                </div>
                                <button type="button" onClick={() => setFormData({...formData, question_image_url: ""})} className="text-red-500 text-xs font-bold hover:underline">Hapus</button>
                            </div>
                        )}
                    </div>
                </div>
              </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Isi Teks Soal (Markdown/Rumus)</label>
            <textarea name="question_text" value={formData.question_text} onChange={handleChange} rows={3} className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-brand-blue outline-none font-mono text-sm" placeholder="Pertanyaan..." ></textarea>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider border-b pb-2">2. Opsi Jawaban</h3>
            {['a', 'b', 'c', 'd', 'e'].map((opt) => (
              <div key={opt} className="flex gap-2 items-start">
                    <div className="w-10 h-10 flex items-center justify-center bg-slate-100 font-bold text-slate-500 rounded-lg border uppercase mt-1">{opt}</div>
                    <div className="flex-1 flex gap-2">
                        {/* PERBAIKAN UTAMA DI SINI:
                            Ditambahkan || "" agar value tidak pernah undefined 
                        */}
                        <input 
                            type="text" 
                            name={`option_${opt}`} 
                            value={formData[`option_${opt}`] || ""} 
                            onChange={handleChange} 
                            className="flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-brand-blue outline-none font-mono text-sm" 
                            placeholder={`Jawaban ${opt.toUpperCase()}...`} 
                            required 
                        />
                        <label className="cursor-pointer min-w-[50px] bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl flex items-center justify-center border transition-colors">
                            <ImageIcon size={20}/>
                            <input type="file" accept="image/*" onChange={(e) => handleOptionImageUpload(e, `option_${opt}`)} className="hidden" disabled={uploading} />
                        </label>
                    </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-brand-accent/5 rounded-2xl border border-brand-accent/20">
              <div className="mb-4">
                <label className="block text-sm font-bold text-slate-700 mb-2">Kunci Jawaban</label>
                <div className="flex gap-3">
                    {['A','B','C','D','E'].map(k => (
                        <label key={k} className={`cursor-pointer w-10 h-10 rounded-lg flex items-center justify-center font-bold border-2 transition-all ${formData.correct_option === k ? 'bg-brand-accent border-brand-accent text-white shadow-lg' : 'bg-white border-slate-200 text-slate-400'}`}>
                            <input type="radio" name="correct_option" value={k} checked={formData.correct_option === k} onChange={handleChange} className="hidden"/>
                            {k}
                        </label>
                    ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Pembahasan</label>
                <textarea name="explanation" value={formData.explanation} onChange={handleChange} rows={2} className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-brand-accent outline-none font-mono text-sm" placeholder="Penjelasan..."></textarea>
              </div>
          </div>

          <button type="submit" disabled={loading || uploading} className={`w-full py-4 text-white font-bold rounded-xl shadow-xl flex items-center justify-center gap-3 transition-all ${editId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-brand-blue hover:bg-brand-dark'}`}>
            {loading ? <Loader2 className="animate-spin"/> : <Save size={22}/>}
            {editId ? "Update Perubahan Soal" : "Simpan Soal Baru"}
          </button>
        </form>

        <div className="border-t pt-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800 font-heading">Daftar Soal Terakhir</h2>
                <button onClick={fetchQuestions} className="text-brand-blue text-sm font-bold flex items-center gap-1 hover:bg-blue-50 px-3 py-2 rounded-lg"><RefreshCw size={16}/> Refresh</button>
            </div>
            
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="p-4 font-bold text-slate-500">Mapel</th>
                            <th className="p-4 font-bold text-slate-500">Soal / Gambar</th>
                            <th className="p-4 font-bold text-slate-500">Kunci</th>
                            <th className="p-4 font-bold text-slate-500 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {questions.length === 0 ? (
                            <tr><td colSpan={4} className="p-8 text-center text-slate-400">Belum ada soal.</td></tr>
                        ) : (
                            questions.map(q => (
                                <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 align-top font-bold text-brand-blue">{q.courses?.title}</td>
                                    <td className="p-4 align-top max-w-md">
                                        {q.question_image_url && <img src={q.question_image_url} className="h-16 w-auto rounded border mb-2"/>}
                                        <p className="line-clamp-2 text-slate-600">{q.question_text || "(Soal Gambar)"}</p>
                                    </td>
                                    <td className="p-4 align-top font-bold text-center">
                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md">{q.correct_option}</span>
                                    </td>
                                    <td className="p-4 align-top text-right space-x-2">
                                        <button onClick={() => handleEdit(q)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 font-bold transition-colors" title="Edit">
                                            <Edit size={14}/> Edit
                                        </button>
                                        <button onClick={() => handleDelete(q.id)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-bold transition-colors" title="Hapus">
                                            <Trash2 size={14}/>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <p className="text-center text-xs text-slate-400 mt-4">Menampilkan 50 soal terbaru.</p>
        </div>

      </div>
    </div>
  );
}