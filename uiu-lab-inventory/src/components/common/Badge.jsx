export default function Badge({
  children,
  variant = "default",
  className = "",
}) {
  const variants = {
    default: "bg-slate-100 text-slate-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    error: "bg-red-100 text-red-700",
    primary: "bg-primary-100 text-primary-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
