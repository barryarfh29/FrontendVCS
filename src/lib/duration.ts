// Helper parsing/format durasi. Selaras dengan backend handlers/input.py::parse_duration.
// Nilai durasi disimpan sebagai MENIT (boleh desimal, mis. 0.9667 = 58 detik).

/**
 * Parse input durasi menjadi MENIT (boleh desimal). Return angka > 0 atau null.
 * Format yang diterima:
 *   - "1.5" / "1,5" / "2"  -> menit (desimal)
 *   - "58s" / "90s"        -> detik (dikonversi ke menit)
 *   - "5m3s" / "5m 3s"    -> 5 menit 3 detik
 *   - "5:03" / "5:30"     -> menit:detik
 */
export function parseDuration(text: string): number | null {
  let s = String(text).trim().toLowerCase().replace(",", ".");

  // Format "5m3s" atau "5m 3s" atau "5m"
  const mmsMatch = s.match(/^(\d+(?:\.\d+)?)\s*m\s*(?:(\d+(?:\.\d+)?)\s*s)?$/);
  if (mmsMatch) {
    const mins = parseFloat(mmsMatch[1]);
    const secs = mmsMatch[2] ? parseFloat(mmsMatch[2]) : 0;
    const total = mins + secs / 60;
    if (total <= 0) return null;
    return Math.round(total * 10000) / 10000;
  }

  // Format "5:03" (menit:detik)
  const colonMatch = s.match(/^(\d+):(\d{1,2})$/);
  if (colonMatch) {
    const mins = parseInt(colonMatch[1], 10);
    const secs = parseInt(colonMatch[2], 10);
    if (secs >= 60) return null;
    const total = mins + secs / 60;
    if (total <= 0) return null;
    return Math.round(total * 10000) / 10000;
  }

  // Format "58s" (hanya detik)
  let isSeconds = false;
  if (s.endsWith("s")) {
    isSeconds = true;
    s = s.slice(0, -1).trim();
  }
  const val = parseFloat(s);
  if (isNaN(val) || val <= 0) return null;
  const minutes = isSeconds ? val / 60 : val;
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

/**
 * Parse input harga menjadi angka (Rupiah). Return angka > 0 atau null.
 * Format yang diterima:
 *   - "300000" / "300.000" / "300,000" -> 300000
 *   - "300rb" / "300 rb"              -> 300000
 *   - "1.5jt" / "1,5jt" / "1.5 jt"   -> 1500000
 *   - "275k"                           -> 275000
 */
export function parsePrice(text: string): number | null {
  let s = String(text).trim().toLowerCase();
  if (!s) return null;

  // Format "1.5jt" / "1,5jt"
  const jtMatch = s.match(/^([\d.,]+)\s*jt$/);
  if (jtMatch) {
    const val = parseFloat(jtMatch[1].replace(",", "."));
    if (isNaN(val) || val <= 0) return null;
    return Math.round(val * 1000000);
  }

  // Format "300rb" / "300 rb"
  const rbMatch = s.match(/^([\d.,]+)\s*rb$/);
  if (rbMatch) {
    const val = parseFloat(rbMatch[1].replace(",", "."));
    if (isNaN(val) || val <= 0) return null;
    return Math.round(val * 1000);
  }

  // Format "275k"
  const kMatch = s.match(/^([\d.,]+)\s*k$/);
  if (kMatch) {
    const val = parseFloat(kMatch[1].replace(",", "."));
    if (isNaN(val) || val <= 0) return null;
    return Math.round(val * 1000);
  }

  // Format angka biasa: "300000" / "300.000" / "300,000"
  // Hapus separator ribuan (titik atau koma yang diikuti 3 digit)
  const cleaned = s.replace(/[.,](\d{3})/g, "$1");
  const val = parseInt(cleaned, 10);
  if (isNaN(val) || val <= 0) return null;
  return val;
}

/** Format angka ke tampilan Rupiah ringkas. */
export function formatPrice(amount: number): string {
  if (amount >= 1000000) {
    const jt = amount / 1000000;
    return jt % 1 === 0 ? `${jt}jt` : `${jt.toFixed(1).replace(".0", "")}jt`;
  }
  return `Rp ${amount.toLocaleString("id-ID")}`;
}
