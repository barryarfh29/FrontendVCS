"use client";

import { useEffect, useState } from "react";
import { getTransactions, getTalents, getActivities, type Transaction, type Talent, type Activity } from "@/lib/api";
import { useToast } from "@/components/toast";
import { Activity as ActivityIcon, Users, CreditCard, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const [txs, tals, acts] = await Promise.all([
          getTransactions().catch((e) => {
            if (e.message === "RATE_LIMITED") showToast("Rate limited, coba lagi nanti", "warning");
            return [];
          }),
          getTalents().catch((e) => {
            if (e.message === "RATE_LIMITED") showToast("Rate limited, coba lagi nanti", "warning");
            return [];
          }),
          getActivities(10).catch(() => []),
        ]);
        setTransactions(txs || []);
        setTalents(tals || []);
        setActivities(acts || []);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  const today = new Date().toISOString().split("T")[0];
  const todayTxs = transactions.filter((tx) =>
    new Date((tx.created_at || 0) * 1000).toISOString().startsWith(today)
  );
  const totalToday = todayTxs.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const onlineTalents = talents.filter((t) => t.status === "online");

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
        <h1 className="text-2xl font-bold gradient-text">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Ringkasan aktivitas bot hari ini
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={CreditCard}
          label="Transaksi Hari Ini"
          value={todayTxs.length.toString()}
          gradient="from-violet-500 to-purple-600"
          glow="shadow-violet-500/30"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Revenue Hari Ini"
          value={`Rp ${totalToday.toLocaleString("id-ID")}`}
          gradient="from-emerald-400 to-teal-600"
          glow="shadow-emerald-500/30"
        />
        <StatCard
          icon={Users}
          label="Talent Online"
          value={`${onlineTalents.length} / ${talents.length}`}
          gradient="from-sky-400 to-blue-600"
          glow="shadow-sky-500/30"
        />
        <StatCard
          icon={ActivityIcon}
          label="Total Transaksi"
          value={transactions.length.toString()}
          gradient="from-pink-500 to-rose-600"
          glow="shadow-pink-500/30"
        />
      </div>

      {/* Talents & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Talent List */}
        <div className="ui-card p-5">
          <h2 className="text-lg font-semibold mb-4">Talents</h2>
          {talents.length === 0 ? (
            <p className="text-muted-foreground text-sm">Tidak ada talent.</p>
          ) : (
            <div className="space-y-2">
              {talents.map((talent) => (
                <div
                  key={talent.id}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-secondary/40 border border-transparent hover:border-border transition-colors"
                >
                  <span className="text-sm font-medium flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        talent.status === "online" ? "bg-success" : "bg-muted-foreground/40"
                      }`}
                    />
                    {talent.name}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      talent.status === "online"
                        ? "bg-success/15 text-success ring-1 ring-success/30"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {talent.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="ui-card p-5">
          <h2 className="text-lg font-semibold mb-4">Transaksi Terbaru</h2>
          {transactions.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Belum ada transaksi.
            </p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {transactions.slice(0, 10).map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-secondary/40 border border-transparent hover:border-border transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">{tx.talent_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.created_at * 1000).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      Rp {tx.amount?.toLocaleString("id-ID")}
                    </p>
                    <p
                      className={`text-xs ${
                        tx.status?.toLowerCase() === "paid"
                          ? "text-success"
                          : tx.status?.toLowerCase() === "pending"
                          ? "text-warning"
                          : "text-muted-foreground"
                      }`}
                    >
                      {tx.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Aktivitas Terbaru */}
      <div className="ui-card p-5">
        <h2 className="text-lg font-semibold mb-4">Aktivitas Terbaru</h2>
        {activities.length === 0 ? (
          <p className="text-muted-foreground text-sm">Belum ada aktivitas.</p>
        ) : (
          <div className="space-y-2">
            {activities.slice(0, 8).map((a, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-secondary/40 border border-transparent hover:border-border transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium capitalize">
                    {a.action.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {a.category} · {a.created_at ? new Date(a.created_at * 1000).toLocaleString("id-ID") : "-"}
                  </p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                  {a.category}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  gradient,
  glow,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  gradient: string;
  glow: string;
}) {
  return (
    <div className="ui-card ui-card-hover p-5">
      <div
        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg ${glow}`}
      >
        <Icon className="h-5 w-5 text-white" />
      </div>
      <p className="text-xs text-muted-foreground mt-4">{label}</p>
      <p className="text-2xl font-bold tracking-tight mt-0.5">{value}</p>
    </div>
  );
}
