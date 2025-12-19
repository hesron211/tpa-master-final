// src/app/admin/courses/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, BookOpen, Loader2, Edit, Clock, HelpCircle, AlertCircle, Trash2 } from "lucide-react";
import { createClient } from "../../../lib/supabase";

interface Course {
  id: number;
  title: string;
  slug: string;
  duration_minutes: number;
  question_count: number;
  image_url: string | null;
  created_at: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null); // State untuk loading saat menghapus

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    setErrorMessage(null);
    
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("courses") 
        .select("*")
        .order("id", { ascending: true });

      if (error) throw error;
      setCourses(data || []);
      
    } catch (err: any) {
      console.error("Gagal mengambil data:", err);
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- FUNGSI DELETE BARU ---
  const handleDelete = async (id: number, title: string) => {
    // 1. Konfirmasi User
    if (!confirm(`Apakah Anda yakin ingin menghapus kursus "${title}"? Data yang dihapus tidak bisa dikembalikan.`)) return;

    setDeletingId(id); // Nyalakan loading di tombol delete

    try {
      const supabase = createClient();
      
      // 2. Hapus dari Database
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // 3. Update Tampilan (Hapus item dari state array)
      setCourses(prevCourses => prevCourses.filter(course => course.id !== id));
      alert("Kursus berhasil dihapus.");

    } catch (err: any) {
      alert("Gagal menghapus: " + err.message);
    } finally {
      setDeletingId(null); // Matikan loading
    }
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Kursus</h1>
          <p className="text-slate-500">Daftar paket belajar yang tersedia.</p>
        </div>
        <Link 
          href="/admin/courses/create" 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Buat Kursus Baru
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search size={20} className="text-slate-400" />
        <input 
          type="text" 
          placeholder="Cari nama kursus..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 outline-none text-slate-700 placeholder:text-slate-400"
        />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="mt-0.5 shrink-0" />
          <div>
            <h3 className="font-bold">Gagal memuat data</h3>
            <p className="text-sm mt-1">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-20">
          <Loader2 size={40} className="animate-spin text-blue-600 mx-auto" />
          <p className="text-slate-500 mt-2">Memuat data kursus...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !errorMessage && filteredCourses.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
          <p className="text-slate-500">Tidak ada kursus ditemukan.</p>
        </div>
      )}

      {/* List Courses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div key={course.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group">
            
            {/* Gambar */}
            <div className="h-40 bg-slate-100 flex items-center justify-center text-slate-400 relative overflow-hidden">
                {course.image_url ? (
                    <img src={course.image_url} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                    <BookOpen size={40} />
                )}
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-slate-800 line-clamp-1 mb-2" title={course.title}>
                  {course.title}
                </h3>
                
                {/* Info Detail */}
                <div className="flex gap-4 text-sm text-slate-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    <span>{course.duration_minutes}m</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <HelpCircle size={16} />
                    <span>{course.question_count} Soal</span>
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    
                    {/* Tombol Delete (Merah) */}
                    <button 
                      onClick={() => handleDelete(course.id, course.title)}
                      disabled={deletingId === course.id}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                      title="Hapus Kursus"
                    >
                        {deletingId === course.id ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                    </button>

                    {/* Tombol Edit (Biru) */}
                    <Link 
                      href={`/admin/courses/${course.id}`} 
                      className="flex-1 flex items-center justify-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 py-2 rounded-lg transition-colors"
                    >
                        <Edit size={16} />
                        Edit Detail
                    </Link>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}