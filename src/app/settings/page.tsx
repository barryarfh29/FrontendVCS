"use client";

import { useEffect, useState } from "react";
import {
  getSettings,
  updateSettings,
  getAdmins,
  addAdmin,
  removeAdmin,
  getUserbotStatus,
  type Settings,
} from "@/lib/api";
import { TalentLogin } from "@/components/talent-login";
import { parseDuration, formatDuration } from "@/lib/duration";
import {
  Save,
  Shield,
  UserPlus,
  Trash2,
  Bot,
  MessageSquare,
  Megaphone,
} from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [myrRate, setMyrRate] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Admins
  const [adminIds, setAdminIds] = useState<number[]>([]);
  const [newAdminId, setNewAdminId] = useState("");
  const [adminBusy, setAdminBusy] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  // Userbot
  const [userbotStatus, setUserbotStatus] = useState<{
    ready: boolean;
    name?: string;
    user_id?: number;
  } | null>(null);
  const [showUserbotLogin, setShowUserbotLogin] = useState(false);

  // Log Channels
  const [logChannelStart, setLogChannelStart] = useState("");
  const [logChannelPayment, setLogChannelPayment] = useState("");
  const [logSaving, setLogSaving] = useState(false);
  const [logMessage, setLogMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // CS Username
  const [csUsername, setCsUsername] = useState("");

  // Fake Buyer
  const [fbEnabled, setFbEnabled] = useState(false);
  const [fbIntervalMin, setFbIntervalMin] = useState("");
  const [fbIntervalMax, setFbIntervalMax] = useState("");
  const [fbDeleteAfter, setFbDeleteAfter] = useState("");
  const [fbSaving, setFbSaving] = useState(false);
  const [fbMessage, setFbMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function loadAll() {
    try {
      const data = await getSettings();
      setSettings(data);
      if (data.myr_rate) setMyrRate(String(data.myr_rate));
      if (data.price) setPrice(String(data.price));
      if (data.duration) setDuration(String(data.duration));
      setAdminIds((data.admin_ids as number[]) || []);
      setLogChannelStart(String(data.log_channel_start || ""));
      setLogChannelPayment(String(data.log_channel_payment || ""));
      setCsUsername(String(data.cs_username || ""));
      // Fake Buyer
      const fb = (data.fake_buyer as { enabled?: boolean; interval_min?: number; interval_max?: number; delete_after?: number }) || {};
      setFbEnabled(!!fb.enabled);
      setFbIntervalMin(fb.interval_min != null ? String(fb.interval_min) : "");
      setFbIntervalMax(fb.interval_max != null ? String(fb.interval_max) : "");
      setFbDeleteAfter(fb.delete_after != null ? String(fb.delete_after) : "");
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
    // Status userbot (non-blocking)
    getUserbotStatus()
      .then(setUserbotStatus)
      .catch(() => setUserbotStatus(null));
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleSave() {
    const rate = parseFloat(myrRate);
    if (isNaN(rate) || rate <= 0) {
      setMessage({ type: "err", text: "Kurs harus angka lebih dari 0" });
      return;
    }
    const priceNum = parseInt(price, 10);
    if (isNaN(priceNum) || priceNum <= 0) {
      setMessage({ type: "err", text: "Harga default harus angka" });
      return;
    }
    const mins = parseDuration(duration);
    if (mins === null) {
      setMessage({ type: "err", text: "Durasi format: 1.5 (menit) atau 58s (detik)" });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const updated = await updateSettings({
        myr_rate: rate,
        price: priceNum,
        duration: mins,
        cs_username: csUsername.trim().replace(/^@/, ""),
      });
      setSettings(updated);
      setMessage({ type: "ok", text: "✓ Settings berhasil disimpan!" });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({
        type: "err",
        text: err instanceof Error ? err.message : "Gagal menyimpan",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveLogChannels() {
    setLogSaving(true);
    setLogMessage(null);
    try {
      const payload: Record<string, number> = {};
      payload.log_channel_start = logChannelStart.trim() ? parseInt(logChannelStart, 10) : 0;
      payload.log_channel_payment = logChannelPayment.trim() ? parseInt(logChannelPayment, 10) : 0;

      if (logChannelStart.trim() && isNaN(payload.log_channel_start)) {
        setLogMessage({ type: "err", text: "Log Channel Start harus angka" });
        setLogSaving(false);
        return;
      }
      if (logChannelPayment.trim() && isNaN(payload.log_channel_payment)) {
        setLogMessage({ type: "err", text: "Log Channel Payment harus angka" });
        setLogSaving(false);
        return;
      }

      await updateSettings(payload);
      setLogMessage({ type: "ok", text: "✓ Log channels berhasil disimpan!" });
      setTimeout(() => setLogMessage(null), 3000);
    } catch (err) {
      setLogMessage({
        type: "err",
        text: err instanceof Error ? err.message : "Gagal menyimpan",
      });
    } finally {
      setLogSaving(false);
    }
  }

  async function handleSaveFakeBuyer() {
    setFbSaving(true);
    setFbMessage(null);
    const min = fbIntervalMin.trim() ? Number(fbIntervalMin) : 0;
    const max = fbIntervalMax.trim() ? Number(fbIntervalMax) : 0;
    const del = fbDeleteAfter.trim() ? Number(fbDeleteAfter) : 0;
    if (isNaN(min) || min < 0) { setFbMessage({ type: "err", text: "Interval min harus angka >= 0" }); setFbSaving(false); return; }
    if (isNaN(max) || max < 0) { setFbMessage({ type: "err", text: "Interval max harus angka >= 0" }); setFbSaving(false); return; }
    if (max > 0 && max < min) { setFbMessage({ type: "err", text: "Interval max harus >= interval min" }); setFbSaving(false); return; }
    if (isNaN(del) || del < 0) { setFbMessage({ type: "err", text: "Delete after harus angka >= 0" }); setFbSaving(false); return; }
    try {
      await updateSettings({
        fake_buyer: { enabled: fbEnabled, interval_min: min, interval_max: max, delete_after: del },
      });
      setFbMessage({ type: "ok", text: "✓ Fake Buyer settings disimpan!" });
      setTimeout(() => setFbMessage(null), 3000);
    } catch (err) {
      setFbMessage({ type: "err", text: err instanceof Error ? err.message : "Gagal menyimpan" });
    } finally {
      setFbSaving(false);
    }
  }

  async function handleAddAdmin() {
    const id = parseInt(newAdminId, 10);
    if (isNaN(id)) {
      setAdminError("User ID harus angka");
      return;
    }
    setAdminBusy(true);
    setAdminError(null);
    try {
      const res = await addAdmin(id);
      setAdminIds(res.admin_ids);
      setNewAdminId("");
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : "Gagal menambah admin");
    } finally {
      setAdminBusy(false);
    }
  }

  async function handleRemoveAdmin(id: number) {
    if (!confirm(`Hapus admin ${id}?`)) return;
    setAdminBusy(true);
    setAdminError(null);
    try {
      const res = await removeAdmin(id);
      setAdminIds(res.admin_ids);
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : "Gagal menghapus admin");
    } finally {
      setAdminBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="ui-spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold gradient-text">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Konfigurasi bot</p>
      </div>

      {/* Harga, durasi default & kurs */}
      <div className="ui-card p-6">
        <h2 className="text-lg font-semibold mb-4">Default Bot</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-muted-foreground">
              Harga default (Rp)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 w-full px-3 py-2 text-sm rounded-lg bg-secondary border border-border focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">
              Durasi default (1.5 / 58s)
            </label>
            <input
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="mt-1 w-full px-3 py-2 text-sm rounded-lg bg-secondary border border-border focus:outline-none focus:border-primary"
            />
            {duration && parseDuration(duration) !== null && (
              <p className="text-[11px] text-muted-foreground mt-1">
                = {formatDuration(parseDuration(duration)!)}
              </p>
            )}
          </div>
          <div>
            <label className="text-xs text-muted-foreground">
              Kurs MYR (Rp per RM 1)
            </label>
            <input
              type="number"
              min="1"
              step="any"
              value={myrRate}
              onChange={(e) => setMyrRate(e.target.value)}
              className="mt-1 w-full px-3 py-2 text-sm rounded-lg bg-secondary border border-border focus:outline-none focus:border-primary"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="text-xs text-muted-foreground">
            CS Username (tanpa @)
          </label>
          <input
            value={csUsername}
            onChange={(e) => setCsUsername(e.target.value)}
            placeholder="contoh: cs_vcsroom"
            className="mt-1 w-full max-w-xs px-3 py-2 text-sm rounded-lg bg-secondary border border-border focus:outline-none focus:border-primary font-mono"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            Username Telegram untuk tombol Customer Service di bot. Kosong = tidak tampil.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-4 flex items-center gap-1.5 px-4 py-2 text-xs rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/25 transition-all disabled:opacity-50"
        >
          <Save className="h-3 w-3" />
          {saving ? "Saving..." : "Save"}
        </button>
        {message && (
          <p
            className={`mt-3 text-sm ${
              message.type === "ok" ? "text-success" : "text-destructive"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>

      {/* Userbot */}
      <div className="ui-card p-6">
        <h2 className="text-lg font-semibold mb-1 flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/25">
            <Bot className="h-4 w-4 text-white" />
          </span>
          Userbot Default
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Akun Telegram yang membuat channel & streaming saat talent tidak
          punya akun sendiri.
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                userbotStatus?.ready ? "bg-success animate-pulse" : "bg-destructive"
              }`}
            />
            <span className="text-sm">
              {userbotStatus?.ready
                ? `Aktif — ${userbotStatus.name} (${userbotStatus.user_id})`
                : "Tidak aktif / belum login"}
            </span>
          </div>
          <button
            onClick={() => setShowUserbotLogin(true)}
            className="px-4 py-2 text-xs rounded-xl bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            {userbotStatus?.ready ? "Re-login Userbot" : "Login Userbot"}
          </button>
        </div>
      </div>

      {/* Log Channels */}
      <div className="ui-card p-6">
        <h2 className="text-lg font-semibold mb-1 flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <MessageSquare className="h-4 w-4 text-white" />
          </span>
          Log Channels
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Channel Telegram untuk menerima log otomatis. Isi 0 atau kosongkan untuk disable.
          Bot harus sudah jadi admin di channel.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground">
              Log Channel Start
            </label>
            <input
              type="text"
              value={logChannelStart}
              onChange={(e) => setLogChannelStart(e.target.value)}
              placeholder="-1001234567890"
              className="mt-1 w-full px-3 py-2 text-sm rounded-lg bg-secondary border border-border focus:outline-none focus:border-primary font-mono"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Channel ID untuk log setiap user /start bot
            </p>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">
              Log Channel Payment
            </label>
            <input
              type="text"
              value={logChannelPayment}
              onChange={(e) => setLogChannelPayment(e.target.value)}
              placeholder="-1009876543210"
              className="mt-1 w-full px-3 py-2 text-sm rounded-lg bg-secondary border border-border focus:outline-none focus:border-primary font-mono"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Channel ID untuk log pembayaran berhasil
            </p>
          </div>
        </div>
        <button
          onClick={handleSaveLogChannels}
          disabled={logSaving}
          className="mt-4 flex items-center gap-1.5 px-4 py-2 text-xs rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/25 transition-all disabled:opacity-50"
        >
          <Save className="h-3 w-3" />
          {logSaving ? "Saving..." : "Save Log Channels"}
        </button>
        {logMessage && (
          <p
            className={`mt-3 text-sm ${
              logMessage.type === "ok" ? "text-success" : "text-destructive"
            }`}
          >
            {logMessage.text}
          </p>
        )}
      </div>

      {/* Fake Buyer (Social Proof) */}
      <div className="ui-card p-6">
        <h2 className="text-lg font-semibold mb-1 flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/25">
            <Megaphone className="h-4 w-4 text-white" />
          </span>
          Fake Buyer (Social Proof)
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Kirim notifikasi pembelian palsu secara otomatis untuk social proof di channel.
        </p>

        {/* Toggle enabled */}
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm">Enabled</label>
          <button
            type="button"
            onClick={() => setFbEnabled(!fbEnabled)}
            className={`relative w-10 h-5 rounded-full transition-colors ${
              fbEnabled ? "bg-success" : "bg-muted"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                fbEnabled ? "translate-x-5" : ""
              }`}
            />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-muted-foreground">
              Interval Min (menit)
            </label>
            <input
              type="number"
              min="0"
              value={fbIntervalMin}
              onChange={(e) => setFbIntervalMin(e.target.value)}
              placeholder="5"
              className="mt-1 w-full px-3 py-2 text-sm rounded-lg bg-secondary border border-border focus:outline-none focus:border-primary"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Minimum jeda antar notifikasi
            </p>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">
              Interval Max (menit)
            </label>
            <input
              type="number"
              min="0"
              value={fbIntervalMax}
              onChange={(e) => setFbIntervalMax(e.target.value)}
              placeholder="15"
              className="mt-1 w-full px-3 py-2 text-sm rounded-lg bg-secondary border border-border focus:outline-none focus:border-primary"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Maximum jeda antar notifikasi
            </p>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">
              Delete After (menit)
            </label>
            <input
              type="number"
              min="0"
              value={fbDeleteAfter}
              onChange={(e) => setFbDeleteAfter(e.target.value)}
              placeholder="0"
              className="mt-1 w-full px-3 py-2 text-sm rounded-lg bg-secondary border border-border focus:outline-none focus:border-primary"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Auto-hapus pesan setelah X menit (0 = tidak hapus)
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveFakeBuyer}
          disabled={fbSaving}
          className="mt-4 flex items-center gap-1.5 px-4 py-2 text-xs rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/25 transition-all disabled:opacity-50"
        >
          <Save className="h-3 w-3" />
          {fbSaving ? "Saving..." : "Save Fake Buyer"}
        </button>
        {fbMessage && (
          <p
            className={`mt-3 text-sm ${
              fbMessage.type === "ok" ? "text-success" : "text-destructive"
            }`}
          >
            {fbMessage.text}
          </p>
        )}
      </div>

      {/* Admins */}
      <div className="ui-card p-6">
        <h2 className="text-lg font-semibold mb-1 flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
            <Shield className="h-4 w-4 text-white" />
          </span>
          Admin Bot
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          User ID Telegram yang bisa mengakses menu admin bot & API web.
        </p>
        <div className="space-y-2 mb-4">
          {adminIds.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada admin.</p>
          ) : (
            adminIds.map((id) => (
              <div
                key={id}
                className="flex items-center justify-between bg-secondary/40 border border-transparent hover:border-border rounded-xl px-3 py-2 transition-colors"
              >
                <code className="text-sm font-mono">{id}</code>
                <button
                  onClick={() => handleRemoveAdmin(id)}
                  disabled={adminBusy}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors disabled:opacity-50"
                  title="Hapus admin"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            value={newAdminId}
            onChange={(e) => setNewAdminId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddAdmin()}
            placeholder="User ID Telegram"
            className="flex-1 px-3 py-2 text-sm rounded-lg bg-secondary border border-border focus:outline-none focus:border-primary"
          />
          <button
            onClick={handleAddAdmin}
            disabled={adminBusy}
            className="flex items-center gap-1.5 px-4 py-2 text-xs rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/25 transition-all disabled:opacity-50"
          >
            <UserPlus className="h-3 w-3" />
            Tambah
          </button>
        </div>
        {adminError && (
          <p className="mt-2 text-sm text-destructive">{adminError}</p>
        )}
      </div>

      {/* Userbot login modal */}
      {showUserbotLogin && (
        <TalentLogin
          target="userbot"
          onClose={() => {
            setShowUserbotLogin(false);
            getUserbotStatus()
              .then(setUserbotStatus)
              .catch(() => {});
          }}
        />
      )}
    </div>
  );
}
