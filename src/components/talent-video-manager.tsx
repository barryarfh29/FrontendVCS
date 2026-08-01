"use client";

import { useRef, useState } from "react";
import {
  uploadTalentVideo,
  updateVideoClip,
  updateVideoTitle,
  deleteVideo,
  talentVideoFileUrl,
  type Talent,
  type TalentVideo,
} from "@/lib/api";
import { parseDuration, formatDuration } from "@/lib/duration";
import { X, Trash2, Upload, Film, Check, Scissors, Play, Pencil } from "lucide-react";

function formatLength(sec?: number | null): string | null {
  if (typeof sec !== "number" || sec <= 0) return null;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

interface TalentVideoManagerProps {
  talent: Talent;
  onUpdated: (updated: Talent) => void;
  onClose: () => void;
}

export function TalentVideoManager({
  talent,
  onUpdated,
  onClose,
}: TalentVideoManagerProps) {
  const [videos, setVideos] = useState<TalentVideo[]>(talent.videos || []);
  const [clipEditIndex, setClipEditIndex] = useState<number | null>(null);
  const [clipValue, setClipValue] = useState("");
  const [titleEditIndex, setTitleEditIndex] = useState<number | null>(null);
  const [titleValue, setTitleValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function applyUpdated(updated: Talent) {
    setVideos(updated.videos || []);
    onUpdated(updated);
  }

  async function handleSaveClip(video: TalentVideo) {
    setError(null);
    let clipSeconds: number | null = null;
    const raw = clipValue.trim();
    if (raw !== "") {
      // Parser sama dengan durasi talent: "58s" (detik) / "1.5" (menit)
      const mins = parseDuration(raw);
      if (mins === null) {
        setError("Format: 1.5 (menit) atau 58s (detik). Kosongkan untuk durasi penuh.");
        return;
      }
      clipSeconds = Math.round(mins * 60);
    }
    setBusy(true);
    try {
      const updated = await updateVideoClip(talent.id, video.index, clipSeconds);
      applyUpdated(updated);
      setClipEditIndex(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveTitle(video: TalentVideo) {
    setError(null);
    setBusy(true);
    try {
      const updated = await updateVideoTitle(talent.id, video.index, titleValue.trim());
      applyUpdated(updated);
      setTitleEditIndex(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan judul");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(video: TalentVideo) {
    if (!confirm(`Hapus video "${video.filename}"?`)) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await deleteVideo(talent.id, video.index);
      applyUpdated(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus");
    } finally {
      setBusy(false);
    }
  }

  async function handleUpload(file: File) {
    setError(null);
    setUploadProgress(0);
    try {
      const updated = await uploadTalentVideo(talent.id, file, (p) =>
        setUploadProgress(p)
      );
      applyUpdated(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setUploadProgress(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-card rounded-xl border border-border w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold">Video — {talent.name}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Trim = hanya N detik pertama diputar lalu diulang. Kosongkan
              untuk durasi penuh.
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

        {/* Video list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {videos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Film className="h-8 w-8 mx-auto mb-2 opacity-50" />
              Belum ada video.
            </div>
          ) : (
            videos.map((v) => (
              <div key={v.index}>
                <div className="flex items-center gap-3 bg-secondary/50 rounded-lg px-3 py-2.5">
                <Film className="h-4 w-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  {titleEditIndex === v.index ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        autoFocus
                        value={titleValue}
                        onChange={(e) => setTitleValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSaveTitle(v)}
                        placeholder="Judul video (mis. Solo Show)"
                        className="w-full px-2 py-1 text-xs rounded-md bg-card border border-border focus:outline-none focus:border-primary"
                      />
                      <button
                        onClick={() => handleSaveTitle(v)}
                        disabled={busy}
                        className="p-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                        title="Simpan judul"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => setTitleEditIndex(null)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground"
                        title="Batal"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm truncate flex items-center gap-1.5">
                      <span className="truncate">{v.title?.trim() || v.filename}</span>
                      <button
                        onClick={() => {
                          setTitleEditIndex(v.index);
                          setTitleValue(v.title || "");
                          setError(null);
                        }}
                        className="text-muted-foreground hover:text-primary shrink-0"
                        title="Beri/ubah judul"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground truncate">
                    {formatLength(v.length_seconds)
                      ? `Panjang: ${formatLength(v.length_seconds)}`
                      : ""}
                    {v.clip_seconds
                      ? `${formatLength(v.length_seconds) ? " · " : ""}Trim: ${formatDuration(v.clip_seconds / 60)}`
                      : `${formatLength(v.length_seconds) ? "" : "Durasi penuh"}`}
                  </p>
                </div>
                {clipEditIndex === v.index ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      autoFocus
                      value={clipValue}
                      onChange={(e) => setClipValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveClip(v)}
                      placeholder="58s / 1.5"
                      className="w-20 px-2 py-1 text-xs rounded-md bg-card border border-border focus:outline-none focus:border-primary"
                    />
                    <button
                      onClick={() => handleSaveClip(v)}
                      disabled={busy}
                      className="p-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                      title="Simpan trim"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => setClipEditIndex(null)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground"
                      title="Batal"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        setPreviewIndex(previewIndex === v.index ? null : v.index)
                      }
                      className={`p-1.5 rounded-md transition-colors ${
                        previewIndex === v.index
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-primary hover:bg-secondary"
                      }`}
                      title="Preview video"
                    >
                      <Play className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setClipEditIndex(v.index);
                        setClipValue(
                          v.clip_seconds ? `${v.clip_seconds}s` : ""
                        );
                        setError(null);
                      }}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
                      title="Atur trim (potongan durasi)"
                    >
                      <Scissors className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(v)}
                      disabled={busy}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors disabled:opacity-50"
                      title="Hapus video"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                </div>
                {/* Preview player - streaming dari backend (download dari Telegram saat pertama kali) */}
                {previewIndex === v.index && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-border bg-black">
                    <video
                      src={talentVideoFileUrl(talent.id, v.index)}
                      controls
                      autoPlay
                      className="w-full max-h-64"
                      onError={() =>
                        setError(
                          "Video belum bisa dimuat — server mungkin masih mengunduh dari Telegram, coba lagi beberapa detik."
                        )
                      }
                    />
                    {v.clip_seconds ? (
                      <p className="px-3 py-1.5 text-[11px] text-muted-foreground bg-card">
                        Saat sesi, video ini hanya diputar {formatDuration(v.clip_seconds / 60)} pertama lalu diulang.
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Upload */}
        <div className="border-t border-border p-4">
          <input
            ref={fileRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f);
            }}
          />
          {uploadProgress !== null ? (
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>
                  {uploadProgress < 100
                    ? `Uploading... ${uploadProgress}%`
                    : "Server sedang kompres video (ffmpeg)..."}
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm rounded-lg bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              Upload Video Baru
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
