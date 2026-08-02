"use client";

import { useState } from "react";
import {
  loginSendCode,
  loginVerifyOtp,
  loginVerify2fa,
  type LoginResult,
} from "@/lib/api";
import { useEscClose } from "@/lib/use-esc-close";
import { X, Phone, KeyRound, Lock, CheckCircle2 } from "lucide-react";

interface TalentLoginProps {
  target: "userbot" | "talent";
  talentId?: string;
  title?: string;
  onClose: () => void;
  onSuccess?: (result: LoginResult) => void;
}

type Step = "phone" | "otp" | "2fa" | "done";

export function TalentLogin({
  target,
  talentId,
  title,
  onClose,
  onSuccess,
}: TalentLoginProps) {
  useEscClose(onClose);
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loginId, setLoginId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LoginResult | null>(null);

  async function handleSendCode() {
    if (!phone.trim()) {
      setError("Isi nomor telepon (format internasional, mis. +628123456789)");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await loginSendCode({
        target,
        talent_id: talentId,
        phone: phone.trim(),
      });
      if (res.login_id) {
        setLoginId(res.login_id);
        setStep("otp");
      } else {
        setError("Gagal mengirim OTP");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim OTP");
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifyOtp() {
    if (!code.trim()) {
      setError("Isi kode OTP");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await loginVerifyOtp(loginId, code.trim());
      if (res.needs === "2fa") {
        setStep("2fa");
      } else if (res.ok) {
        setResult(res);
        setStep("done");
        onSuccess?.(res);
      } else {
        setError("Verifikasi gagal");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kode OTP salah");
    } finally {
      setBusy(false);
    }
  }

  async function handleVerify2fa() {
    if (!password) {
      setError("Isi password 2FA");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await loginVerify2fa(loginId, password);
      if (res.ok) {
        setResult(res);
        setStep("done");
        onSuccess?.(res);
      } else {
        setError("Verifikasi gagal");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password salah");
    } finally {
      setBusy(false);
    }
  }

  const stepInfo: Record<Step, { icon: React.ReactNode; label: string }> = {
    phone: {
      icon: <Phone className="h-4 w-4" />,
      label: "Nomor Telepon",
    },
    otp: { icon: <KeyRound className="h-4 w-4" />, label: "Kode OTP" },
    "2fa": { icon: <Lock className="h-4 w-4" />, label: "Password 2FA" },
    done: {
      icon: <CheckCircle2 className="h-4 w-4" />,
      label: "Berhasil",
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-card rounded-xl border border-border w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div>
            <h2 className="text-base font-semibold">
              {title || (target === "userbot" ? "Login Userbot" : "Login Akun Talent")}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              {stepInfo[step].icon} {stepInfo[step].label}
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

        <div className="p-5 space-y-4">
          {step === "phone" && (
            <>
              <input
                autoFocus
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                placeholder="+628123456789"
                className="w-full px-3 py-2.5 text-sm rounded-lg bg-secondary border border-border focus:outline-none focus:border-primary"
              />
              <button
                onClick={handleSendCode}
                disabled={busy}
                className="w-full px-4 py-2.5 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {busy ? "Mengirim OTP..." : "Kirim Kode OTP"}
              </button>
            </>
          )}

          {step === "otp" && (
            <>
              <p className="text-xs text-muted-foreground">
                Kode OTP dikirim ke Telegram akun <b>{phone}</b>. Masukkan
                kodenya di bawah.
              </p>
              <input
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
                placeholder="12345"
                className="w-full px-3 py-2.5 text-sm rounded-lg bg-secondary border border-border focus:outline-none focus:border-primary tracking-widest text-center font-mono"
              />
              <button
                onClick={handleVerifyOtp}
                disabled={busy}
                className="w-full px-4 py-2.5 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {busy ? "Memverifikasi..." : "Verifikasi OTP"}
              </button>
            </>
          )}

          {step === "2fa" && (
            <>
              <p className="text-xs text-muted-foreground">
                Akun ini punya verifikasi 2 langkah. Masukkan password 2FA.
              </p>
              <input
                autoFocus
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleVerify2fa()}
                placeholder="Password 2FA"
                className="w-full px-3 py-2.5 text-sm rounded-lg bg-secondary border border-border focus:outline-none focus:border-primary"
              />
              <button
                onClick={handleVerify2fa}
                disabled={busy}
                className="w-full px-4 py-2.5 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {busy ? "Memverifikasi..." : "Login"}
              </button>
            </>
          )}

          {step === "done" && result && (
            <div className="text-center py-4">
              <CheckCircle2 className="h-10 w-10 mx-auto text-success mb-3" />
              <p className="font-medium">Login berhasil!</p>
              <p className="text-sm text-muted-foreground mt-1">
                {result.name} ({result.user_id})
              </p>
              {!result.started && (
                <p className="text-xs text-destructive mt-2">
                  Login OK tapi bot gagal start — restart bot untuk aktivasi.
                </p>
              )}
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Tutup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
