"use client";

import { useCallback, useEffect, useState } from "react";
import { getActivities, type Activity } from "@/lib/api";
import {
  History,
  User,
  CreditCard,
  Video,
  Shield,
  Server,
  RefreshCw,
} from "lucide-react";

const CATEGORIES = [
  { key: "", label: "Semua" },
  { key: "payment", label: "Payment" },
  { key: "session", label: "Session" },
  { key: "admin", label: "Admin" },
  { key: "user", label: "User" },
  { key: "system", label: "System" },
];

const CATEGORY_STYLE: Record<string, { icon: typeof User; className: string }> = {
  payment: { icon: CreditCard, className: "bg-success/20 text-success" },
  session: { icon: Video, className: "bg-primary/20 text-primary" },
  admin: { icon: Shield, className: "bg-warning/20 text-warning" },
  user: { icon: User, className: "bg-secondary text-foreground" },
  system: { icon: Server, className: "bg-muted text-muted-foreground" },
};

function formatTime(ts: number) {
  if (!ts) return "-";
  return new Date(ts * 1000).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatAction(action: string) {
  return action.replace(/_/g, " ");
}

function formatDetails(details: Record<string, unknown>) {
  const entries = Object.entries(details || {});
  if (entries.length === 0) return null;
  return entries.map(([k, v]) => `${k}: ${String(v)}`).join(" · ");
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (cat: string, silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await getActivities(100, cat || undefined);
      setActivities(data || []);
    } catch (err) {
      console.error("Failed to load activities:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(category);
  }, [category, load]);

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Activity Log</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Backup otomatis semua kegiatan bot ke MongoDB
          </p>
        </div>
        <button
          onClick={() => load(category, true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary text-sm text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              category === c.key
                ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25"
                : "bg-secondary text-muted-foreground hover:text-foreground ring-1 ring-border"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="ui-spinner" />
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary/60 flex items-center justify-center">
            <History className="h-8 w-8 opacity-60" />
          </div>
          <p>Belum ada kegiatan tercatat.</p>
        </div>
      ) : (
        <div className="ui-card divide-y divide-border overflow-hidden">
          {activities.map((a, i) => {
            const style = CATEGORY_STYLE[a.category] || CATEGORY_STYLE.system;
            const Icon = style.icon;
            const details = formatDetails(a.details);
            return (
              <div
                key={i}
                className="flex items-start gap-3 p-4 hover:bg-secondary/30 transition-colors"
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${style.className}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm capitalize">
                      {formatAction(a.action)}
                    </p>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${style.className}`}
                    >
                      {a.category}
                    </span>
                  </div>
                  {details && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {details}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {a.user_id ? `User ${a.user_id} · ` : ""}
                    {formatTime(a.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
