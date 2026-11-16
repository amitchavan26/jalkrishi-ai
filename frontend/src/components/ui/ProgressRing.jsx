import React from "react";

export function ProgressRing({
  value,
  size = 120,
  strokeWidth = 10,
  label = "Progress",
  children,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Number.isFinite(value)
    ? Math.max(0, Math.min(100, value))
    : 0;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <div
      role="img"
      aria-label={`${label} ${Math.round(clamped)} percent`}
      style={{ width: size, height: size }}
      className="relative flex items-center justify-center"
    >
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          opacity={0.15}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--primary)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{
            transition: "stroke-dashoffset 0.8s",
            motionReduce: "transition-none",
          }}
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center"
        aria-hidden="true"
      >
        {children}
      </div>
    </div>
  );
}

export default ProgressRing;
