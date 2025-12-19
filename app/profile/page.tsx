"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// PERBAIKAN: Tambah satu titik lagi (../../) agar naik ke root folder
import { createClient } from "../../lib/supabase"; 
import { 
    Loader2, User, Mail, Crown, Calendar, History, 
    LogOut, Ticket, ChevronRight 
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // GANTI LINK LYNK.ID ANDA
  const LYNK_ID_URL = "https://lynk.id/kelasfokus";

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      
      // 1. Ambil User Auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      
      const userData = {
        ...user,
        full_name: user.user_metadata?.full_name || "Siswa"
      };
      setUser(userData);

      // 2. Ambil Detail Profile (Status & Tanggal Expired)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(profileData);

      // 3. Ambil Riwayat Voucher
      const { data: voucherData } = await supabase
        .from('vouchers')
        .select('*')
        .eq('used_by', user.id)
        .order('used_at', { ascending: false }); // Urutkan dari yang terbaru
        
      if (voucherData) setVouchers(voucherData);

      setLoading(false);
    };

    init();
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Helper: Cek apakah Premium Masih Berlaku
  const isPremiumActive = () => {
    if (profile?.subscription_status !== 'premium') return false;
    
    // Jika tidak ada tanggal expired, kita anggap dia premium lama (sebelum fitur tanggal ada)
    // Atau jika Anda ingin ketat: if (!profile?.premium_until) return false;
    if (!profile?.premium_until) return true; 
    
    // Cek Tanggal
    const now = new Date();
    const expiry = new Date(profile.premium_until);
    
    // Jika tahun 2099 (Lifetime) atau tanggal belum lewat
    return expiry.getFullYear() === 2099 || expiry > now;
  };

  // Helper: Format Tanggal Indonesia
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (date.getFullYear() === 2099) return "Selamanya (Lifetime)";
    return date.toLocaleDateString('id-ID', { 
        day: 'numeric', month: 'long', year: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
    });
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-brand-blue"/></div>;

  const isPremium = isPremiumActive();

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* --- HEADER PROFIL --- */}
        <div className="bg-white p-6 rounded-3xl border shadow-sm flex items-center gap-4 md:gap-6">
            <div className="w-20 h-20 bg-brand-blue text-white rounded-full flex items-center justify-center font-bold text-3xl shadow-lg ring-4 ring-blue-50">
                {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
                <h1 className="text-xl md:text-2xl font-bold font-heading text-slate-800 truncate">{user?.full_name}</h1>
                <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                    <Mail size={14}/> {user?.email}
                </div>
            </div>
        </div>

        {/* --- KARTU STATUS LANGGANAN --- */}
        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-slate-50 flex items-center gap-2 font-bold text-slate-700">
                <Crown size={18} className={isPremium ? "text-yellow-500" : "text-slate-400"}/>
                Status Langganan
            </div>
            
            <div className="p-6 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    {isPremium ? (
                        <div>
                            <span className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-1.5 rounded-full font-bold text-sm mb-3 border border-yellow-200">
                                <Crown size={14} fill="currentColor"/> AKUN PREMIUM
                            </span>
                            <p className="text-sm text-slate-500 flex items-center justify-center md:justify-start gap-2">
                                <Calendar size={16}/> Berlaku sampai:
                            </p>
                            <p className="text-lg font-bold text-slate-800 mt-1">
                                {formatDate(profile?.premium_until)}
                            </p>
                        </div>
                    ) : (
                        <div>
                            <span className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full font-bold text-sm mb-3 border border-slate-200">
                                <User size={14}/> AKUN GRATIS (BASIC)
                            </span>
                            <p className="text-sm text-slate-500 max-w-xs">
                                Anda hanya dapat mengakses materi & soal terbatas. Upgrade sekarang untuk akses penuh.
                            </p>
                        </div>
                    )}
                </div>

                {/* Tombol Aksi */}
                <div className="flex flex-col gap-2 w-full md:w-auto">
                    {!isPremium && (
                        <a href={LYNK_ID_URL} target="_blank" className="px-6 py-2.5 bg-brand-blue text-white font-bold rounded-xl text-sm hover:bg-brand-dark transition-colors shadow-lg shadow-blue-100 text-center">
                            Beli Premium
                        </a>
                    )}
                    <Link href="/redeem" className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                        <Ticket size={16}/> Tukar Kode Voucher
                    </Link>
                </div>
            </div>
        </div>

        {/* --- RIWAYAT VOUCHER --- */}
        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-slate-50 flex items-center gap-2 font-bold text-slate-700">
                <History size={18} className="text-slate-400"/>
                Riwayat Pembelian / Redeem
            </div>
            
            <div className="p-0">
                {vouchers.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">
                        <Ticket size={32} className="mx-auto mb-2 opacity-20"/>
                        Belum ada riwayat penukaran voucher.
                    </div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 border-b">
                            <tr>
                                <th className="p-4 font-normal">Kode Voucher</th>
                                <th className="p-4 font-normal">Tanggal Tukar</th>
                                <th className="p-4 font-normal text-right">Durasi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {vouchers.map((v) => (
                                <tr key={v.id} className="hover:bg-slate-50">
                                    <td className="p-4 font-mono font-bold text-slate-700">{v.code}</td>
                                    <td className="p-4 text-slate-500">{formatDate(v.used_at)}</td>
                                    <td className="p-4 text-right font-bold text-brand-blue">
                                        {v.duration ? `${v.duration} Hari` : "Lifetime"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>

        {/* --- TOMBOL KELUAR --- */}
        <button 
            onClick={handleLogout} 
            className="w-full py-4 text-red-500 font-bold text-sm bg-red-50 hover:bg-red-100 rounded-2xl transition-colors flex items-center justify-center gap-2"
        >
            <LogOut size={18}/> Keluar dari Aplikasi
        </button>

        <div className="text-center">
            <Link href="/" className="inline-flex items-center text-slate-400 text-sm hover:text-brand-blue font-bold">
                Kembali ke Dashboard <ChevronRight size={16}/>
            </Link>
        </div>

      </div>
    </div>
  );
}