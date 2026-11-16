import React from "react";

export function Skeleton({ className = "" }) {
  const allClasses = `animate-pulse rounded-xl bg-black/10 dark:bg-white/10 ${className || ""}`;

  return <div aria-hidden="true" className={allClasses} />;
}

export default Skeleton;
