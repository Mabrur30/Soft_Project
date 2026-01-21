export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  const base = "font-semibold rounded-full transition-colors duration-200";

  const variants = {
    primary: "bg-primary-500 text-white hover:bg-primary-600",
    secondary:
      "border-2 border-primary-500 text-primary-500 hover:bg-primary-50",
    outline:
      "border-2 border-slate-300 text-slate-700 hover:border-primary-500",
    ghost: "text-primary-500 hover:bg-primary-50",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
