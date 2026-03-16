import { useMemo } from "react";

export const THEMES = [
  {
    name: "Sunset Flame",
    accent: "#E8734A",
    accentLight: "#FFF0EB",
    accentDark: "#C8742A",
    grad: "linear-gradient(135deg, #E8734A 0%, #D4543A 100%)",
    bg: "#FAFAF8",
    surface: "#FFFFFF",
    surface2: "#F5F0EB",
    card: "#FFFFFF",
    cardBorder: "rgba(232,115,74,0.12)",
    text: "#1A1A2E",
    text2: "#2D2D44",
    text3: "#6B7280",
    tagBg: "#FFF0EB",
    tagC: "#C8742A"
  },
  {
    name: "Sky Glass",
    accent: "#3B82F6",
    accentLight: "#EFF6FF",
    accentDark: "#1D4ED8",
    grad: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
    bg: "#F8FAFC",
    surface: "#FFFFFF",
    surface2: "#F0F5FF",
    card: "#FFFFFF",
    cardBorder: "rgba(59,130,246,0.12)",
    text: "#0F172A",
    text2: "#1E293B",
    text3: "#64748B",
    tagBg: "#EFF6FF",
    tagC: "#1D4ED8"
  }
];

export const clay = (depth = 1) =>
  `inset 0 2px 4px rgba(255,255,255,${depth * 0.08}), 0 ${depth * 4}px ${depth * 12}px rgba(0,0,0,0.08), 0 ${depth * 2}px ${depth * 4}px rgba(0,0,0,0.04)`;

export function useTheme() {
  return useMemo(() => {
    const index =
      typeof window === "undefined"
        ? 0
        : Number(window.__AP_THEME_INDEX__ || 0) % THEMES.length;
    return THEMES[index];
  }, []);
}
