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

  async function loadAll() {
    try {
      const data = await getSettings();
      setSettings(data);
      if (data.myr_rate) setMyrRate(String(data.myr_rate));
      if (data.price) setPrice(String(data.price));
      if (data.duration) setDuration(String(data.duration));
      setAdminIds((data.admin_ids as number[]) || []);
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
