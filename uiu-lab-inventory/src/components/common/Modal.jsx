import { useState, useEffect } from "react";

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
}) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && open) {
        onClose?.();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200`}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-xl leading-none p-1 rounded hover:bg-slate-100 transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-3 px-5 py-4 bg-slate-50 border-t border-slate-200">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// Confirm Modal variant
export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger", // danger, warning, info
  loading = false,
}) {
  const variantStyles = {
    danger: "bg-red-500 hover:bg-red-600",
    warning: "bg-amber-500 hover:bg-amber-600",
    info: "bg-blue-500 hover:bg-blue-600",
    success: "bg-emerald-500 hover:bg-emerald-600",
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50 ${variantStyles[variant]}`}
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </>
      }
    >
      <p className="text-sm text-slate-600">{message}</p>
    </Modal>
  );
}

// Input Modal variant (replaces prompt)
export function InputModal({
  open,
  onClose,
  onSubmit,
  title,
  message,
  label,
  placeholder,
  submitText = "Submit",
  cancelText = "Cancel",
  variant = "info",
  loading = false,
  inputType = "text",
  required = true,
  multiline = false,
  defaultValue = "",
}) {
  const [value, setValue] = useState(defaultValue);

  // Reset value when modal opens
  useEffect(() => {
    if (open) {
      setValue(defaultValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = () => {
    if (required && !value.trim()) return;
    onSubmit(value);
  };

  const variantStyles = {
    danger: "bg-red-500 hover:bg-red-600 focus:ring-red-500",
    warning: "bg-amber-500 hover:bg-amber-600 focus:ring-amber-500",
    info: "bg-blue-500 hover:bg-blue-600 focus:ring-blue-500",
    success: "bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500",
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || (required && !value.trim())}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]}`}
          >
            {loading ? "Processing..." : submitText}
          </button>
        </>
      }
    >
      {message && <p className="text-sm text-slate-600 mb-4">{message}</p>}
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {label}
        </label>
      )}
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={4}
          placeholder={placeholder}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          autoFocus
        />
      ) : (
        <input
          type={inputType}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter" && !multiline) handleSubmit();
          }}
        />
      )}
    </Modal>
  );
}
