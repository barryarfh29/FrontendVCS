"use client";

import { useEffect, useState, useRef } from "react";
import { getTemplates, getSettings, updateSettings, type Template } from "@/lib/api";
import { TEMPLATE_META } from "@/lib/template-defaults";
import { TemplateEditor } from "@/components/template-editor";
import {
  FileText,
  ChevronDown,
  ChevronRight,
  Search,
  RefreshCw,
  Clipboard,
  Check,
  X,
  Save,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Category definitions
const CATEGORIES = [
  { id: "all", label: "Semua", color: "bg-white/10 text-foreground ring-border" },
  { id: "customer", label: "Customer Flow", color: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30" },
  { id: "pembayaran", label: "Pembayaran", color: "bg-orange-500/15 text-orange-400 ring-orange-500/30" },
  { id: "session", label: "Session", color: "bg-violet-500/15 text-violet-400 ring-violet-500/30" },
  { id: "loading", label: "Loading", color: "bg-blue-500/15 text-blue-400 ring-blue-500/30" },
  { id: "promo", label: "Promo & Social", color: "bg-yellow-500/15 text-yellow-400 ring-yellow-500/30" },
  { id: "trigger", label: "Trigger Menu", color: "bg-red-500/15 text-red-400 ring-red-500/30" },
] as const;

// All available variables
const ALL_VARIABLES = [
  "{talent_name}", "{price}", "{duration}", "{invoice_id}", "{nominal}",
  "{code}", "{discount}", "{username}", "{count}", "{remaining}", "{desc}",
];

const DEFAULT_TRIGGERS = [
  "menu", "/menu", "katalog", "produk", "daftar", "list", "harga", "price",
  "berapa", "halo", "hai", "hi", "hello", "mau order", "mau join", "nak join",
  "order", "book", "beli", "buy", "paket", "pakej",
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  // Trigger keywords
  const [triggers, setTriggers] = useState<string[]>([]);
  const [triggerInput, setTriggerInput] = useState("");
  const [triggerSaving, setTriggerSaving] = useState(false);
  const [triggerMsg, setTriggerMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function load() {
    try {
      const [tplData, settingsData] = await Promise.all([
        getTemplates(),
        getSettings(),
      ]);
      setTemplates(tplData || []);
      const uo = (settingsData.userbot_order as { triggers?: string[] }) || {};
      setTriggers(Array.isArray(uo.triggers) ? uo.triggers : []);
    } catch (err) {
      console.error("Failed to load templates:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function copyVariable(v: string) {
    navigator.clipboard.writeText(v);
    setCopiedVar(v);
    setTimeout(() => setCopiedVar(null), 1500);
  }

  function getCategoryForKey(key: string): string {
    return TEMPLATE_META[key]?.category || "customer";
  }

  function getCategoryBadge(catId: string) {
    const cat = CATEGORIES.find((c) => c.id === catId);
    if (!cat) return null;
    return (
      <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ring-1 ${cat.color}`}>
        {cat.label}
      </span>
    );
  }

  // Filter templates
  const filteredTemplates = templates.filter((t) => {
    const meta = TEMPLATE_META[t.key];
    const cat = getCategoryForKey(t.key);
    if (activeCategory !== "all" && cat !== activeCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const label = (meta?.label || t.key).toLowerCase();
      const desc = (meta?.description || "").toLowerCase();
      const content = (t.content || "").toLowerCase();
      if (!label.includes(q) && !t.key.includes(q) && !desc.includes(q) && !content.includes(q)) return false;
    }
    return true;
  });

  // Trigger helpers
  function handleTriggerKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTriggers(triggerInput);
    }
  }

  function addTriggers(raw: string) {
    const newTags = raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s && !triggers.includes(s));
    if (newTags.length > 0) setTriggers((prev) => [...prev, ...newTags]);
    setTriggerInput("");
  }

  function removeTrigger(tag: string) {
    setTriggers((prev) => prev.filter((t) => t !== tag));
  }

  async function saveTriggers() {
    setTriggerSaving(true);
    setTriggerMsg(null);
    try {
      await updateSettings({ userbot_order: { triggers } } as Record<string, unknown>);
      setTriggerMsg({ type: "ok", text: "✓ Triggers disimpan!" });
      setTimeout(() => setTriggerMsg(null), 3000);
    } catch (err) {
      setTriggerMsg({ type: "err", text: err instanceof Error ? err.message : "Gagal menyimpan" });
    } finally {
      setTriggerSaving(false);
    }
  }

  function resetTriggers() {
    setTriggers([...DEFAULT_TRIGGERS]);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="ui-spinner" />
      </div>
    );
  }

  const showTriggerCard = activeCategory === "all" || activeCategory === "trigger";

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Template Pesan</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Ubah semua teks bot tanpa edit source code. Klik variabel untuk menyalin.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => load()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-xl bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Reload
          </button>
        </div>
      </div>

      {/* Variables bar */}
      <div className="ui-card p-4">
        <p className="text-xs text-muted-foreground mb-2 font-medium">Variabel tersedia (klik untuk copy):</p>
        <div className="flex flex-wrap gap-1.5">
          {ALL_VARIABLES.map((v) => (
            <button
              key={v}
              onClick={() => copyVariable(v)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded-lg bg-secondary border border-border hover:border-primary hover:text-primary transition-colors"
            >
              {copiedVar === v ? <Check className="h-3 w-3 text-success" /> : <Clipboard className="h-3 w-3 opacity-50" />}
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Category filters + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-3 py-1.5 text-xs rounded-lg ring-1 transition-all font-medium",
                activeCategory === cat.id
                  ? cat.color + " shadow-sm"
                  : "bg-secondary/50 text-muted-foreground ring-border hover:ring-primary/30 hover:text-foreground"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari template..."
            className="pl-9 pr-3 py-2 text-xs rounded-lg bg-secondary border border-border focus:outline-none focus:border-primary w-56"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Counter */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>
          {filteredTemplates.length}/{templates.length} tampil
          {activeCategory !== "all" && ` — ${CATEGORIES.find((c) => c.id === activeCategory)?.label}`}
        </span>
        {expandedKey && (
          <button
            onClick={() => setExpandedKey(null)}
            className="text-primary hover:underline"
          >
            Tutup Semua
          </button>
        )}
        {activeCategory !== "all" && (
          <button
            onClick={() => { setActiveCategory("all"); setSearchQuery(""); }}
            className="text-primary hover:underline"
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* Trigger Keywords Card */}
      {showTriggerCard && (
        <div className="ui-card p-5 border-l-4 border-red-500/50">
          <div className="flex items-start gap-3 mb-3">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-400 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/25 shrink-0">
              <MessageSquare className="h-4 w-4 text-white" />
            </span>
            <div>
              <h3 className="text-sm font-semibold">Trigger Menu / Katalog</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Daftar kata yang membuat userbot CS langsung membalas dengan template Menu. Sticker dari customer juga otomatis trigger menu.
              </p>
            </div>
            {getCategoryBadge("trigger")}
          </div>

          {/* Tags */}
          {triggers.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {triggers.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-md bg-red-500/10 text-red-400 ring-1 ring-red-500/20"
                >
                  {tag}
                  <button type="button" onClick={() => removeTrigger(tag)} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <input
            value={triggerInput}
            onChange={(e) => setTriggerInput(e.target.value)}
            onKeyDown={handleTriggerKeyDown}
            onBlur={() => { if (triggerInput.trim()) addTriggers(triggerInput); }}
            placeholder="menu, halo, order, harga, price..."
            className="w-full px-3 py-2 text-sm font-mono rounded-lg bg-secondary border border-border focus:outline-none focus:border-primary"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            Tekan Enter atau koma untuk menambah. Contoh: halo, menu, harga, paket vip, nak join
          </p>

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={saveTriggers}
              disabled={triggerSaving}
              className="flex items-center gap-1.5 px-4 py-2 text-xs rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/25 transition-all disabled:opacity-50"
            >
              <Save className="h-3 w-3" />
              {triggerSaving ? "Saving..." : "Save Triggers"}
            </button>
            <button
              onClick={resetTriggers}
              className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              Reset Trigger
            </button>
            {triggerMsg && (
              <span className={`text-xs ${triggerMsg.type === "ok" ? "text-success" : "text-destructive"}`}>
                {triggerMsg.text}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Template Cards */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Tidak ada template yang cocok.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTemplates.map((template) => {
            const meta = TEMPLATE_META[template.key];
            const cat = getCategoryForKey(template.key);
            const isExpanded = expandedKey === template.key;

            return (
              <div key={template.key} className="ui-card overflow-hidden">
                {/* Card header - clickable */}
                <button
                  onClick={() => setExpandedKey(isExpanded ? null : template.key)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-secondary/30 transition-colors"
                >
                  <span className={cn(
                    "transition-transform duration-200",
                    isExpanded && "rotate-90"
                  )}>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        {meta?.label || template.key}
                      </span>
                      {getCategoryBadge(cat)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {meta?.description || template.key}
                    </p>
                  </div>
                  <code className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded hidden sm:block">
                    {template.key}
                  </code>
                </button>

                {/* Expanded editor */}
                {isExpanded && (
                  <div className="border-t border-border">
                    <TemplateEditor
                      key={template.key}
                      template={template}
                      onSaved={(updated) => {
                        setTemplates((prev) =>
                          prev.map((t) =>
                            t.key === updated.key ? { ...t, content: updated.content } : t
                          )
                        );
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
