// Helper parsing/format durasi. Selaras dengan backend handlers/input.py::parse_duration.
// Nilai durasi disimpan sebagai MENIT (boleh desimal, mis. 0.9667 = 58 detik).

/**
 * Parse input durasi menjadi MENIT (boleh desimal). Return angka > 0 atau null.
 * Format yang diterima:
 *   - "1.5" / "1,5" / "2"  -> menit (desimal)
 *   - "58s" / "90s"        -> detik (dikonversi ke menit)
 */
export function parseDuration(text: string): number | null {
  let s = String(text).trim().toLowerCase().replace(",", ".");
  let isSeconds = false;
  if (s.endsWith("s")) {
    isSeconds = true;
    s = s.slice(0, -1).trim();
  }
  const val = parseFloat(s);
  if (isNaN(val) || val <= 0) return null;
  const minutes = isSeconds ? val / 60 : val;
  // Bulatkan pembagian float supaya 58s tersimpan presisi (0.9667)
  return Math.round(minutes * 10000) / 10000;
}

/** Tampilkan durasi menit sebagai teks ramah: "58 detik", "1 menit", "1 menit 30 detik". */
export function formatDuration(minutes: number): string {
  const totalSec = Math.round(minutes * 60);
  if (totalSec < 60) return `${totalSec} detik`;
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return s === 0 ? `${m} menit` : `${m} menit ${s} detik`;
}