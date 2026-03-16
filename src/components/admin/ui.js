import { clay } from "../../hooks/useTheme";

export function panelStyle(theme, extra = {}) {
  return {
    background: theme.card,
    border: `1px solid ${theme.cardBorder}`,
    borderRadius: 24,
    boxShadow: clay(1),
    boxSizing: "border-box",
    minWidth: 0,
    maxWidth: "100%",
    ...extra
  };
}

export function inputStyle(theme, extra = {}) {
  return {
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    display: "block",
    boxSizing: "border-box",
    borderRadius: 16,
    border: `1px solid ${theme.cardBorder}`,
    background: theme.surface2,
    color: theme.text,
    padding: "13px 16px",
    fontFamily: "Manrope, sans-serif",
    ...extra
  };
}

export function buttonStyle(theme, variant = "default", extra = {}) {
  const common = {
    border: 0,
    borderRadius: 999,
    padding: "12px 16px",
    cursor: "pointer",
    fontFamily: "Manrope, sans-serif",
    fontWeight: 600,
    boxSizing: "border-box",
    maxWidth: "100%"
  };

  if (variant === "primary") {
    return {
      ...common,
      color: "#fff",
      background: theme.grad,
      boxShadow: clay(0.9),
      ...extra
    };
  }

  if (variant === "ghost") {
    return {
      ...common,
      color: theme.text,
      background: "transparent",
      border: `1px solid ${theme.cardBorder}`,
      ...extra
    };
  }

  if (variant === "danger") {
    return {
      ...common,
      color: "#fff",
      background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
      ...extra
    };
  }

  return {
    ...common,
    color: theme.text,
    background: theme.surface2,
    ...extra
  };
}

export function statusBadgeStyle(theme, status = "draft") {
  const tones = {
    published: { background: "rgba(34,197,94,0.12)", color: "#15803d" },
    draft: { background: theme.tagBg, color: theme.tagC },
    scheduled: { background: "rgba(245,158,11,0.12)", color: "#b45309" },
    trash: { background: "rgba(239,68,68,0.12)", color: "#b91c1c" }
  };
  return {
    display: "inline-flex",
    padding: "6px 12px",
    borderRadius: 999,
    fontFamily: "IBM Plex Mono, monospace",
    fontSize: "0.75rem",
    ...(tones[status] || tones.draft)
  };
}
