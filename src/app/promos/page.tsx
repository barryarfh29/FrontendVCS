"use client";

import { useEffect, useState } from "react";
import {
  getPromos,
  createPromo,
  updatePromo,
  deletePromo,
  getTalents,
  type Promo,
  type Talent,
} from "@/lib/api";
import { Tag, Plus, Trash2, X, Users, ChevronDown, Pencil, Power } from "lucide-react";

export default function PromosPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);
  const [busyCode, setBusyCode] = useState<string | null>(null);

  async function load() {
    try {
      const [promosData, talentsData] = await Promise.all([
        getPromos(),
        getTalents(),
      ]);
      setPromos(promosData || []);
      setTalents(talentsData || []);
    } catch (err) {
      console.error("Failed to load promos:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function getTalentName(id: string): string {
    const t = talents.find((t) => t.id === id);
    return t ? t.name : id;
  }

  function renderTalentCell(talentIds: string[]) {
    if (!talentIds || talentIds.length === 0) {
      return <span className="text-muted-foreground">Semua</span>;
    }
    const names = talentIds.map(getTalentName);
    if (names.length <= 2) {
      return <span>{names.join(", ")}</span>;
    }
    const visible = names[0];
    const rest = names.slice(1);
    return (
      <span className="group relative cursor-default">
        {visible}, <span className="text-muted-foreground">+{rest.length} lainnya</span>
        <span className="absolute left-0 top-full mt-1 z-10 hidden group-hover:block bg-card border border-border rounded-lg shadow-lg px-3 py-2 text-xs whitespace-nowrap">
          {names.join(", ")}
        </span>
      </span>
    );
  }

  async function handleToggleActive(promo: Promo) {
    setBusyCode(promo.code);
    try {
      const updated = await updatePromo(promo.code, { active: !promo.active });
      setPromos((prev) => prev.map((p) => (p.code === promo.code ? updated : p)));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mengubah status");
    } finally {
      setBusyCode(null);
    }
  }

  async function handleDelete(code: string) {
    if (!confirm(`Hapus promo "${code}"? Tindakan ini permanen.`)) return;
    setBusyCode(code);
    try {
      await deletePromo(code);
      setPromos((prev) => prev.filter((p) => p.code !== code));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus promo");
    } finally {
      setBusyCode(null);
    }
  }

  function getStatus(promo: Promo): { label: string; active: boolean } {
    if (promo.active && (promo.max_uses === 0 || promo.used_count < promo.max_uses)) {
      return { label: "Active", active: true };
    }
    return { label: "Expired", active: false };
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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Promo Codes</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kelola kode promo diskon untuk transaksi
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/25 transition-all"
        >
          <Plus className="h-4 w-4" />
          Tambah Promo
        </button>
      </div>

      {/* Summary */}
      <div className="flex gap-3">
        <div className="flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-xl ring-1 ring-success/25">
          <Tag className="h-4 w-4" />
          <span className="text-sm font-semibold">
            {promos.filter((p) => getStatus(p).active).length} Active
          </span>
        </div>
        <div className="flex items-center gap-2 bg-muted text-muted-foreground px-4 py-2 rounded-xl ring-1 ring-border">
          <Tag className="h-4 w-4" />
          <span className="text-sm font-semibold">{promos.length} Total</span>
        </div>
      </div>

      {/* Table */}
      {promos.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Tag className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Belum ada promo code.</p>
        </div>
      ) : (
        <div className="ui-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Code</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tipe</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nilai</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Talent</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Max Uses</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Used</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Created By</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {promos.map((promo) => {
                  const status = getStatus(promo);
                  return (
                    <tr key={promo.code} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3 font-mono font-semibold">{promo.code}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-md bg-secondary text-xs font-medium">
                          {promo.discount_type === "percent" ? "Percent" : "Fixed"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {promo.discount_type === "percent"
                          ? `${promo.discount_value}%`
                          : `Rp ${promo.discount_value.toLocaleString("id-ID")}`}
                      </td>
                      <td className="px-4 py-3">{renderTalentCell(promo.talent_ids)}</td>
                      <td className="px-4 py-3">{promo.max_uses === 0 ? "Unlimited" : promo.max_uses}</td>
                      <td className="px-4 py-3">{promo.used_count}</td>
                      <td className="px-4 py-3 text-muted-foreground">{promo.created_by || "-"}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleActive(promo)}
                          disabled={busyCode === promo.code}
                          title="Toggle active/inactive"
                          className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-colors disabled:opacity-50 ${
                            status.active
                              ? "bg-success/15 text-success ring-1 ring-success/30 hover:bg-destructive/20 hover:text-destructive hover:ring-destructive/30"
                              : "bg-destructive/15 text-destructive ring-1 ring-destructive/30 hover:bg-success/20 hover:text-success hover:ring-success/30"
                          }`}
                        >
                          <Power className="h-3 w-3" />
                          {status.label}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditingPromo(promo)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            <Pencil className="h-3 w-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(promo.code)}
                            disabled={busyCode === promo.code}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <PromoFormModal
          talents={talents}
          onClose={() => setShowAdd(false)}
          onSaved={(p) => setPromos((prev) => [...prev, p])}
        />
      )}

      {/* Edit Modal */}
      {editingPromo && (
        <PromoFormModal
          talents={talents}
          promo={editingPromo}
          onClose={() => setEditingPromo(null)}
          onSaved={(updated) => {
            setPromos((prev) => prev.map((p) => (p.code === updated.code ? updated : p)));
            setEditingPromo(null);
          }}
        />
      )}
    </div>
  );
}

// ============ Modal Tambah / Edit Promo ============

function PromoFormModal({
  talents,
  promo,
  onClose,
  onSaved,
}: {
  talents: Talent[];
  promo?: Promo;
  onClose: () => void;
  onSaved: (promo: Promo) => void;
}) {
  const isEdit = !!promo;

  const [code, setCode] = useState(promo?.code || "");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">(promo?.discount_type || "percent");
  const [discountValue, setDiscountValue] = useState(promo ? String(promo.discount_value) : "");
  const [maxUses, setMaxUses] = useState(promo ? String(promo.max_uses) : "");
  const [createdBy, setCreatedBy] = useState(promo?.created_by || "");
  const [active, setActive] = useState(promo?.active ?? true);
  const [talentMode, setTalentMode] = useState<"all" | "specific">(
    promo && promo.talent_ids && promo.talent_ids.length > 0 ? "specific" : "all"
  );
  const [selectedTalents, setSelectedTalents] = useState<string[]>(promo?.talent_ids || []);
  const [talentDropdownOpen, setTalentDropdownOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function toggleTalent(id: string) {
    setSelectedTalents((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  async function handleSubmit() {
    setError(null);
    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) return setError("Code wajib diisi");
    const val = Number(discountValue);
    if (isNaN(val) || val <= 0) return setError("Discount value harus angka > 0");
    if (discountType === "percent" && val > 100) return setError("Percent tidak boleh lebih dari 100");
    const uses = maxUses.trim() === "" ? 0 : Number(maxUses);
    if (isNaN(uses) || uses < 0) return setError("Max uses harus angka >= 0");
    if (talentMode === "specific" && selectedTalents.length === 0) {
      return setError("Pilih minimal 1 talent atau gunakan 'Semua Talent'");
    }

    setBusy(true);
    try {
      let result: Promo;
      const talentIds = talentMode === "all" ? [] : selectedTalents;

      if (isEdit) {
        result = await updatePromo(promo.code, {
          discount_type: discountType,
          discount_value: val,
          max_uses: uses,
          talent_ids: talentIds,
          active,
          created_by: createdBy.trim() || undefined,
        });
      } else {
        result = await createPromo({
          code: trimmedCode,
          discount_type: discountType,
          discount_value: val,
          max_uses: uses,
          talent_ids: talentIds,
          created_by: createdBy.trim() || undefined,
        });
      }
      onSaved(result);
      if (!isEdit) onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Gagal ${isEdit ? "menyimpan" : "membuat"} promo`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="ui-card w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl shadow-black/50 animate-fade-up">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <h2 className="text-lg font-semibold">{isEdit ? "Edit Promo" : "Tambah Promo Code"}</h2>
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
            <label className="text-xs text-muted-foreground">Code *</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="PROMO2024"
              disabled={isEdit}
              className="mt-1 w-full px-3 py-2 text-sm rounded-lg bg-secondary border border-border focus:outline-none focus:border-primary uppercase disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Discount Type *</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as "percent" | "fixed")}
                className="mt-1 w-full px-3 py-2 text-sm rounded-lg bg-secondary border border-border focus:outline-none focus:border-primary"
              >
                <option value="percent">Percent (%)</option>
                <option value="fixed">Fixed (Rp)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">
                Discount Value *
              </label>
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === "percent" ? "20" : "10000"}
                className="mt-1 w-full px-3 py-2 text-sm rounded-lg bg-secondary border border-border focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Max Uses (0 = unlimited)</label>
              <input
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="0"
                className="mt-1 w-full px-3 py-2 text-sm rounded-lg bg-secondary border border-border focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Created By</label>
              <input
                value={createdBy}
                onChange={(e) => setCreatedBy(e.target.value)}
                placeholder="admin"
                className="mt-1 w-full px-3 py-2 text-sm rounded-lg bg-secondary border border-border focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Active toggle (only for edit) */}
          {isEdit && (
            <div className="flex items-center justify-between py-1">
              <label className="text-xs text-muted-foreground">Status Aktif</label>
              <button
                type="button"
                onClick={() => setActive(!active)}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  active ? "bg-success" : "bg-muted"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    active ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>
          )}

          {/* Talent restriction */}
          <div>
            <label className="text-xs text-muted-foreground">Berlaku untuk</label>
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={() => { setTalentMode("all"); setSelectedTalents([]); }}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                  talentMode === "all"
                    ? "bg-primary/15 text-primary border-primary/40 font-medium"
                    : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                Semua Talent
              </button>
              <button
                type="button"
                onClick={() => setTalentMode("specific")}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                  talentMode === "specific"
                    ? "bg-primary/15 text-primary border-primary/40 font-medium"
                    : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                Pilih Talent
              </button>
            </div>

            {talentMode === "specific" && (
              <div className="mt-2 relative">
                <button
                  type="button"
                  onClick={() => setTalentDropdownOpen(!talentDropdownOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg bg-secondary border border-border focus:outline-none focus:border-primary text-left"
                >
                  <span className={selectedTalents.length === 0 ? "text-muted-foreground" : ""}>
                    {selectedTalents.length === 0
                      ? "Pilih talent..."
                      : `${selectedTalents.length} talent dipilih`}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${talentDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {talentDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {talents.length === 0 ? (
                      <p className="px-3 py-2 text-xs text-muted-foreground">Tidak ada talent</p>
                    ) : (
                      talents.map((t) => (
                        <label
                          key={t.id}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-secondary/50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTalents.includes(t.id)}
                            onChange={() => toggleTalent(t.id)}
                            className="rounded border-border text-primary focus:ring-primary/50"
                          />
                          <span className="text-sm">{t.name}</span>
                          <span className="text-xs text-muted-foreground ml-auto">{t.id}</span>
                        </label>
                      ))
                    )}
                  </div>
                )}

                {/* Selected chips */}
                {selectedTalents.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selectedTalents.map((id) => {
                      const t = talents.find((t) => t.id === id);
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-md bg-primary/10 text-primary ring-1 ring-primary/20"
                        >
                          <Users className="h-3 w-3" />
                          {t?.name || id}
                          <button
                            type="button"
                            onClick={() => toggleTalent(id)}
                            className="hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={busy}
            className="w-full mt-2 px-4 py-2.5 text-sm rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/25 transition-all disabled:opacity-50"
          >
            {busy ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Buat Promo"}
          </button>
        </div>
      </div>
    </div>
  );
}
