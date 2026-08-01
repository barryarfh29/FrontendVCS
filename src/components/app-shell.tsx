"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { AuthGuard } from "@/components/auth-guard";
import { ToastProvider } from "@/components/toast";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  return (
    <ToastProvider>
      <AuthGuard>
        {isLogin ? (
          children
        ) : (
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="relative flex-1 overflow-y-auto p-4 pt-16 lg:p-6 lg:pt-6">
              <div
                aria-hidden
                className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_60%_40%_at_70%_-10%,rgba(139,92,246,0.12),transparent)]"
              />
              {children}
            </main>
          </div>
        )}
      </AuthGuard>
    </ToastProvider>
  );
}
