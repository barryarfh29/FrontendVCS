"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setAuthToken, pingApi } from "@/lib/api";
import { KeyRound, Bot, PlugZap } from "lucide-react";

export default function LoginPage() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleLogin() {
    const trimmed = token.trim();
    if (!trimmed) {
      setError("Masukkan API Secret token");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await pingApi(trimmed);
      if (res.ok) {
        setAuthToken(trimmed);
        router.push("/");
      } else {
        setError("Token tidak valid");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal terhubung ke API"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mt-4 gradient-text">Bot Admin</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Login dengan API Secret token
          </p>
        </div>

        {/* Login Form */}
        <div className="ui-card p-6 space-y-4">
          {error && (
            <div className="px-4 py-2.5 text-sm bg-destructive/10 text-destructive rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5">
              <KeyRound className="h-3 w-3" />
              API Secret Token
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Masukkan token..."
              autoFocus
              className="w-full px-3 py-2.5 text-sm rounded-lg bg-secondary border border-border focus:outline-none focus:border-primary font-mono"
            />
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Token = API_SECRET yang di-set di backend
            </p>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/25 transition-all disabled:opacity-50"
          >
            <PlugZap className="h-4 w-4" />
            {loading ? "Memverifikasi..." : "Login"}
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          vcsroom.site — Telegram Streaming Bot Admin
        </p>
      </div>
    </div>
  );
}
