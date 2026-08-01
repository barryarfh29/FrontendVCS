"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { X } from "lucide-react";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "warning";
}

interface ToastContextValue {
  showToast: (message: string, type?: "success" | "error" | "warning") => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

let toastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "warning" = "success") => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-fade-up text-sm max-w-sm ${
              toast.type === "success"
                ? "bg-success/10 border-success/30 text-success"
                : toast.type === "warning"
                ? "bg-warning/10 border-warning/30 text-warning"
                : "bg-destructive/10 border-destructive/30 text-destructive"
            }`}
          >
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => dismiss(toast.id)}
              className="p-1 rounded-md hover:bg-black/10 transition-colors shrink-0"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
