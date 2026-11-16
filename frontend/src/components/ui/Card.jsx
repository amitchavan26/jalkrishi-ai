import React from "react";

export function Card({ children, hover = false, className = "", ...props }) {
  const baseClasses =
    "rounded-2xl border border-white/80 dark:border-white/10 bg-surface backdrop-blur-xl shadow-[0_8px_32px_rgba(2,44,34,0.08)] p-5";
  const hoverClasses = hover
    ? "transition hover:-translate-y-1 hover:shadow-xl"
    : "";
  const allClasses = [baseClasses, hoverClasses, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={allClasses} {...props}>
      {children}
    </div>
  );
}

export default Card;
