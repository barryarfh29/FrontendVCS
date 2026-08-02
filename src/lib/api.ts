const API_URL = "https://api.vcsroom.site";

/** Token auth: admin_token dari localStorage (diisi di halaman Login). */
export function getAuthToken(): string {
  if (typeof window !== "undefined") {
    return window.localStorage.getItem("admin_token") || "";
  }
  return "";
}

export function setAuthToken(secret: string) {
  if (typeof window !== "undefined") {
    if (secret) window.localStorage.setItem("admin_token", secret);
    else window.localStorage.removeItem("admin_token");
  }
}

export function isLoggedIn(): boolean {
  if (typeof window !== "undefined") {
    return !!window.localStorage.getItem("admin_token");
  }
  return false;
}

export function logout() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("admin_token");
    window.location.href = "/login";
  }
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  if (!token && typeof window !== "undefined" && !endpoint.includes("/api/ping")) {
    window.location.href = "/login";
    throw new Error("Not authenticated");
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("admin_token");
      window.location.href = "/login";
    }
    throw new Error("Unauthorized: token salah atau expired");
  }

  if (res.status === 429) {
    throw new Error("RATE_LIMITED");
  }

  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      if (body?.error) detail = `: ${body.error}`;
    } catch {}
    throw new Error(`API Error: ${res.status} ${res.statusText}${detail}`);
  }

  return res.json();
}

/** Upload file multipart dengan progress (pakai XHR karena fetch belum support upload progress). */
function uploadFile(
  endpoint: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const token = getAuthToken();
    if (!token && typeof window !== "undefined") {
      window.location.href = "/login";
      reject(new Error("Not authenticated"));
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_URL}${endpoint}`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status === 401) {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("admin_token");
          window.location.href = "/login";
        }
        reject(new Error("Unauthorized"));
        return;
      }
      if (xhr.status === 429) {
        reject(new Error("RATE_LIMITED"));
        return;
      }
      try {
        const body = JSON.parse(xhr.responseText || "{}");
        if (xhr.status >= 200 && xhr.status < 300) resolve(body);
        else reject(new Error(body?.error || `Upload failed: ${xhr.status}`));
      } catch {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error("Upload gagal: koneksi terputus"));
    const form = new FormData();
    form.append("file", file, file.name);
    xhr.send(form);
  });
}

export interface Template {
  key: string;
  content: string;
  description?: string;
}

export interface TalentVideo {
  index: number;
  filename: string;
  title?: string;
  length_seconds?: number | null;
  clip_seconds: number | null;
  with_audio?: boolean;
  active?: boolean;
}

export interface TalentPackage {
  duration: number;
  price: number;
  label?: string;
  video_index?: number | null;
}

export interface Talent {
  id: string;
  name: string;
  status: string;
  price?: number;
  duration?: number;
  duration_label?: string;
  packages?: TalentPackage[];
  desc?: string;
  cooldown?: number;
  has_photo?: boolean;
  has_session?: boolean;
  videos?: TalentVideo[];
}

export interface Transaction {
  id: number;
  user_id: number;
  talent_name: string;
  amount: number;
  status: string;
  created_at: number; // unix timestamp (detik) dari backend
}

export interface Settings {
  myr_rate?: number;
  price?: number;
  duration?: number;
  admin_ids?: number[];
  [key: string]: unknown;
}

export interface Activity {
  action: string;
  category: string;
  user_id: number | null;
  details: Record<string, unknown>;
  created_at: number; // unix timestamp (detik) dari backend
}

// Templates
export async function getTemplates(): Promise<Template[]> {
  return fetchAPI("/api/templates");
}

export async function getTemplate(key: string): Promise<Template> {
  return fetchAPI(`/api/templates/${key}`);
}

export async function updateTemplate(
  key: string,
  content: string
): Promise<Template> {
  return fetchAPI(`/api/templates/${key}`, {
    method: "PUT",
    body: JSON.stringify({ content }),
  });
}

// Talents
export async function getTalents(): Promise<Talent[]> {
  return fetchAPI("/api/talents");
}

export async function getTalent(id: string): Promise<Talent> {
  return fetchAPI(`/api/talents/${id}`);
}

export async function createTalent(data: {
  name: string;
  price: number;
  duration: number;
  desc?: string;
  duration_label?: string;
}): Promise<Talent> {
  return fetchAPI("/api/talents", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTalent(
  id: string,
  data: {
    name?: string;
    desc?: string;
    duration?: number;
    duration_label?: string;
    packages?: TalentPackage[];
    price?: number;
    cooldown?: number;
    offline?: boolean;
  }
): Promise<Talent> {
  return fetchAPI(`/api/talents/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteTalent(id: string): Promise<{ ok: boolean }> {
  return fetchAPI(`/api/talents/${id}`, { method: "DELETE" });
}

export async function uploadTalentPhoto(
  id: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ ok: boolean }> {
  return uploadFile(`/api/talents/${id}/photo`, file, onProgress) as Promise<{
    ok: boolean;
  }>;
}

export async function uploadTalentVideo(
  id: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<Talent> {
  return uploadFile(`/api/talents/${id}/videos`, file, onProgress) as Promise<Talent>;
}

export async function updateVideoClip(
  id: string,
  index: number,
  clipSeconds: number | null
): Promise<Talent> {
  return fetchAPI(`/api/talents/${id}/videos/${index}`, {
    method: "PUT",
    body: JSON.stringify({ clip_seconds: clipSeconds }),
  });
}

export async function updateVideoTitle(
  id: string,
  index: number,
  title: string
): Promise<Talent> {
  return fetchAPI(`/api/talents/${id}/videos/${index}`, {
    method: "PUT",
    body: JSON.stringify({ title }),
  });
}

export async function updateVideoAudio(
  id: string,
  index: number,
  withAudio: boolean
): Promise<Talent> {
  return fetchAPI(`/api/talents/${id}/videos/${index}`, {
    method: "PUT",
    body: JSON.stringify({ with_audio: withAudio }),
  });
}

export async function deleteVideo(id: string, index: number): Promise<Talent> {
  return fetchAPI(`/api/talents/${id}/videos/${index}`, { method: "DELETE" });
}

// Admins
export async function getAdmins(): Promise<{ admin_ids: number[] }> {
  return fetchAPI("/api/admins");
}

export async function addAdmin(userId: number): Promise<{ admin_ids: number[] }> {
  return fetchAPI("/api/admins", {
    method: "POST",
    body: JSON.stringify({ user_id: userId }),
  });
}

export async function removeAdmin(userId: number): Promise<{ admin_ids: number[] }> {
  return fetchAPI(`/api/admins/${userId}`, { method: "DELETE" });
}

// Login talent/userbot (nomor -> OTP -> 2FA)
export interface LoginResult {
  login_id?: string;
  needs?: "otp" | "2fa";
  ok?: boolean;
  started?: boolean;
  name?: string;
  user_id?: number;
}

export async function loginSendCode(data: {
  target: "userbot" | "talent";
  talent_id?: string;
  phone: string;
}): Promise<LoginResult> {
  return fetchAPI("/api/login/send-code", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function loginVerifyOtp(
  loginId: string,
  code: string
): Promise<LoginResult> {
  return fetchAPI("/api/login/verify-otp", {
    method: "POST",
    body: JSON.stringify({ login_id: loginId, code }),
  });
}

export async function loginVerify2fa(
  loginId: string,
  password: string
): Promise<LoginResult> {
  return fetchAPI("/api/login/verify-2fa", {
    method: "POST",
    body: JSON.stringify({ login_id: loginId, password }),
  });
}

export async function getUserbotStatus(): Promise<{
  ready: boolean;
  name?: string;
  user_id?: number;
}> {
  return fetchAPI("/api/userbot/status");
}

// Ping - tes koneksi & auth ke backend
export interface PingResult {
  ok: boolean;
  auth: "secret" | "admin_id";
  secret_configured: boolean;
}

/** Tes koneksi memakai token tertentu (tanpa menyimpannya dulu). */
export async function pingApi(token?: string): Promise<PingResult> {
  const res = await fetch(`${API_URL}/api/ping`, {
    headers: { Authorization: `Bearer ${token ?? getAuthToken()}` },
  });
  if (!res.ok) {
    throw new Error(
      res.status === 401
        ? "Unauthorized: secret salah atau belum di-set di backend"
        : `API Error: ${res.status} ${res.statusText}`
    );
  }
  return res.json();
}

// URL media (foto/video) - dipakai langsung di <img>/<video>, auth via ?token=
export function talentPhotoUrl(id: string): string {
  return `${API_URL}/api/talents/${id}/photo?token=${encodeURIComponent(getAuthToken())}`;
}

export function talentVideoFileUrl(id: string, index: number): string {
  return `${API_URL}/api/talents/${id}/videos/${index}/file?token=${encodeURIComponent(getAuthToken())}`;
}

// Settings
export async function getSettings(): Promise<Settings> {
  return fetchAPI("/api/settings");
}

export async function updateSettings(data: Partial<Settings>): Promise<Settings> {
  return fetchAPI("/api/settings", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Transactions
export async function getTransactions(): Promise<Transaction[]> {
  return fetchAPI("/api/transactions");
}

// Promos
export interface Promo {
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  max_uses: number;
  used_count: number;
  talent_ids: string[];
  created_by: string;
  active: boolean;
  created_at: string | number;
}

export async function getPromos(): Promise<Promo[]> {
  return fetchAPI("/api/promos");
}

export async function createPromo(data: {
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  max_uses: number;
  talent_ids?: string[];
  created_by?: string;
}): Promise<Promo> {
  return fetchAPI("/api/promos", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deletePromo(code: string): Promise<{ ok: boolean }> {
  return fetchAPI(`/api/promos/${encodeURIComponent(code)}`, { method: "DELETE" });
}

export async function updatePromo(
  code: string,
  data: {
    discount_type?: "percent" | "fixed";
    discount_value?: number;
    max_uses?: number;
    talent_ids?: string[];
    active?: boolean;
    created_by?: string;
  }
): Promise<Promo> {
  return fetchAPI(`/api/promos/${encodeURIComponent(code)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Activities (auto backup semua kegiatan bot)
export async function getActivities(
  limit = 50,
  category?: string
): Promise<Activity[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (category) params.set("category", category);
  return fetchAPI(`/api/activities?${params.toString()}`);
}
