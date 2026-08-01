"use client";

import { useEffect, useRef, useState } from "react";
import {
  getTalents,
  getTalent,
  createTalent,
  updateTalent,
  deleteTalent,
  uploadTalentPhoto,
  uploadTalentVideo,
  talentPhotoUrl,
  type Talent,
  type TalentPackage,
} from "@/lib/api";
import { TalentDescEditor } from "@/components/talent-desc-editor";
import { TalentVideoManager } from "@/components/talent-video-manager";
import { TalentLogin } from "@/components/talent-login";
import { parseDuration, formatDuration } from "@/lib/duration";
import {
  Users,
  Wifi,
  WifiOff,
  Pencil,
  Clock,
  Check,
  X,
  Plus,
  Trash2,
  Film,
  Phone,
  ImagePlus,
  Power,
  Layers,
} from "lucide-react";

export default function TalentsPage() {
  const [talents, setTalents] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Talent | null>(null);
  const [videoManaging, setVideoManaging] = useState<Talent | null>(null);
  const [pkgManaging, setPkgManaging] = useState<Talent | null>(null);
  const [loginTalent, setLoginTalent] = useState<Talent | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Inline edit (name/price/duration/cooldown)
  const [editField, setEditField] = useState<{
    id: string;
    field: "name" | "price" | "duration" | "cooldown" | "durationLabel";
  } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  const photoRef = useRef<HTMLInputElement>(null);
  const [photoTargetId, setPhotoTargetId] = useState<string | null>(null);

  async function load() {
    try {
      const data = await getTalents();
      // Ambil detail (videos, cooldown) per talent
      const detailed = await Promise.all(
        (data || []).map((t) => getTalent(t.id).catch(() => t))
      );
      setTalents(detailed);
    } catch (err) {
      console.error("Failed to load talents:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function replaceTalent(updated: Talent) {
    setTalents((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  async function handleToggle(talent: Talent) {
    setBusyId(talent.id);
    try {
      const updated = await updateTalent(talent.id, {
        offline: talent.status === "online",
      });
      replaceTalent(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mengubah status");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(talent: Talent) {
    if (!confirm(`Hapus talent "${talent.name}"? Tindakan ini permanen.`)) return;
    setBusyId(talent.id);
    try {
      await deleteTalent(talent.id);
      setTalents((prev) => prev.filter((t) => t.id !== talent.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus");
    } finally {
      setBusyId(null);
    }
  }

  async function saveEditField() {
    if (!editField) return;
    const { id, field } = editField;
    let payload: Record<string, unknown> = {};
    if (field === "name") {
      if (!editValue.trim()) {
        setEditError("Nama tidak boleh kosong");
        return;
      }
      payload = { name: editValue.trim() };
    } else if (field === "durationLabel") {
      // Teks bebas; boleh kosong (= pakai angka durasi asli)
      payload = { duration_label: editValue.trim() };
    } else if (field === "price") {
      const price = parseInt(editValue, 10);
      if (isNaN(price) || price <= 0) {
        setEditError("Harga harus angka");
        return;
      }
      payload = { price };
    } else {
      // duration / cooldown pakai parser 1.5 (menit) / 58s (detik)
      const mins = parseDuration(editValue);
      if (mins === null) {
        setEditError("Format: 1.5 (menit) atau 58s (detik)");
        return;
      }
      payload = { [field]: mins };
    }
    setEditSaving(true);
    setEditError(null);
    try {
      const updated = await updateTalent(id, payload);
      replaceTalent(updated);
      setEditField(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setEditSaving(false);
    }
  }

  async function handlePhotoSelected(file: File) {
    if (!photoTargetId) return;
    setBusyId(photoTargetId);
    try {
      await uploadTalentPhoto(photoTargetId, file);
      const updated = await getTalent(photoTargetId);
      replaceTalent(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload foto gagal");
    } finally {
      setBusyId(null);
      setPhotoTargetId(null);
      if (photoRef.current) photoRef.current.value = "";
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="ui-spinner" />
      </div>
    );
  }

  const online = talents.filter((t) => t.status === "online");
  const offline = talents.filter((t) => t.status !== "online");

  const stripHtml = (html: string) =>
    html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  const inlineEditor = (
    talent: Talent,
    field: "name" | "price" | "duration" | "cooldown" | "durationLabel",
    placeholder: string
  ) =>
    editField?.id === talent.id && editField.field === field ? (
      <span className="inline-flex items-center gap-1">
        <input
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && saveEditField()}
          placeholder={placeholder}
          className={`px-2 py-0.5 text-xs rounded-md bg-secondary border border-border focus:outline-none focus:border-primary ${
            field === "durationLabel" ? "w-40" : "w-24"
          }`}
        />
        <button
          onClick={saveEditField}
          disabled={editSaving}
          className="p-1 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
        >
          <Check className="h-3 w-3" />
        </button>
        <button
          onClick={() => setEditField(null)}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" />
        </button>
      </span>
    ) : null;

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Talents</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kelola talent: status, harga, durasi, video, dan login akun
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/25 transition-all"
        >
          <Plus className="h-4 w-4" />
          Tambah Talent
        </button>
      </div>

      {/* Summary */}
      <div className="flex gap-3">
        <div className="flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-xl ring-1 ring-success/25">
          <Wifi className="h-4 w-4" />
          <span className="text-sm font-semibold">{online.length} Online</span>
        </div>
        <div className="flex items-center gap-2 bg-muted text-muted-foreground px-4 py-2 rounded-xl ring-1 ring-border">
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-semibold">{offline.length} Offline</span>
        </div>
      </div>

      {/* Hidden photo input (dipakai semua kartu) */}
      <input
        ref={photoRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handlePhotoSelected(f);
        }}
      />

      {/* Talent Grid */}
      {talents.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Tidak ada talent terdaftar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {talents.map((talent) => (
            <div
              key={talent.id}
              className="ui-card ui-card-hover p-5 flex flex-col"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {/* Foto profil talent (petanda visual) - fallback ke ikon */}
                  {talent.has_photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={talentPhotoUrl(talent.id)}
                      alt={talent.name}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-primary/30 shrink-0"
                      onError={(e) => {
                        // Foto gagal dimuat -> sembunyikan img, tampilkan ikon default
                        (e.target as HTMLImageElement).style.display = "none";
                        const fb = (e.target as HTMLImageElement)
                          .nextElementSibling as HTMLElement | null;
                        if (fb) fb.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 ring-2 ring-primary/20 items-center justify-center shrink-0"
                    style={{ display: talent.has_photo ? "none" : "flex" }}
                  >
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium flex items-center gap-1.5">
                      {editField?.id === talent.id && editField.field === "name" ? (
                        inlineEditor(talent, "name", "Nama")
                      ) : (
                        <>
                          {talent.name}
                          <button
                            onClick={() => {
                              setEditField({ id: talent.id, field: "name" });
                              setEditValue(talent.name);
                              setEditError(null);
                            }}
                            className="text-muted-foreground hover:text-primary"
                            title="Edit nama"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                        </>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ID: {talent.id}
                      {talent.has_session ? " · akun ✓" : ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(talent)}
                  disabled={busyId === talent.id}
                  title="Toggle online/offline"
                  className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 transition-colors disabled:opacity-50 ${
                    talent.status === "online"
                      ? "bg-success/15 text-success ring-1 ring-success/30 hover:bg-destructive/20 hover:text-destructive hover:ring-destructive/30"
                      : "bg-muted text-muted-foreground ring-1 ring-border hover:bg-success/20 hover:text-success hover:ring-success/30"
                  }`}
                >
                  <Power className="h-3 w-3" />
                  {talent.status}
                </button>
              </div>

              {/* Harga */}
              <p className="mt-3 text-sm text-muted-foreground flex items-center gap-1.5 flex-wrap">
                {editField?.id === talent.id && editField.field === "price" ? (
                  inlineEditor(talent, "price", "50000")
                ) : (
                  <>
                    Rp {(talent.price || 0).toLocaleString("id-ID")}
                    <button
                      onClick={() => {
                        setEditField({ id: talent.id, field: "price" });
                        setEditValue(String(talent.price || ""));
                        setEditError(null);
                      }}
                      className="text-muted-foreground hover:text-primary"
                      title="Edit harga"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  </>
                )}
                <span>·</span>
                {editField?.id === talent.id && editField.field === "duration" ? (
                  inlineEditor(talent, "duration", "1.5 / 58s")
                ) : (
                  <>
                    <Clock className="h-3 w-3" />
                    {talent.duration ? formatDuration(talent.duration) : "-"}
                    <button
                      onClick={() => {
                        setEditField({ id: talent.id, field: "duration" });
                        setEditValue(String(talent.duration || ""));
                        setEditError(null);
                      }}
                      className="text-muted-foreground hover:text-primary"
                      title="Edit durasi"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  </>
                )}
                <span>·</span>
                {editField?.id === talent.id && editField.field === "cooldown" ? (
                  inlineEditor(talent, "cooldown", "5")
                ) : (
                  <>
                    CD {talent.cooldown || 0}m
                    <button
                      onClick={() => {
                        setEditField({ id: talent.id, field: "cooldown" });
                        setEditValue(String(talent.cooldown || ""));
                        setEditError(null);
                      }}
                      className="text-muted-foreground hover:text-primary"
                      title="Edit cooldown"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  </>
                )}
              </p>
              {editField?.id === talent.id && editError && (
                <p className="text-xs text-destructive mt-1">{editError}</p>
              )}

              {/* Label durasi custom (tampil ke customer, opsional) */}
              <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
                <span className="opacity-70">Label durasi:</span>
                {editField?.id === talent.id && editField.field === "durationLabel" ? (
                  inlineEditor(talent, "durationLabel", "cth: ±5 minutes")
                ) : (
                  <>
                    <span className={talent.duration_label ? "text-foreground" : "italic opacity-60"}>
                      {talent.duration_label || "(pakai angka durasi)"}
                    </span>
                    <button
                      onClick={() => {
                        setEditField({ id: talent.id, field: "durationLabel" });
                        setEditValue(talent.duration_label || "");
                        setEditError(null);
                      }}
                      className="text-muted-foreground hover:text-primary"
                      title="Edit label durasi"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  </>
                )}
              </p>

              {/* Deskripsi preview */}
              <p className="mt-2 text-xs text-muted-foreground line-clamp-2 flex-1">
                {talent.desc && stripHtml(talent.desc)
                  ? stripHtml(talent.desc)
                  : "Belum ada deskripsi."}
              </p>

              {/* Actions */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setVideoManaging(talent)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-lg bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Film className="h-3 w-3" />
                  Video ({talent.videos?.length ?? 0})
                </button>
                <button
                  onClick={() => setEditing(talent)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-lg bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Pencil className="h-3 w-3" />
                  Deskripsi
                </button>
                <button
                  onClick={() => {
                    setPhotoTargetId(talent.id);
                    photoRef.current?.click();
                  }}
                  disabled={busyId === talent.id}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-lg bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50"
                >
                  <ImagePlus className="h-3 w-3" />
                  {talent.has_photo ? "Ganti Foto" : "Upload Foto"}
                </button>
                <button
                  onClick={() => setLoginTalent(talent)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-lg bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Phone className="h-3 w-3" />
                  {talent.has_session ? "Re-login Akun" : "Login Akun"}
                </button>
                <button
                  onClick={() => setPkgManaging(talent)}
                  className="col-span-2 flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-lg bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Layers className="h-3 w-3" />
                  Paket Durasi ({talent.packages?.length ?? 0})
                </button>
                <button
                  onClick={() => handleDelete(talent)}
                  disabled={busyId === talent.id}
                  className="col-span-2 flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-3 w-3" />
                  Hapus Talent
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {editing && (
        <TalentDescEditor
          talent={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => replaceTalent(updated)}
        />
      )}
      {videoManaging && (
        <TalentVideoManager
          talent={videoManaging}
          onClose={() => setVideoManaging(null)}
          onUpdated={(updated) => replaceTalent(updated)}
        />
      )}
      {pkgManaging && (
        <PackageEditor
          talent={pkgManaging}
          onClose={() => setPkgManaging(null)}
          onSaved={(updated) => replaceTalent(updated)}
        />
      )}
      {loginTalent && (
        <TalentLogin
          target="talent"
          talentId={loginTalent.id}
          title={`Login Akun — ${loginTalent.name}`}
          onClose={() => {
            setLoginTalent(null);
            load();
          }}
        />
      )}
      {showAdd && (
        <AddTalentModal
          onClose={() => setShowAdd(false)}
          onCreated={(t) => setTalents((prev) => [...prev, t])}
        />
      )}
    </div>
  );
}

// ============ Modal Tambah Talent ============

function AddTalentModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (talent: Talent) => void;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [desc, setDesc] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setError(null);
    if (!name.trim()) return setError("Nama wajib diisi");
    const priceNum = parseInt(price, 10);
    if (isNaN(priceNum) || priceNum <= 0) return setError("Harga harus angka");
    const mins = parseDuration(duration);
    if (mins === null)
      return setError("Durasi format: 1.5 (menit) atau 58s (detik)");

    setBusy(true);
    try {
      setProgress("Membuat talent...");
      let talent = await createTalent({
        name: name.trim(),
        price: priceNum,
        duration: mins,
        desc,
      });
      if (photo) {
        setProgress("Upload foto...");
        await uploadTalentPhoto(talent.id, photo);
      }
      if (video) {
        talent = await uploadTalentVideo(talent.id, video, (p) =>
          setProgress(
            p < 100 ? `Upload video ${p}%...` : "Kompres video di server..."
          )
        );
      }
      talent = await getTalent(talent.id);
      onCreated(talent);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat talent");
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="ui-card w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl shadow-black/50 animate-fade-up">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <h2 className="text-lg font-semibold">Tambah Talent</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="px-5 py-2 text-sm bg-destructive/10 text-destructive">
            {error}
          </div>
        )}

        <div className="p-5 space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Nama *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full px-3 py-2 text-sm rounded-lg bg-secondary border border-border focus:outline-none focus:border-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Harga (Rp) *</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="50000"
                className="mt-1 w-full px-3 py-2 text-sm rounded-lg bg-secondary border border-border focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">
                Durasi (1.5 / 58s) *
              </label>
              <input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="30"
                className="mt-1 w-full px-3 py-2 text-sm rounded-lg bg-secondary border border-border focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Deskripsi</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              className="mt-1 w-full px-3 py-2 text-sm rounded-lg bg-secondary border border-border focus:outline-none focus:border-primary resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Foto</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                className="mt-1 w-full text-xs text-muted-foreground file:mr-2 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-secondary file:text-secondary-foreground file:text-xs hover:file:bg-primary hover:file:text-primary-foreground file:transition-colors file:cursor-pointer"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">
                Video Pertama
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideo(e.target.files?.[0] || null)}
                className="mt-1 w-full text-xs text-muted-foreground file:mr-2 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-secondary file:text-secondary-foreground file:text-xs hover:file:bg-primary hover:file:text-primary-foreground file:transition-colors file:cursor-pointer"
              />
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={busy}
            className="w-full mt-2 px-4 py-2.5 text-sm rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/25 transition-all disabled:opacity-50"
          >
            {busy ? progress || "Menyimpan..." : "Buat Talent"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ Modal Editor Paket Durasi ============

function PackageEditor({
  talent,
  onClose,
  onSaved,
}: {
  talent: Talent;
  onClose: () => void;
  onSaved: (talent: Talent) => void;
}) {
  const [rows, setRows] = useState<TalentPackage[]>(
    (talent.packages ?? []).map((p) => ({ ...p }))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addRow() {
    setRows((r) => [...r, { duration: 0, price: 0, label: "", video_index: null }]);
  }
  function removeRow(i: number) {
    setRows((r) => r.filter((_, idx) => idx !== i));
  }
  function update(i: number, field: keyof TalentPackage, value: string) {
    setRows((r) =>
      r.map((row, idx) =>
        idx === i
          ? {
              ...row,
              [field]:
                field === "label"
                  ? value
                  : field === "video_index"
                  ? value === ""
                    ? null
                    : Number(value)
                  : value === ""
                  ? 0
                  : Number(value),
            }
          : row
      )
    );
  }

  async function save() {
    for (const p of rows) {
      if (!p.duration || p.duration <= 0)
        return setError("Durasi tiap paket harus lebih dari 0 (menit).");
      if (!p.price || p.price <= 0)
        return setError("Harga tiap paket harus lebih dari 0.");
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await updateTalent(talent.id, {
        packages: rows.map((p) => ({
          duration: Number(p.duration),
          price: Number(p.price),
          label: (p.label || "").trim(),
          video_index:
            p.video_index === null || p.video_index === undefined
              ? null
              : Number(p.video_index),
        })),
      });
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="ui-card w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl shadow-black/50 animate-fade-up">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold">Paket Durasi — {talent.name}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tiap paket punya durasi + harga sendiri. Kosongkan semua = pakai harga/durasi tunggal.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="px-5 py-2 text-sm bg-destructive/10 text-destructive">
            {error}
          </div>
        )}

        <div className="p-5 space-y-3">
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Belum ada paket. Tambahkan paket pertama di bawah.
            </p>
          ) : (
            <div className="space-y-3">
              {rows.map((row, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-secondary/40 border border-border p-3 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <select
                      value={row.video_index ?? ""}
                      onChange={(e) => update(i, "video_index", e.target.value)}
                      className="flex-1 px-2.5 py-2 text-sm rounded-lg bg-card border border-border focus:outline-none focus:border-primary"
                    >
                      <option value="">🔁 Video rotation (otomatis)</option>
                      {(talent.videos ?? []).map((v) => (
                        <option key={v.index} value={v.index}>
                          🎬 {v.title?.trim() || v.filename}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeRow(i)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors shrink-0"
                      title="Hapus paket"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-[1fr_1fr_1.4fr] gap-2">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={row.duration || ""}
                      onChange={(e) => update(i, "duration", e.target.value)}
                      placeholder="Durasi (menit)"
                      className="w-full px-2.5 py-2 text-sm rounded-lg bg-card border border-border focus:outline-none focus:border-primary"
                    />
                    <input
                      type="number"
                      min="0"
                      value={row.price || ""}
                      onChange={(e) => update(i, "price", e.target.value)}
                      placeholder="Harga (Rp)"
                      className="w-full px-2.5 py-2 text-sm rounded-lg bg-card border border-border focus:outline-none focus:border-primary"
                    />
                    <input
                      value={row.label || ""}
                      onChange={(e) => update(i, "label", e.target.value)}
                      placeholder="Label (opsional)"
                      className="w-full px-2.5 py-2 text-sm rounded-lg bg-card border border-border focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={addRow}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-lg border border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Tambah Paket
          </button>

          <button
            onClick={save}
            disabled={saving}
            className="w-full mt-1 px-4 py-2.5 text-sm rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/25 transition-all disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Paket"}
          </button>
        </div>
      </div>
    </div>
  );
}
