import { useState, useEffect, useCallback } from "react";
import { ToastContext } from "../../context/ToastContext";

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (message, duration) => addToast(message, "success", duration),
    error: (message, duration) => addToast(message, "error", duration),
    warning: (message, duration) => addToast(message, "warning", duration),
    info: (message, duration) => addToast(message, "info", duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, removeToast }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

function Toast({ toast, onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const typeStyles = {
    success: {
      bg: "bg-emerald-50 border-emerald-200",
      icon: "✓",
      iconBg: "bg-emerald-500",
      text: "text-emerald-800",
    },
    error: {
      bg: "bg-red-50 border-red-200",
      icon: "✕",
      iconBg: "bg-red-500",
      text: "text-red-800",
    },
    warning: {
      bg: "bg-amber-50 border-amber-200",
      icon: "!",
      iconBg: "bg-amber-500",
      text: "text-amber-800",
    },
    info: {
      bg: "bg-blue-50 border-blue-200",
      icon: "i",
      iconBg: "bg-blue-500",
      text: "text-blue-800",
    },
  };

  const style = typeStyles[toast.type] || typeStyles.info;

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg transition-all duration-300 ${style.bg} ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div
        className={`flex-shrink-0 w-5 h-5 rounded-full ${style.iconBg} text-white text-xs font-bold flex items-center justify-center`}
      >
        {style.icon}
      </div>
      <p className={`text-sm font-medium flex-1 ${style.text}`}>
        {toast.message}
      </p>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-slate-400 hover:text-slate-600 text-lg leading-none"
      >
        ✕
      </button>
    </div>
  );
}
