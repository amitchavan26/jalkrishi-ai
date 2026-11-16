import React from "react";

export default function RatioGauge({ ratio }) {
  const clampedRatio = Math.max(0, Math.min(1.5, Number(ratio)));

  function point(v) {
    const angle = Math.PI * (1 - v / 1.5);
    const x = 100 + 80 * Math.cos(angle);
    const y = 100 - 80 * Math.sin(angle);
    return { x, y };
  }

  function arcPath(a, b) {
    const p1 = point(a);
    const p2 = point(b);
    return `M ${p1.x} ${p1.y} A 80 80 0 0 1 ${p2.x} ${p2.y}`;
  }

  const needlePoint = point(clampedRatio);
  const needleRadius = 65;
  const needlePointRadius = point((clampedRatio * 65) / 80);

  // ... existing code ...
  return (
    <svg
      viewBox="0 0 200 120"
      role="img"
      aria-label={"Ratio gauge " + Number(ratio).toFixed(2)}
      className="text-ink"
    >
      {/* Arc zones */}
      // ... existing code ...
      <path d={arcPath(0, 0.6)} stroke="#dc2626" strokeWidth={14} fill="none" />
      <path
        d={arcPath(0.6, 0.8)}
        stroke="#eab308"
        strokeWidth={14}
        fill="none"
      />
      <path
        d={arcPath(0.8, 1.0)}
        stroke="#2563eb"
        strokeWidth={14}
        fill="none"
      />
      <path
        d={arcPath(1.0, 1.5)}
        stroke="#16a34a"
        strokeWidth={14}
        fill="none"
      />
      {/* Tick labels */}
      <text
        x={point(0.6).x}
        y={point(0.6).y - 10}
        textAnchor="middle"
        fontSize="10"
        fill="currentColor"
      >
        0.6
      </text>
      <text
        x={point(0.8).x}
        y={point(0.8).y - 10}
        textAnchor="middle"
        fontSize="10"
        fill="currentColor"
      >
        0.8
      </text>
      <text
        x={point(1.0).x}
        y={point(1.0).y - 10}
        textAnchor="middle"
        fontSize="10"
        fill="currentColor"
      >
        1.0
      </text>
      {/* Needle */}
      <line
        x1="100"
        y1="100"
        x2={needlePointRadius.x}
        y2={needlePointRadius.y}
        stroke="currentColor"
        strokeWidth={3}
      />
      {/* Needle circle */}
      <circle cx="100" cy="100" r="4" fill="currentColor" />
    </svg>
  );
}
