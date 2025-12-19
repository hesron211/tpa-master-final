"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { createClient } from "../../../lib/supabase";
import { Course } from "../../../types";
import { Loader2, Plus, Save, FileText, ArrowLeft, Trash2, Edit, RefreshCw, CheckCircle, Video } from "lucide-react";
import Link from "next/link";
import MarkdownText from "../../../components/MarkdownText";

// Tipe Data Materi
type Material = {
  id: number;
  course_id: number;
  title: string;
  content: string;
  video_url: string;
  courses?: { title: string };
};

export default function AdminMaterialsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [editId, setEditId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    course_id: "",
    title: "",
    content: "",
    video_url: "",
  });

  useEffect(() => {
    const init = async () => {
        const supabase = createClient();
        const { data: coursesData } = await supabase.from('courses').select('*');
        if (coursesData) setCourses(coursesData);
        fetchMaterials();
    };
    init();
  }, []);

  const fetchMaterials = async () => {
    const supabase = createClient();
    // Mengambil data dari tabel 'materials' dan join ke 'courses'
    const { data } = await supabase.from('materials').select('*, courses(title)').order('id', { ascending: false });
    // @ts-ignore
    if (data) setMaterials(data);
    setLoading(false);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setEditId(null);
    setFormData({ course_id: "", title: "", content: "", video_url: "" });
  };

  const handleEdit = (m: Material) => {
    setEditId(m.id);
    setFormData({
        course_id: m.course_id.toString(),
        title: m.title,
        content: m.content || "",
        video_url: m.video_url || "",
    });
    // Scroll ke atas otomatis agar admin sadar form sudah terisi
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if(!confirm("Yakin ingin menghapus materi ini secara permanen?")) return;
    const supabase = createClient();
    await supabase.from('materials').delete().eq('id', id);
    fetchMaterials(); // Refresh tabel setelah hapus
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.course_id) { alert("Pilih Mapel dulu!"); return; }

    setLoading(true);
    const supabase = createClient();
    let error;

    if (editId) {
        // --- LOGIKA UPDATE (EDIT) ---
        const { error: err } = await supabase.from('materials').update(formData).eq('id', editId);
        error = err;
    } else {
        // --- LOGIKA INSERT (BARU) ---
        const { error: err } = await supabase.from('materials').insert([formData]);
        error = err;
    }

    if (error) {
        alert("Gagal: " + error.message);
    } else {
        setSuccessMsg(editId ? "Materi berhasil diperbarui!" : "Materi berhasil disimpan!");
        resetForm();
        fetchMaterials(); // Refresh tabel bawah
        setTimeout(() => setSuccessMsg(""), 3000);
    }
    setLoading(false);
  };

  if (loading && courses.length === 0) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-brand-blue"/></div>;

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Tombol Kembali ke Dashboard */}
        <Link href="/admin" className="inline-flex items-center text-slate-500 hover:text-brand-blue mb-6 text-sm font-bold transition-colors">
            <ArrowLeft size={18} className="mr-2"/> Kembali ke Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-slate-800 mb-8 font-heading flex items-center gap-3">
            <div className="bg-brand-accent text-white rounded-xl p-2 shadow-md">
                {editId ? <Edit size={24}/> : <FileText size={24}/>}
            </div>
            {editId ? "Edit Materi Belajar" : "Input Materi Baru"}
        </h1>

        {successMsg && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 animate-bounce shadow-sm">
                <CheckCircle size={20}/> {successMsg}
            </div>
        )}

        {/* --- FORMULIR INPUT/EDIT --- */}
        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100 space-y-6 mb-12">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Mata Pelajaran</label>
                    <select name="course_id" value={formData.course_id} onChange={handleChange} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-brand-blue outline-none bg-white" required>
                        <option value="">-- Pilih Mapel --</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Judul Materi</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-brand-blue outline-none" placeholder="Contoh: Trik Cepat Figural" required />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Link Video YouTube</label>
                <input type="text" name="video_url" value={formData.video_url} onChange={handleChange} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-brand-blue outline-none" placeholder="https://youtube.com/watch?v=..." />
                <p className="text-xs text-slate-400 mt-1 ml-1">Bisa link biasa atau link share (youtu.be).</p>
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex justify-between">
                    Konten Teks & Rangkuman
                    <span className="text-[10px] bg-blue-50 text-brand-blue px-2 py-1 rounded border border-blue-100 font-bold">Markdown Supported</span>
                </label>
                <textarea name="content" value={formData.content} onChange={handleChange} rows={8} className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-brand-blue outline-none font-mono text-sm leading-relaxed" placeholder="Tulis rangkuman materi disini. Gunakan **tebal** untuk menebalkan..."></textarea>
            </div>

            <div className="flex gap-4 pt-4 border-t">
                {editId && (
                    <button type="button" onClick={resetForm} className="px-6 py-4 bg-slate-100 text-slate-500 font-bold rounded-xl hover:bg-slate-200 transition-colors">Batal Edit</button>
                )}
                <button type="submit" disabled={loading} className={`flex-1 py-4 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all ${editId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-brand-blue hover:bg-brand-dark'}`}>
                    {loading ? <Loader2 className="animate-spin"/> : <Save size={20}/>}
                    {editId ? "Simpan Perubahan" : "Simpan Materi Baru"}
                </button>
            </div>
        </form>

        {/* --- TABEL DAFTAR MATERI --- */}
        <div className="border-t pt-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800 font-heading">Daftar Materi Tersimpan</h2>
                <button onClick={fetchMaterials} className="text-brand-blue text-sm font-bold flex items-center gap-1 hover:bg-blue-50 px-3 py-2 rounded-lg"><RefreshCw size={16}/> Refresh Tabel</button>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="p-4 font-bold text-slate-500 uppercase text-xs tracking-wider">Mapel</th>
                            <th className="p-4 font-bold text-slate-500 uppercase text-xs tracking-wider">Judul & Video</th>
                            <th className="p-4 font-bold text-slate-500 uppercase text-xs tracking-wider text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {materials.length === 0 ? (
                            <tr><td colSpan={3} className="p-8 text-center text-slate-400 italic">Belum ada materi yang diinput.</td></tr>
                        ) : (
                            materials.map(m => (
                                <tr key={m.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="p-4 align-top font-bold text-brand-blue">{m.courses?.title}</td>
                                    <td className="p-4 align-top">
                                        <p className="font-bold text-slate-800 mb-1 text-base">{m.title}</p>
                                        <div className="flex gap-3 text-xs text-slate-500">
                                            {m.video_url ? (
                                                <a href={m.video_url} target="_blank" className="text-blue-600 hover:underline flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                                    <Video size={12}/> Ada Video
                                                </a>
                                            ) : <span className="text-slate-400">Tanpa Video</span>}
                                            {m.content && <span>• Ada Teks</span>}
                                        </div>
                                    </td>
                                    <td className="p-4 align-top text-right space-x-2">
                                        <button onClick={() => handleEdit(m)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 font-bold transition-colors border border-yellow-100" title="Edit Data">
                                            <Edit size={14}/> Edit
                                        </button>
                                        <button onClick={() => handleDelete(m.id)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-bold transition-colors border border-red-100" title="Hapus Permanen">
                                            <Trash2 size={14}/>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
}