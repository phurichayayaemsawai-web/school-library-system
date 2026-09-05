import React, { useEffect } from "react";
import { CircleCheck, CircleAlert, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastData {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  description?: string;
}

interface ToastProps {
  toast: ToastData | null;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  toast,
  onClose,
  duration = 3500,
}) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [toast, duration, onClose]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-bounce-short">
      <div
        className={cn(
          "flex items-start gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all",
          toast.type === "success" && "bg-emerald-950/90 text-white border-emerald-700",
          toast.type === "error" && "bg-rose-950/90 text-white border-rose-700",
          toast.type === "info" && "bg-slate-900/95 text-white border-slate-700"
        )}
      >
        <div className="mt-0.5 flex-shrink-0">
          {toast.type === "success" && <CircleCheck className="w-5 h-5 text-emerald-400" />}
          {toast.type === "error" && <CircleAlert className="w-5 h-5 text-rose-400" />}
          {toast.type === "info" && <Info className="w-5 h-5 text-sky-400" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">{toast.title}</p>
          {toast.description && (
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              {toast.description}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
