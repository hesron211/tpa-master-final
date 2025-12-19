"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase";
import { Loader2, Crown, Trash2, Calendar } from "lucide-react";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    const supabase = createClient();
    // Kita ambil data profile lengkap
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fungsi Helper Format Tanggal
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    // Jika tahun 2099 anggap Lifetime
    if (date.getFullYear() === 2099) return "Selamanya";
    
    return date.toLocaleDateString('id-ID', { 
        day: 'numeric', month: 'short', year: 'numeric' 
    });
  };

  // Fungsi Cabut Premium Manual
  const handleRevokePremium = async (id: string) => {
    if(!confirm("Yakin ingin mencabut akses Premium user ini?")) return;
    const supabase = createClient();
    await supabase.from('profiles').update({ subscription_status: 'free', premium_until: null }).eq('id', id);
    fetchUsers();
  };

  if (loading) return <div className="p-8"><Loader2 className="animate-spin"/> Loading data...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 font-heading text-slate-800">Manajemen Siswa</h1>
      
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4">Nama</th>
              <th className="p-4">Email</th>
              <th className="p-4">Status</th>
              <th className="p-4">Aktif Sampai</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isPremium = u.subscription_status === 'premium';
              
              return (
                <tr key={u.id} className="border-b hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-700">{u.full_name}</td>
                  <td className="p-4 text-slate-500">{u.email}</td>
                  <td className="p-4">
                    {isPremium ? (
                        <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit border border-yellow-200">
                            <Crown size={12}/> PREMIUM
                        </span>
                    ) : (
                        <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-xs font-bold border border-slate-200">
                            FREE
                        </span>
                    )}
                  </td>
                  <td className="p-4 text-slate-600 font-mono text-xs">
                    {isPremium ? (
                        <div className="flex items-center gap-1">
                            <Calendar size={12} className="text-slate-400"/>
                            {formatDate(u.premium_until)}
                        </div>
                    ) : "-"}
                  </td>
                  <td className="p-4 text-center">
                    {isPremium && (
                        <button 
                            onClick={() => handleRevokePremium(u.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                            title="Cabut Premium"
                        >
                            <Trash2 size={16}/>
                        </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {users.length === 0 && <div className="p-8 text-center text-slate-400">Belum ada siswa terdaftar.</div>}
      </div>
    </div>
  );
}