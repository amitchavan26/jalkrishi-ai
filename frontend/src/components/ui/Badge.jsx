import React from "react";

export function Badge({
  children,
  tone = "neutral",
  className = "",
  ...props
}) {
  const baseClasses =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold";
  const toneClasses = {
    success:
      "bg-emerald-100 text-emerald-900 dark:bg-emerald-400/15 dark:text-emerald-300",
    info: "bg-sky-100 text-sky-900 dark:bg-sky-400/15 dark:text-sky-300",
    warning:
      "bg-amber-100 text-amber-900 dark:bg-amber-400/15 dark:text-amber-300",
    danger: "bg-rose-100 text-rose-900 dark:bg-rose-400/15 dark:text-rose-300",
    neutral: "bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-slate-200",
  };

  const allClasses = [baseClasses, toneClasses[tone], className]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={allClasses} {...props}>
      {children}
    </span>
  );
}

export default Badge;
