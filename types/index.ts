export type Option = {
  id: string;   // Contoh: "A"
  text: string; // Contoh: "Lapar : Makan"
  image_url?: string; // <--- BARU: Link Gambar Opsi
};

export type Question = {
  id: number;
  category: string;
  question_text: string;
  options: Option[]; // Karena di database tipe JSON, di sini jadi array
  correct_answer: string;
  explanation: string;
  course_id?: number; // Tambahan: ID Kursus (Opsional)
  image_url?: string; // Tambahan: Link Gambar (Opsional)
};

export type Course = {
  id: number;
  title: string;
  slug: string;
  duration_minutes: number;
  question_count: number;
  image_url?: string;
};