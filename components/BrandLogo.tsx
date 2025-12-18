export default function BrandLogo() {
  return (
    <div className="flex items-center gap-2 select-none">
      {/* Kotak Ikon 'K' */}
      <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center text-white font-bold text-xl font-heading shadow-lg shadow-blue-200">
        K
      </div>
      
      {/* Teks Logo */}
      <div className="flex flex-col justify-center">
        <span className="text-xl font-bold text-slate-800 leading-none font-heading tracking-tight">
          Kelas<span className="text-brand-blue">Fokus</span>
        </span>
        <span className="text-[10px] font-bold text-brand-accent tracking-widest uppercase mt-0.5">
          TPA Mastery
        </span>
      </div>
    </div>
  );
}