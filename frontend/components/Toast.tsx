"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "error" | "success" | "info";
  onClose: () => void;
}

export default function Toast({ message, type = "error", onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    error:   "bg-red-50 border-red-300 text-red-700",
    success: "bg-green-50 border-green-300 text-green-700",
    info:    "bg-blue-50 border-blue-300 text-blue-700",
  };

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl border shadow-lg text-sm font-medium ${styles[type]}`}>
      <span>{message}</span>
      <button onClick={onClose} className="opacity-60 hover:opacity-100 text-lg leading-none">
        x
      </button>
    </div>
  );
}