"use client";

import { useState } from "react";
import { createClient } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword(formData);

    if (error) {
      alert("Login Gagal: " + error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  // --- FUNGSI LOGIN GOOGLE ---
  const handleGoogleLogin = async () => {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Setelah login sukses, user diarahkan kembali ke halaman utama
        redirectTo: `${window.location.origin}/`, 
      }
    });

    if (error) {
        alert("Gagal login Google: " + error.message);
        setLoading(false);
    }
    // Catatan: Jika sukses, user akan di-redirect keluar dari website menuju Google, 
    // lalu balik lagi otomatis. Jadi tidak perlu setLoading(false).
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200 w-full max-w-md border border-slate-100">
        
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold font-heading text-slate-800 mb-2">Selamat Datang</h1>
            <p className="text-slate-500">Masuk untuk melanjutkan belajar.</p>
        </div>

        {/* --- TOMBOL GOOGLE (BARU) --- */}
        <button 
            onClick={handleGoogleLogin}
            className="w-full py-3 mb-6 border-2 border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-3"
        >
            {/* Ikon Google SVG */}
            <svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                    <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                    <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                    <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                </g>
            </svg>
            Masuk dengan Google
        </button>

        <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-slate-200 flex-1"></div>
            <span className="text-xs text-slate-400 font-bold uppercase">Atau Email</span>
            <div className="h-px bg-slate-200 flex-1"></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
            <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={20}/>
                <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-brand-blue outline-none" 
                    placeholder="nama@email.com" 
                    required 
                />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
            <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={20}/>
                <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    className="w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-brand-blue outline-none" 
                    placeholder="••••••••" 
                    required 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-400 hover:text-brand-blue">
                    {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-4 bg-brand-blue text-white font-bold rounded-xl hover:bg-brand-dark transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
            {loading && <Loader2 className="animate-spin"/>}
            Masuk Sekarang
          </button>
        </form>

        <p className="text-center mt-8 text-slate-500 text-sm">
            Belum punya akun? <Link href="/register" className="text-brand-blue font-bold hover:underline">Daftar Sekarang</Link>
        </p>
      </div>
    </div>
  );
}