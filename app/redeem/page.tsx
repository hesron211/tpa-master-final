"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase";
import { Loader2, Ticket, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function RedeemPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState("");
  const router = useRouter();

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    setLoading(true);
    setMsg("");
    setStatus('idle');

    const supabase = createClient();
    
    // PERBAIKAN DI SINI:
    // Kita ganti nama parameternya jadi 'p_code' agar sinkron dengan SQL baru nanti.
    const { data, error } = await supabase.rpc('redeem_voucher', { 
        p_code: code.trim() 
    });

    setLoading(false);

    if (error) {
        console.error("Error Redeem:", error); // Biar muncul detail di console
        setStatus('error');
        setMsg("Terjadi kesalahan sistem (" + error.message + ").");
        return;
    }

    // Handle Respon
    if (data === 'success') {
        setStatus('success');
        setMsg("Selamat! Akun Anda sekarang PREMIUM.");
        setTimeout(() => router.push("/"), 2000);
    } else if (data === 'error_invalid') {
        setStatus('error');
        setMsg("Kode salah/tidak ditemukan.");
    } else if (data === 'error_used') {
        setStatus('error');
        setMsg("Kode ini sudah terpakai.");
    } else if (data === 'error_not_login') {
        setStatus('error');
        setMsg("Silakan login terlebih dahulu.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border p-8">
        
        <Link href="/" className="inline-flex items-center text-slate-400 hover:text-brand-blue mb-6 text-sm font-bold transition-colors">
            <ArrowLeft size={16} className="mr-1"/> Kembali ke Dashboard
        </Link>

        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-50 text-brand-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <Ticket size={32}/>
            </div>
            <h1 className="text-2xl font-bold font-heading text-slate-800">Aktivasi Premium</h1>
            <p className="text-slate-500 text-sm mt-2">
                Masukkan kode voucher yang Anda terima dari email setelah pembelian di Lynk.id.
            </p>
        </div>

        <form onSubmit={handleRedeem} className="space-y-4">
            <div>
                <input 
                    type="text" 
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())} // Otomatis Kapital
                    placeholder="Contoh: KF-8X92M"
                    className="w-full text-center text-2xl font-mono font-bold tracking-widest p-4 border-2 rounded-xl focus:border-brand-blue focus:ring-4 focus:ring-blue-50 outline-none uppercase placeholder:text-slate-300"
                />
            </div>

            {/* Pesan Status */}
            {status === 'success' && (
                <div className="p-3 bg-green-50 text-green-700 rounded-xl flex items-center gap-2 text-sm font-bold">
                    <CheckCircle size={18}/> {msg}
                </div>
            )}
            {status === 'error' && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl flex items-center gap-2 text-sm font-bold">
                    <XCircle size={18}/> {msg}
                </div>
            )}

            <button 
                type="submit" 
                disabled={loading || status === 'success'}
                className="w-full py-3 bg-brand-blue text-white font-bold rounded-xl hover:bg-brand-dark transition-all shadow-lg shadow-blue-200 disabled:opacity-50 flex justify-center"
            >
                {loading ? <Loader2 className="animate-spin"/> : "Aktifkan Sekarang"}
            </button>
        </form>

        <div className="mt-8 pt-6 border-t text-center">
            <p className="text-xs text-slate-400 mb-2">Belum punya kode?</p>
            <a 
                href="https://lynk.id/kelasfokus" // GANTI DENGAN LINK LYNK.ID ANDA
                target="_blank"
                className="inline-block px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors"
            >
                Beli Kode Akses di Sini
            </a>
        </div>

      </div>
    </div>
  );
}