"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../lib/supabase"; // Pastikan path ini benar
import { Loader2, LogIn, UserPlus, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // State untuk mode: 'login' atau 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const supabase = createClient();

    if (mode === 'login') {
      // --- LOGIKA LOGIN ---
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message === "Invalid login credentials" 
          ? "Email atau password salah." 
          : error.message);
      } else {
        router.refresh(); // Refresh agar navbar update
        router.push("/"); // Pindah ke Dashboard
      }
    } else {
      // --- LOGIKA DAFTAR ---
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        alert("Pendaftaran berhasil! Silakan login.");
        setMode('login'); // Pindah ke tab login
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* Header Biru */}
        <div className="bg-blue-600 p-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">
            {mode === 'login' ? 'Selamat Datang Kembali' : 'Buat Akun Baru'}
          </h1>
          <p className="text-blue-100 text-sm">
            {mode === 'login' 
              ? 'Masuk untuk melanjutkan progres belajarmu.' 
              : 'Daftar sekarang untuk akses tryout TPA & TBI.'}
          </p>
        </div>

        {/* Form */}
        <div className="p-8">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-100">
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input 
                type="email" 
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input 
                type="password" 
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : (mode === 'login' ? <LogIn size={18}/> : <UserPlus size={18}/>)}
              {mode === 'login' ? 'Masuk Sekarang' : 'Daftar Akun'}
            </button>
          </form>

          {/* Switch Mode */}
          <div className="mt-6 text-center text-sm text-slate-600">
            {mode === 'login' ? "Belum punya akun? " : "Sudah punya akun? "}
            <button 
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErrorMsg(""); }}
              className="text-blue-600 font-bold hover:underline"
            >
              {mode === 'login' ? "Daftar di sini" : "Login di sini"}
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-xs text-slate-400 hover:text-slate-600">Kembali ke Beranda</Link>
          </div>
        </div>
      </div>
    </div>
  );
}