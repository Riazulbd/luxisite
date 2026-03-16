import React from "react";
import { useTheme } from "../../../hooks/useTheme";

function getTone(score, theme) {
  if (score <= 40) return { color: "#ef4444", label: "Poor" };
  if (score <= 70) return { color: "#f59e0b", label: "Needs Work" };
  if (score <= 85) return { color: "#84cc16", label: "Good" };
  return { color: "#22c55e", label: "Excellent" };
}

export default function SeoScoreCircle({ score = 0, size = 120 }) {
  const theme = useTheme();
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (Math.max(0, Math.min(score, 100)) / 100) * circumference;
  const tone = getTone(score, theme);

  return (
    <div style={{ display: "grid", placeItems: "center", gap: 6 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(148,163,184,0.18)"
          strokeWidth="10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={tone.color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text x="50%" y="47%" textAnchor="middle" fontFamily="Outfit, sans-serif" fontSize="1.8rem" fill={theme.text}>
          {score}
        </text>
        <text x="50%" y="62%" textAnchor="middle" fontFamily="Manrope, sans-serif" fontSize="0.78rem" fill={theme.text3}>
          SEO Score
        </text>
      </svg>
      <span style={{ fontFamily: "IBM Plex Mono, monospace", color: tone.color, fontSize: "0.8rem" }}>
        {tone.label}
      </span>
    </div>
  );
}

