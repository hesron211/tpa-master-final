"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase"; 
import { 
    Ticket, 
    Plus, 
    Trash2, 
    Loader2, 
    RefreshCw, 
    Copy, 
    CheckCircle2, 
    XCircle,
    Search
} from "lucide-react";

// Sesuaikan dengan struktur tabel Anda
interface Voucher {
  id: string; // UUID
  code: string;
  is_used: boolean;
  duration: number; // Durasi akses (hari)
  created_at: string;
}

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // State Form Input
  const [form, setForm] = useState({
    code: "",
    duration: 30 // Default 30 hari
  });

  useEffect(() => {
    fetchVouchers();
  }, []);

  // 1. AMBIL DATA VOUCHER
  const fetchVouchers = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('vouchers')
      .select('*')
      .order('created_at', { ascending: false }); // Yang baru dibuat paling atas

    if (error) {
      console.error(error);
      alert("Gagal mengambil data voucher.");
    } else {
      setVouchers(data || []);
    }
    setLoading(false);
  };

  // 2. GENERATE KODE ACAK
  const generateRandomCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Tanpa I, 1, O, 0 biar tidak bingung
    let result = "PROMO-";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm({ ...form, code: result });
  };

  // 3. BUAT VOUCHER BARU
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code) return alert("Kode voucher harus diisi!");

    setCreating(true);
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from('vouchers')
        .insert([{
            code: form.code.toUpperCase(), // Pastikan huruf besar
            duration: form.duration,
            is_used: false
        }])
        .select()
        .single();

      if (error) throw error;

      // Reset Form & Update List
      setForm({ code: "", duration: 30 });
      setVouchers([data, ...vouchers]); // Tambah ke paling atas tanpa refresh
      alert("Voucher berhasil dibuat!");

    } catch (err: any) {
      alert("Gagal: " + err.message);
    } finally {
      setCreating(false);
    }
  };

  // 4. HAPUS VOUCHER
  const handleDelete = async (id: string) => {
    if (!confirm("Hapus voucher ini?")) return;
    setDeletingId(id);

    const supabase = createClient();
    const { error } = await supabase.from('vouchers').delete().eq('id', id);

    if (!error) {
      setVouchers(vouchers.filter(v => v.id !== id));
    } else {
      alert("Gagal menghapus.");
    }
    setDeletingId(null);
  };

  // 5. COPY TO CLIPBOARD
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Kode ${text} disalin!`);
  };

  // Filter Search
  const filteredVouchers = vouchers.filter(v => 
    v.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      
      {/* --- BAGIAN KIRI: FORM INPUT --- */}
      <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Ticket className="text-blue-600" />
            Buat Voucher Baru
        </h2>
        
        <form onSubmit={handleCreate} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kode Voucher</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={form.code}
                        onChange={(e) => setForm({...form, code: e.target.value})}
                        placeholder="Contoh: DISKON100"
                        className="w-full p-2 border border-slate-300 rounded-lg uppercase font-bold tracking-wide outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                        type="button" 
                        onClick={generateRandomCode}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg tooltip"
                        title="Generate Acak"
                    >
                        <RefreshCw size={20}/>
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Durasi Akses (Hari)</label>
                <input 
                    type="number" 
                    value={form.duration}
                    onChange={(e) => setForm({...form, duration: parseInt(e.target.value)})}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <button 
                type="submit" 
                disabled={creating}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:bg-blue-300"
            >
                {creating ? <Loader2 className="animate-spin" size={20}/> : <Plus size={20}/>}
                Simpan Voucher
            </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 text-blue-800 text-xs rounded-lg leading-relaxed">
            <p className="font-bold mb-1">💡 Tips:</p>
            Voucher ini digunakan siswa untuk mendapatkan akses premium. Durasi menentukan berapa hari mereka bisa mengakses materi setelah klaim.
        </div>
      </div>

      {/* --- BAGIAN KANAN: DAFTAR VOUCHER --- */}
      <div className="lg:col-span-2 space-y-4">
        
        {/* Search Bar */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-2">
            <Search className="text-slate-400" size={20}/>
            <input 
                type="text" 
                placeholder="Cari kode voucher..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 outline-none text-slate-700"
            />
        </div>

        {/* Tabel Data */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold">
                    <tr>
                        <th className="p-4">Kode Voucher</th>
                        <th className="p-4">Durasi</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                    {loading ? (
                        <tr><td colSpan={4} className="p-8 text-center text-slate-500">Memuat data...</td></tr>
                    ) : filteredVouchers.length === 0 ? (
                        <tr><td colSpan={4} className="p-8 text-center text-slate-500">Belum ada voucher.</td></tr>
                    ) : (
                        filteredVouchers.map((v) => (
                            <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-slate-700 text-base">{v.code}</span>
                                        <button onClick={() => copyToClipboard(v.code)} className="text-slate-400 hover:text-blue-600">
                                            <Copy size={14}/>
                                        </button>
                                    </div>
                                    <span className="text-xs text-slate-400">
                                        Dibuat: {new Date(v.created_at).toLocaleDateString('id-ID')}
                                    </span>
                                </td>
                                <td className="p-4 font-medium text-slate-600">
                                    {v.duration} Hari
                                </td>
                                <td className="p-4">
                                    {v.is_used ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold border border-slate-200">
                                            <XCircle size={12}/> Sudah Dipakai
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-200">
                                            <CheckCircle2 size={12}/> Tersedia
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 text-right">
                                    <button 
                                        onClick={() => handleDelete(v.id)}
                                        disabled={deletingId === v.id || v.is_used}
                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-30"
                                        title="Hapus"
                                    >
                                        {deletingId === v.id ? <Loader2 className="animate-spin" size={16}/> : <Trash2 size={16}/>}
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
  );
}