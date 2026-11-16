import React from "react";

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  type = "button",
  ...props
}) {
  const baseClasses =
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none";

  const variantClasses = {
    primary: "bg-primary text-primary-ink shadow-lg",
    secondary:
      "bg-surface text-ink border border-black/10 dark:border-white/15",
    ghost: "text-primary hover:bg-primary-soft",
    danger: "bg-danger text-white",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const isDisabled = disabled || loading;
  const allClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading}
      data-variant={variant}
      className={allClasses}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin"
          aria-hidden
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
          <path d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10 10 10 0 0 1-10-10 10 10 0 0 1 10-10z" />
        </svg>
      )}
      {children}
    </button>
  );
}

export default Button;
