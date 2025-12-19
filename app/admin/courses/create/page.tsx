"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../lib/supabase"; 
import { ArrowLeft, Loader2, Link as LinkIcon, Clock, HelpCircle, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export default function CreateCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // State Form sesuai kolom Database Anda yang sebenarnya
  const [form, setForm] = useState({
    title: "",
    slug: "", // tpa-verbal
    duration_minutes: 30,
    question_count: 40,
    image_url: ""
  });

  // Fungsi untuk membuat Slug otomatis dari Judul
  // Contoh: "TPA Verbal" -> "tpa-verbal"
  useEffect(() => {
    const newSlug = form.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Ganti simbol aneh jadi strip
      .replace(/(^-|-$)+/g, ''); // Hapus strip di awal/akhir
    
    setForm(prev => ({ ...prev, slug: newSlug }));
  }, [form.title]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      
      // Insert ke tabel 'courses' sesuai kolom yang ADA di database Anda
      const { error } = await supabase
        .from('courses')
        .insert([
          {
            title: form.title,
            slug: form.slug,
            duration_minutes: form.duration_minutes,
            question_count: form.question_count,
            image_url: form.image_url || null, // Jika kosong kirim null
            // created_at otomatis
          }
        ]);

      if (error) throw error;

      alert("Kursus berhasil dibuat!");
      router.push("/admin/courses");
      
    } catch (err: any) {
      console.error("Error creating course:", err);
      alert("Gagal membuat kursus: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/admin/courses" className="flex items-center text-slate-500 hover:text-slate-800 mb-6 w-fit">
        <ArrowLeft size={18} className="mr-2" />
        Kembali ke Daftar Kursus
      </Link>

      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Buat Kursus Baru</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Judul */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Judul Kursus</label>
            <input
              type="text"
              required
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
              placeholder="Contoh: Latihan TPA Logika"
              value={form.title}
              onChange={(e) => setForm({...form, title: e.target.value})}
            />
          </div>

          {/* Slug (Otomatis) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Slug (Link URL)</label>
            <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-500">
                <LinkIcon size={16} />
                <span className="text-sm">yourwebsite.com/course/</span>
                <input
                    type="text"
                    required
                    className="flex-1 bg-transparent outline-none font-mono text-slate-800"
                    value={form.slug}
                    onChange={(e) => setForm({...form, slug: e.target.value})}
                />
            </div>
            <p className="text-xs text-slate-400 mt-1">Otomatis terisi berdasarkan judul. Boleh diedit manual.</p>
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
                <ImageIcon size={16} /> URL Gambar (Optional)
            </label>
            <input
              type="url"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="https://..."
              value={form.image_url}
              onChange={(e) => setForm({...form, image_url: e.target.value})}
            />
            <p className="text-xs text-slate-400 mt-1">Masukkan link gambar langsung (misal dari Unsplash).</p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 flex justify-center items-center mt-8"
          >
            {loading ? <Loader2 className="animate-spin mr-2"/> : null}
            {loading ? "Menyimpan..." : "Simpan Kursus"}
          </button>
        </form>
      </div>
    </div>
  );
}