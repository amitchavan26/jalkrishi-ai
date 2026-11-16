import React from "react";
import { Card } from "./Card";

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  className = "",
  valueClassName = "",
  ...rest
}) {
  const TrendIcon =
    trend?.direction === "up"
      ? ArrowUp
      : trend?.direction === "down"
        ? ArrowDown
        : Minus;
  return (
    <Card hover className={className} {...rest}>
      <div className="flex items-center justify-between mb-4">
        <div className="rounded-xl bg-primary-soft text-primary p-2.5">
          {Icon && <Icon />}
        </div>
        <span className="text-xs uppercase tracking-widest text-muted">
          {label}
        </span>
      </div>
      <div
        className={`text-3xl font-extrabold tabular-nums tracking-tight text-ink ${valueClassName}`}
      >
        {value}
      </div>
      {trend && (
        <div className="flex items-center gap-1.5 mt-2">
          <TrendIcon aria-hidden className="w-3 h-3" />
          <span className="text-sm text-muted">{trend.text}</span>
        </div>
      )}
    </Card>
  );
}

// SVG icons
function ArrowUp({ className, ...props }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ArrowDown({ className, ...props }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}

function Minus({ className, ...props }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="12" y1="12" x2="18" y2="12" />
    </svg>
  );
}

export default StatCard;
