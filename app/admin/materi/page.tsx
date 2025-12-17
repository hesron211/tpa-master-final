"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase";
import { Course } from "../../../types";
import { Loader2, Video, Save, Eye, EyeOff, ArrowLeft } from "lucide-react";
import Link from "next/link";
import MarkdownText from "../../../components/MarkdownText";

// --- GANTI DENGAN EMAIL ADMIN ANDA ---
const ADMIN_EMAIL = "tes@coba.com"; 

export default function AdminMateriPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Form State
  const [selectedCourse, setSelectedCourse] = useState("");
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== ADMIN_EMAIL) {
        alert("Akses ditolak.");
        router.push("/");
        return;
      }

      const { data } = await supabase.from('courses').select('*').order('id');
      if (data) {
        setCourses(data);
        if(data.length > 0) setSelectedCourse(data[0].id.toString());
      }
      setLoading(false);
    };
    init();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const supabase = createClient();

    const { error } = await supabase.from('materials').insert({
      course_id: parseInt(selectedCourse),
      title: title,
      video_url: videoUrl, // Link Youtube Embed
      content: content
    });

    if (error) {
      alert("Gagal: " + error.message);
    } else {
      alert("Materi berhasil disimpan!");
      setTitle("");
      setVideoUrl("");
      setContent("");
    }
    setSubmitting(false);
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Memuat...</div>;

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* KOLOM KIRI: FORM */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                <ArrowLeft size={20}/>
            </Link>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Video className="text-blue-600"/> Input Materi Video
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Mata Pelajaran</label>
              <select 
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              >
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Judul Materi</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Cth: Trik Cepat Hitung Persen" 
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Link Embed Youtube 
                <span className="font-normal text-slate-400 text-xs ml-2">(Harus format embed, bukan watch)</span>
              </label>
              <input 
                type="text" 
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/embed/KODE_VIDEO" 
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
              <p className="text-xs text-slate-500 mt-1">
                Cara dapat link: Buka Youtube - Klik Share - Klik Embed - Copy link di dalam src="..."
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Isi Materi Teks (Markdown & Rumus)
              </label>
              <textarea 
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="# Judul Besar&#10;&#10;Isi materi..."
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg"
            >
              {submitting ? <Loader2 className="animate-spin"/> : <Save size={20}/>}
              Simpan Materi
            </button>
          </form>
        </div>

        {/* KOLOM KANAN: PREVIEW */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit sticky top-10">
            <div className="flex justify-between items-center mb-4 pb-4 border-b">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                    {previewMode ? <Eye size={20} className="text-blue-600"/> : <EyeOff size={20} className="text-slate-400"/>}
                    Preview Tampilan
                </h2>
                <button onClick={() => setPreviewMode(!previewMode)} className="text-xs bg-slate-100 px-3 py-1 rounded-full font-bold hover:bg-slate-200">
                    {previewMode ? "Hide" : "Show"}
                </button>
            </div>

            {previewMode ? (
                <div className="space-y-4">
                    {videoUrl && (
                         <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
                            <iframe width="100%" height="100%" src={videoUrl} title="Preview"></iframe>
                         </div>
                    )}
                    <h3 className="font-bold text-xl">{title || "Judul Materi"}</h3>
                    <div className="text-sm text-slate-700">
                        <MarkdownText content={content || "Isi materi..."} />
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 text-slate-400">Aktifkan preview untuk melihat hasil.</div>
            )}
        </div>

      </div>
    </div>
  );
}