"use client";

import { useEffect, useState } from "react";
import { getTransactions, type Transaction } from "@/lib/api";
import { CreditCard, RefreshCw } from "lucide-react";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load(silent = false) {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await getTransactions();
      setTransactions(data || []);
    } catch (err) {
      console.error("Failed to load transactions:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

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
          <h1 className="text-2xl font-bold gradient-text">Transactions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Riwayat semua transaksi pembayaran
          </p>
        </div>
        <button
          onClick={() => load(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary text-sm text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary/60 flex items-center justify-center">
            <CreditCard className="h-8 w-8 opacity-60" />
          </div>
          <p>Belum ada transaksi.</p>
        </div>
      ) : (
        <div className="ui-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Talent
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    User ID
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                    Amount
                  </th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-secondary/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">
                      {tx.talent_name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                      {tx.user_id}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      Rp {tx.amount?.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          tx.status?.toLowerCase() === "paid"
                            ? "bg-success/15 text-success ring-1 ring-success/30"
                            : tx.status?.toLowerCase() === "pending"
                            ? "bg-warning/15 text-warning ring-1 ring-warning/30"
                            : tx.status?.toLowerCase() === "expired"
                            ? "bg-destructive/15 text-destructive ring-1 ring-destructive/30"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground text-xs">
                      {new Date(tx.created_at * 1000).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
