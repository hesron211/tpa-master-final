"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation"; // TAMBAHKAN useParams
import { createClient } from "../../../../lib/supabase"; 
import { ArrowLeft, Loader2, Save, Trash2, Link as LinkIcon, Clock, HelpCircle, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function EditCoursePage() { // HAPUS { params } dari sini
  const router = useRouter();
  
  // SOLUSI: Gunakan hook useParams untuk mengambil ID
  const params = useParams();
  const courseId = params.id as string; 

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // State Form
  const [form, setForm] = useState({
    title: "",
    slug: "",
    duration_minutes: 0,
    question_count: 0,
    image_url: ""
  });

  // 1. AMBIL DATA LAMA
  useEffect(() => {
    // Cek jika courseId belum siap (undefined), jangan jalan dulu
    if (!courseId) return;

    const fetchCourse = async () => {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) {
        console.error("Error fetching:", error);
        alert("Gagal mengambil data kursus.");
        router.push("/admin/courses");
      } else if (data) {
        setForm({
          title: data.title,
          slug: data.slug,
          duration_minutes: data.duration_minutes,
          question_count: data.question_count,
          image_url: data.image_url || ""
        });
      }
      setLoading(false);
    };

    fetchCourse();
  }, [courseId, router]); // Dependency array memantau courseId

  // 2. FUNGSI UPDATE
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('courses')
        .update({
          title: form.title,
          slug: form.slug,
          duration_minutes: form.duration_minutes,
          question_count: form.question_count,
          image_url: form.image_url || null,
        })
        .eq('id', courseId);

      if (error) throw error;

      alert("Perubahan berhasil disimpan!");
      router.push("/admin/courses");
    } catch (err: any) {
      alert("Gagal update: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // 3. FUNGSI DELETE
  const handleDelete = async () => {
    if (!confirm("Yakin ingin menghapus kursus ini? Data tidak bisa dikembalikan.")) return;

    setDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;

      alert("Kursus berhasil dihapus.");
      router.push("/admin/courses");
    } catch (err: any) {
      alert("Gagal menghapus: " + err.message);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <Loader2 className="animate-spin text-blue-600 mb-2" size={30}/>
            <p className="text-slate-500">Memuat data kursus...</p>
        </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header & Navigasi */}
      <div className="flex items-center justify-between">
        <Link href="/admin/courses" className="flex items-center text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft size={18} className="mr-2" />
            Kembali
        </Link>
        
        <button 
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors text-sm font-bold"
        >
            {deleting ? <Loader2 className="animate-spin" size={16}/> : <Trash2 size={16} />}
            Hapus Kursus
        </button>
      </div>

      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-4">Edit Kursus</h1>

        <form onSubmit={handleUpdate} className="space-y-6">
          
          {/* Judul */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Judul Kursus</label>
            <input
              type="text"
              required
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
              value={form.title}
              onChange={(e) => setForm({...form, title: e.target.value})}
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Slug (Link URL)</label>
            <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-500">
                <LinkIcon size={16} />
                <span className="text-sm">.../course/</span>
                <input
                    type="text"
                    required
                    className="flex-1 bg-transparent outline-none font-mono text-slate-800"
                    value={form.slug}
                    onChange={(e) => setForm({...form, slug: e.target.value})}
                />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
              {/* Durasi */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <Clock size={16} /> Durasi (Menit)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.duration_minutes}
                  onChange={(e) => setForm({...form, duration_minutes: parseInt(e.target.value)})}
                />
              </div>

              {/* Jumlah Soal */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <HelpCircle size={16} /> Jumlah Soal
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.question_count}
                  onChange={(e) => setForm({...form, question_count: parseInt(e.target.value)})}
                />
              </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <ImageIcon size={16} /> URL Gambar
            </label>
            <input
              type="url"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.image_url}
              onChange={(e) => setForm({...form, image_url: e.target.value})}
            />
          </div>

          {/* Tombol Simpan */}
          <div className="pt-4 border-t">
            <button
                type="submit"
                disabled={saving}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 flex justify-center items-center gap-2"
            >
                {saving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20} />}
                {saving ? "Menyimpan Perubahan..." : "Simpan Perubahan"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}