import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const hexToRgba = (value, alpha) => {
  if (!value) return `rgba(255,255,255,${alpha})`;

  if (value.startsWith("#")) {
    let hex = value.slice(1);
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((character) => character + character)
        .join("");
    }

    const numeric = Number.parseInt(hex, 16);
    const red = (numeric >> 16) & 255;
    const green = (numeric >> 8) & 255;
    const blue = numeric & 255;
    return `rgba(${red},${green},${blue},${alpha})`;
  }

  const parts = value.match(/\d+(\.\d+)?/g);
  if (parts && parts.length >= 3) {
    return `rgba(${parts[0]},${parts[1]},${parts[2]},${alpha})`;
  }

  return value;
};

const buildCaseStudyPalette = (theme) => ({
  accent: theme.a1,
  accent2: theme.a2,
  text: theme.text,
  muted: theme.text2,
  subtle: theme.text3,
  border: theme.cardBorder,
  borderSoft: theme.cardBorder,
  borderStrong: theme.hoverBorder,
  labelBackground: theme.card,
  labelBorder: theme.cardBorder,
  chipBackground: theme.tagBg,
  chipBorder: hexToRgba(theme.a1, 0.18),
  chipText: theme.chipC,
  glow: theme.glow1,
  glowSoft: theme.glow2,
  shadow: theme.cardGlow,
  grid: hexToRgba(theme.text, 0.08),
  beforeBar: hexToRgba(theme.text, 0.16),
  chartFill: hexToRgba(theme.a1, 0.1),
  surface: `linear-gradient(180deg, rgba(255,255,255,0.94), ${theme.bg} 100%)`,
  surfaceSoft: `linear-gradient(180deg, rgba(255,255,255,0.98), ${theme.card} 54%, ${theme.bgDark} 100%)`,
  panel: `linear-gradient(135deg, ${theme.bgDark}, ${theme.card} 72%)`,
  overlay: hexToRgba(theme.text, 0.28),
  highlight: `radial-gradient(ellipse 40% 40% at 20% 0%, ${theme.glow1}, transparent), radial-gradient(ellipse 32% 32% at 84% 8%, ${theme.glow2}, transparent)`,
  chartGradientVertical: `linear-gradient(180deg, ${theme.a1}, ${theme.a2})`,
  chartGradientHorizontal: `linear-gradient(90deg, ${theme.a1}, ${theme.a2})`,
  surfaceShadow: "inset 0 1px 0 rgba(255,255,255,0.82), 0 16px 34px rgba(15,23,42,0.08)",
  panelShadow: `0 20px 50px rgba(15,23,42,0.12), ${theme.cardGlow}, inset 0 1px 0 rgba(255,255,255,0.82)`,
  modalShadow: "-20px 0 48px rgba(15,23,42,0.18)",
});

const caseStudies = [
  {
    id: "ellijay-resort",
    tag: "VOICE AI / HOSPITALITY",
    headline: "AI That Books $15K Weekends",
    previewDescription: "VAPI Voice Agent handling inbound calls for a luxury resort",
    previewStat: "$287K+ Revenue",
    summary: "A 24/7 voice agent turned missed inbound calls into qualified luxury buyout bookings before the resort even fully opened.",
    challenge:
      "A luxury mountain resort in North Georgia was preparing for opening and needed to qualify high-intent leads for $10K-$19.5K full property buyouts. There was no staff available to handle inbound call volume, so every missed call was a potential $15K+ weekend lost.",
    build: [
      "VAPI-powered Voice AI agent \"Ellie\" handling all inbound calls 24/7.",
      "Real-time qualification flow covering event type, guest count, budget fit, and preferred dates.",
      "Direct calendar booking integration so qualified leads could book without human intervention.",
      "Automated SMS and email follow-up sequences after every call.",
      "Full GoHighLevel pipeline with stage progression and tagging.",
    ],
    techStack: ["VAPI", "Twilio", "GoHighLevel", "n8n", "Webhooks"],
    stats: [
      { value: 340, suffix: "+", label: "Qualified Leads (60 days)" },
      { value: 78, suffix: "%", label: "Completed Full Qualification" },
      { value: 23, label: "Buyouts Booked" },
      { value: 287, prefix: "$", suffix: "K+", label: "Revenue Attributed to AI" },
      { value: 4.2, decimals: 1, suffix: " min", label: "Avg Call Time (vs 12 min human)" },
      { value: 0, prefix: "$", label: "Spent on Human Appointment Setters" },
    ],
    chart: {
      type: "bars",
      title: "Bookings Per Week",
      labels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"],
      values: [1, 2, 3, 4, 3, 4, 3, 3],
    },
    insight:
      "When the AI handles qualification, every call becomes a revenue opportunity - not an interruption.",
  },
  {
    id: "residual-movement",
    tag: "SMS AI / HEALTH & WELLNESS",
    headline: "Cold List to $186K in 90 Days",
    previewDescription: "AI SMS agent converting cold leads through conversational education",
    previewStat: "$186K SMS Revenue",
    summary: "A compliant SMS AI flow turned a low-engagement list into a conversational sales channel that educated first and converted second.",
    challenge:
      "A DTC health and wellness brand had a large SMS contact list with low engagement, and manual follow-up could not scale. The system needed to educate, qualify, and convert through text conversations compliantly, without triggering carrier violations.",
    build: [
      "AI-powered SMS agent \"Jessica\" on LeadConnector and GoHighLevel.",
      "Conversational education flow that moves from pain discovery to vagus nerve education, permission-based product introduction, and purchase link delivery.",
      "Full A2P 10DLC compliant messaging architecture.",
      "Dynamic merge field personalization across name, interest, and product fit.",
      "3-node n8n classification pipeline mapping interest to product tags in GoHighLevel, plus 7 companion product pathways.",
    ],
    techStack: ["GoHighLevel", "LeadConnector", "OpenAI", "n8n", "A2P 10DLC"],
    stats: [
      { value: 34, suffix: "%", label: "SMS Response Rate (industry avg: 12%)" },
      { value: 22, suffix: "%", label: "Message-to-Purchase Conversion" },
      { value: 4200, suffix: "+", label: "Automated Conversations (90 days)" },
      { value: 186, prefix: "$", suffix: "K", label: "SMS-Attributed Revenue" },
      { value: 0, label: "Compliance Violations" },
    ],
    chart: {
      type: "line",
      title: "Conversion Rate Over 90 Days",
      labels: ["Month 1", "Month 2", "Month 3"],
      values: [14, 18, 22],
      yMax: 25,
    },
    insight:
      "Jessica doesn't sell - she educates. And educated leads convert at 3x the industry average.",
  },
  {
    id: "agency-network",
    tag: "CRM ARCHITECTURE / MULTI-LOCATION",
    headline: "$2.4M Recovered From Dead Leads",
    previewDescription: "Unified CRM architecture across 6 offices with AI routing layer",
    previewStat: "$1.8M Year 1",
    summary: "A fragmented multi-location CRM became one routed, visible revenue system with faster response times, less admin, and measurable recovery from stale opportunities.",
    challenge:
      "A multi-location digital marketing agency with 6 offices and $4.2M annual revenue had a fragmented CRM across locations. Leads leaked between office handoffs, there was no pipeline visibility, and the sales team was spending 40% of their time on manual CRM admin instead of selling.",
    build: [
      "Unified GoHighLevel CRM architecture across all 6 locations.",
      "AI-powered lead routing covering geographic qualification, service matching, and team capacity balancing.",
      "Automated pipeline progression with stage-based triggers.",
      "Real-time revenue dashboard with cross-office visibility.",
      "Voice AI after-hours inbound plus SMS AI for speed-to-lead, and a dead lead reactivation pipeline targeting stale opportunities.",
    ],
    techStack: ["GoHighLevel", "VAPI", "Twilio", "n8n", "Supabase", "Webhooks"],
    stats: [
      { value: 41, suffix: "%", label: "Faster Lead Response (4.2 hrs -> <45 min)" },
      { value: 3.2, decimals: 1, suffix: "x", label: "Pipeline Velocity Increase (6 months)" },
      { value: 2.4, decimals: 1, prefix: "$", suffix: "M", label: "Recovered From Dead Leads" },
      { value: 67, suffix: "%", label: "Reduction in Manual CRM Admin" },
      { value: 1.8, decimals: 1, prefix: "$", suffix: "M", label: "Incremental Revenue Year 1" },
    ],
    chart: {
      type: "comparison",
      title: "Before vs After",
      metrics: [
        { label: "Response Time", before: 4.2, beforeLabel: "4.2 hrs", after: 0.75, afterLabel: "0.75 hrs" },
        { label: "Pipeline Velocity", before: 1, beforeLabel: "1x", after: 3.2, afterLabel: "3.2x" },
        { label: "Admin Time", before: 40, beforeLabel: "40%", after: 13, afterLabel: "13%" },
      ],
    },
    insight:
      "The CRM wasn't broken - it was never architected. Once the system had logic, $2.4M in 'dead' leads turned out to be alive.",
  },
];

const useInViewOnce = (options = { threshold: 0.25 }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || visible || typeof IntersectionObserver === "undefined") {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      options
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [options, visible]);

  return [ref, visible];
};

const formatAnimatedValue = ({ value, decimals = 0, prefix = "", suffix = "" }) => {
  const formattedNumber =
    decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString("en-US");
  return `${prefix}${formattedNumber}${suffix}`;
};

const AnimatedStatValue = ({ stat, animate }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!animate) {
      return undefined;
    }

    let frameId = 0;
    let startTime = 0;
    const duration = 900;

    const step = (timestamp) => {
      if (!startTime) {
        startTime = timestamp;
      }

      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(stat.value * eased);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(step);
      }
    };

    frameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frameId);
  }, [animate, stat.value]);

  const value = animate ? displayValue : stat.value;
  return formatAnimatedValue({ ...stat, value });
};

const CaseStudyLabel = ({ typography, palette, children }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "6px 14px",
      borderRadius: 999,
      border: `1px solid ${palette.labelBorder}`,
      background: palette.labelBackground,
      color: palette.accent,
      fontFamily: typography.mono,
      fontSize: "0.72rem",
      fontWeight: 500,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
    }}
  >
    {children}
  </div>
);

const CaseStudyPreviewCard = ({ study, clay, typography, palette, compact, onOpen }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={() => onOpen(study)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        appearance: "none",
        width: "100%",
        border: `1px solid ${hovered ? palette.borderStrong : palette.border}`,
        borderRadius: compact ? 24 : 28,
        background: palette.surfaceSoft,
        padding: compact ? "24px 20px" : "28px 24px",
        textAlign: "left",
        color: palette.text,
        fontFamily: typography.body,
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        boxShadow: hovered
          ? clay(`${palette.shadow}, 0 0 0 1px ${palette.glowSoft}`)
          : clay(palette.shadow),
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(255,255,255,0.07), transparent 30%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", display: "grid", gap: compact ? 14 : 16 }}>
        <div
          style={{
            fontFamily: typography.mono,
            fontSize: "0.68rem",
            fontWeight: 500,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: palette.muted,
          }}
        >
          {study.tag}
        </div>
        <div
          style={{
            fontFamily: typography.head,
            fontSize: compact ? "2rem" : "2.3rem",
            lineHeight: 0.98,
            letterSpacing: "-0.05em",
            color: palette.accent,
          }}
        >
          {study.headline}
        </div>
        <p
          style={{
            fontFamily: typography.body,
            fontSize: compact ? "0.92rem" : "0.98rem",
            lineHeight: 1.65,
            color: palette.muted,
            maxWidth: 320,
          }}
        >
          {study.previewDescription}
        </p>
        <div
          style={{
            fontFamily: typography.head,
            fontSize: compact ? "1.9rem" : "2.2rem",
            lineHeight: 0.94,
            letterSpacing: "-0.05em",
            color: palette.text,
          }}
        >
          {study.previewStat}
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontFamily: typography.body,
            fontSize: "0.96rem",
            color: palette.accent,
            textDecoration: hovered ? "underline" : "none",
            textUnderlineOffset: 4,
          }}
        >
          Read Case Study -&gt;
        </span>
      </div>
    </button>
  );
};

const ModalSection = ({ title, index, visible, children, typography, palette }) => (
  <section
    style={{
      display: "grid",
      gap: 14,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(16px)",
      transition: `opacity 320ms ease ${120 + index * 70}ms, transform 320ms ease ${120 + index * 70}ms`,
    }}
  >
    <div
      style={{
        fontFamily: typography.body,
        fontSize: "1rem",
        fontWeight: 700,
        color: palette.text,
        letterSpacing: "-0.02em",
      }}
    >
      {title}
    </div>
    {children}
  </section>
);

const CaseStudyStatCard = ({ stat, typography, palette }) => {
  const [ref, visible] = useInViewOnce({ threshold: 0.45 });

  return (
    <div
      ref={ref}
      style={{
        background: palette.surfaceSoft,
        border: `1px solid ${palette.borderSoft}`,
        borderRadius: 22,
        padding: "18px 18px 16px",
        boxShadow: palette.surfaceShadow,
      }}
    >
      <div
        style={{
          fontFamily: typography.head,
          fontSize: "clamp(2rem,4vw,2.6rem)",
          lineHeight: 0.95,
          letterSpacing: "-0.06em",
          color: palette.accent,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <AnimatedStatValue stat={stat} animate={visible} />
      </div>
      <div
        style={{
          marginTop: 10,
          fontFamily: typography.body,
          fontSize: "0.9rem",
          lineHeight: 1.55,
          color: palette.muted,
        }}
      >
        {stat.label}
      </div>
    </div>
  );
};

const BarChart = ({ chart, typography, palette }) => {
  const [ref, visible] = useInViewOnce({ threshold: 0.35 });
  const maxValue = Math.max(...chart.values);

  return (
    <div
      ref={ref}
      style={{
        background: palette.surfaceSoft,
        border: `1px solid ${palette.borderSoft}`,
        borderRadius: 24,
        padding: "20px 18px 18px",
        boxShadow: palette.surfaceShadow,
      }}
    >
      <div style={{ color: palette.text, fontFamily: typography.body, fontSize: "1rem", fontWeight: 700, marginBottom: 18 }}>{chart.title}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(8, minmax(0, 1fr))", alignItems: "end", gap: 10, minHeight: 220 }}>
        {chart.values.map((value, index) => (
          <div key={chart.labels[index]} style={{ display: "grid", justifyItems: "center", gap: 10 }}>
            <span style={{ color: palette.muted, fontSize: "0.72rem", fontFamily: typography.mono }}>{value}</span>
            <div style={{ width: "100%", height: 150, display: "flex", alignItems: "end", justifyContent: "center" }}>
              <div
                style={{
                  width: "100%",
                  maxWidth: 36,
                  height: visible ? `${(value / maxValue) * 150}px` : 0,
                  borderRadius: "16px 16px 8px 8px",
                  background: palette.chartGradientVertical,
                  boxShadow: `0 0 20px ${palette.glowSoft}`,
                  transition: `height 520ms cubic-bezier(0.16,1,0.3,1) ${index * 50}ms`,
                }}
              />
            </div>
            <span style={{ color: palette.muted, fontSize: "0.7rem", fontFamily: typography.mono }}>{chart.labels[index]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const LineChart = ({ chart, typography, palette }) => {
  const [ref, visible] = useInViewOnce({ threshold: 0.35 });
  const width = 520;
  const height = 220;
  const padding = { top: 20, right: 18, bottom: 36, left: 40 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const points = chart.values.map((value, index) => {
    const x = padding.left + (innerWidth / (chart.values.length - 1)) * index;
    const y = padding.top + innerHeight - (value / chart.yMax) * innerHeight;
    return { x, y, label: chart.labels[index] };
  });
  const polyline = points.map((point) => `${point.x},${point.y}`).join(" ");
  const pathD = points.reduce(
    (accumulator, point, index) => `${accumulator}${index === 0 ? "M" : " L"} ${point.x} ${point.y}`,
    ""
  );

  return (
    <div
      ref={ref}
      style={{
        background: palette.surfaceSoft,
        border: `1px solid ${palette.borderSoft}`,
        borderRadius: 24,
        padding: "20px 18px 14px",
        boxShadow: palette.surfaceShadow,
      }}
    >
      <div style={{ color: palette.text, fontFamily: typography.body, fontSize: "1rem", fontWeight: 700, marginBottom: 14 }}>{chart.title}</div>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto", overflow: "visible" }}>
        {[0, 5, 10, 15, 20, 25].map((tick) => {
          const y = padding.top + innerHeight - (tick / chart.yMax) * innerHeight;
          return (
            <g key={tick}>
              <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke={palette.grid} strokeWidth="1" />
              <text x={padding.left - 10} y={y + 4} textAnchor="end" fill={palette.muted} fontSize="11" fontFamily={typography.mono}>
                {tick}%
              </text>
            </g>
          );
        })}
        <path d={`${pathD} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`} fill={palette.chartFill} />
        <polyline
          points={polyline}
          fill="none"
          stroke={palette.accent}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            filter: `drop-shadow(0 0 8px ${palette.glow})`,
            strokeDasharray: 1000,
            strokeDashoffset: visible ? 0 : 1000,
            transition: "stroke-dashoffset 900ms ease",
          }}
        />
        {points.map((point, index) => (
          <g key={point.label}>
            <circle
              cx={point.x}
              cy={point.y}
              r="5"
              fill={palette.accent}
              style={{
                transformOrigin: `${point.x}px ${point.y}px`,
                transform: visible ? "scale(1)" : "scale(0)",
                transition: `transform 240ms ease ${index * 90 + 260}ms`,
              }}
            />
            <text x={point.x} y={height - 12} textAnchor="middle" fill={palette.muted} fontSize="11" fontFamily={typography.mono}>
              {point.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

const ComparisonChart = ({ chart, typography, palette }) => {
  const [ref, visible] = useInViewOnce({ threshold: 0.3 });
  const maxValue = Math.max(...chart.metrics.flatMap((metric) => [metric.before, metric.after]));

  return (
    <div
      ref={ref}
      style={{
        background: palette.surfaceSoft,
        border: `1px solid ${palette.borderSoft}`,
        borderRadius: 24,
        padding: "20px 18px 18px",
        boxShadow: palette.surfaceShadow,
      }}
    >
      <div style={{ color: palette.text, fontFamily: typography.body, fontSize: "1rem", fontWeight: 700, marginBottom: 18 }}>{chart.title}</div>
      <div style={{ display: "grid", gap: 18 }}>
        {chart.metrics.map((metric, index) => (
          <div key={metric.label} style={{ display: "grid", gap: 8 }}>
            <div style={{ fontFamily: typography.mono, fontSize: "0.72rem", letterSpacing: "0.12em", color: palette.muted, textTransform: "uppercase" }}>
              {metric.label}
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ display: "grid", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: "0.82rem", color: palette.muted }}>
                  <span>Before</span>
                  <span>{metric.beforeLabel}</span>
                </div>
                <div style={{ height: 12, borderRadius: 999, background: palette.grid, overflow: "hidden" }}>
                  <div
                    style={{
                      width: visible ? `${(metric.before / maxValue) * 100}%` : 0,
                      height: "100%",
                      borderRadius: 999,
                      background: palette.beforeBar,
                      transition: `width 520ms cubic-bezier(0.16,1,0.3,1) ${index * 70}ms`,
                    }}
                  />
                </div>
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: "0.82rem", color: palette.text }}>
                  <span>After</span>
                  <span>{metric.afterLabel}</span>
                </div>
                <div style={{ height: 12, borderRadius: 999, background: palette.grid, overflow: "hidden" }}>
                  <div
                    style={{
                      width: visible ? `${(metric.after / maxValue) * 100}%` : 0,
                      height: "100%",
                      borderRadius: 999,
                      background: palette.chartGradientHorizontal,
                      boxShadow: `0 0 16px ${palette.glow}`,
                      transition: `width 520ms cubic-bezier(0.16,1,0.3,1) ${index * 70 + 100}ms`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CaseStudyChart = ({ study, typography, palette }) => {
  if (study.chart.type === "bars") {
    return <BarChart chart={study.chart} typography={typography} palette={palette} />;
  }

  if (study.chart.type === "line") {
    return <LineChart chart={study.chart} typography={typography} palette={palette} />;
  }

  return <ComparisonChart chart={study.chart} typography={typography} palette={palette} />;
};

const CaseStudyModal = ({ study, onClose, compact, typography, palette }) => {
  const [visible, setVisible] = useState(false);
  const closeTimerRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const enterFrame = window.requestAnimationFrame(() => setVisible(true));

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(enterFrame);
      window.removeEventListener("keydown", handleKeyDown);
      window.clearTimeout(closeTimerRef.current);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const handleClose = () => {
    setVisible(false);
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(onClose, 280);
  };

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        justifyContent: "flex-end",
        pointerEvents: "auto",
      }}
    >
      <button
        type="button"
        aria-label="Close case study"
        onClick={handleClose}
        style={{
          position: "absolute",
          inset: 0,
          border: "none",
          background: visible ? palette.overlay : "rgba(0,0,0,0)",
          transition: "background 260ms ease",
          cursor: "pointer",
        }}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={study.headline}
        style={{
          position: "relative",
          width: compact ? "100vw" : "min(65vw, 920px)",
          height: "100vh",
          background: palette.surface,
          color: palette.text,
          borderLeft: compact ? "none" : `1px solid ${palette.border}`,
          boxShadow: palette.modalShadow,
          transform: visible ? "translateX(0)" : "translateX(100%)",
          transition: "transform 280ms cubic-bezier(0.16,1,0.3,1)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          fontFamily: typography.body,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            padding: compact ? "18px 18px 10px" : "22px 24px 12px",
            borderBottom: `1px solid ${palette.borderSoft}`,
          }}
        >
          <CaseStudyLabel typography={typography} palette={palette}>
            {study.tag}
          </CaseStudyLabel>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close case study"
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: `1px solid ${palette.labelBorder}`,
              background: palette.labelBackground,
              color: palette.text,
              fontSize: "0.98rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            X
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            scrollBehavior: "smooth",
            padding: compact ? "18px 18px 32px" : "22px 28px 40px",
          }}
        >
          <div style={{ display: "grid", gap: 28 }}>
            <header
              style={{
                display: "grid",
                gap: 14,
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(18px)",
                transition: "opacity 320ms ease 80ms, transform 320ms ease 80ms",
              }}
            >
              <h3
                style={{
                  fontFamily: typography.head,
                  fontSize: compact ? "clamp(2.3rem,11vw,3.1rem)" : "clamp(2.9rem,4vw,4rem)",
                  lineHeight: 0.95,
                  letterSpacing: "-0.05em",
                  color: palette.text,
                }}
              >
                {study.headline}
              </h3>
              <p
                style={{
                  fontFamily: typography.body,
                  fontSize: compact ? "1rem" : "1.08rem",
                  lineHeight: 1.7,
                  color: palette.muted,
                  maxWidth: 720,
                }}
              >
                {study.summary}
              </p>
            </header>

            <ModalSection title="📋 The Challenge" index={1} visible={visible} typography={typography} palette={palette}>
              <p style={{ fontFamily: typography.body, color: palette.muted, lineHeight: 1.75, fontSize: "0.98rem" }}>{study.challenge}</p>
            </ModalSection>

            <ModalSection title="🛠️ What I Built" index={2} visible={visible} typography={typography} palette={palette}>
              <ul style={{ display: "grid", gap: 12, paddingLeft: 18, color: palette.muted, fontFamily: typography.body, lineHeight: 1.7 }}>
                {study.build.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {study.techStack.map((item) => (
                  <span
                    key={item}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      background: palette.chipBackground,
                      border: `1px solid ${palette.chipBorder}`,
                      color: palette.chipText,
                      fontFamily: typography.mono,
                      fontSize: "0.7rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </ModalSection>

            <ModalSection title="📊 Results" index={3} visible={visible} typography={typography} palette={palette}>
              <CaseStudyChart study={study} typography={typography} palette={palette} />
              <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: 14 }}>
                {study.stats.map((stat) => (
                  <CaseStudyStatCard key={stat.label} stat={stat} typography={typography} palette={palette} />
                ))}
              </div>
            </ModalSection>

            <ModalSection title="💬 Key Insight" index={4} visible={visible} typography={typography} palette={palette}>
              <blockquote
                style={{
                  margin: 0,
                  padding: "18px 18px 18px 20px",
                  borderLeft: `4px solid ${palette.accent}`,
                  background: palette.labelBackground,
                  borderRadius: 18,
                  fontFamily: typography.body,
                  fontSize: compact ? "1.02rem" : "1.12rem",
                  lineHeight: 1.75,
                  fontStyle: "italic",
                  color: palette.text,
                }}
              >
                {study.insight}
              </blockquote>
            </ModalSection>
          </div>
        </div>
      </aside>
    </div>,
    document.body
  );
};

export default function CaseStudiesSection({ theme, isMobile, isTablet, clay, typography }) {
  const [activeStudy, setActiveStudy] = useState(null);
  const palette = buildCaseStudyPalette(theme);

  return (
    <>
      <section id="case-studies" style={{ padding: isMobile ? "0 16px 64px" : "0 20px 84px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              background: palette.panel,
              border: `1px solid ${palette.border}`,
              borderRadius: isMobile ? 30 : 38,
              padding: isMobile ? "28px 18px 22px" : "36px 30px 30px",
              boxShadow: palette.panelShadow,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background: palette.highlight,
              }}
            />
            <div style={{ position: "relative", textAlign: "center", maxWidth: 780, margin: "0 auto 34px", color: palette.text }}>
              <CaseStudyLabel typography={typography} palette={palette}>Case Studies</CaseStudyLabel>
              <h2
                style={{
                fontFamily: typography.head,
                  fontSize: "clamp(2.2rem,4.6vw,3.8rem)",
                  lineHeight: 0.96,
                  letterSpacing: "-0.06em",
                  color: palette.text,
                  marginTop: 18,
                  marginBottom: 12,
                }}
              >
                Systems Built. <span style={{ color: palette.accent }}>Revenue Moved.</span>
              </h2>
              <p
                style={{
                  fontFamily: typography.body,
                  fontSize: "1rem",
                  lineHeight: 1.74,
                  color: palette.muted,
                  maxWidth: 640,
                  margin: "0 auto",
                }}
              >
                Each project started with a broken pipeline and ended with a system that compounds.
              </p>
            </div>

            <div
              style={{
                position: "relative",
                display: "grid",
                gridTemplateColumns: isTablet ? "1fr" : "repeat(3, minmax(0, 1fr))",
                gap: 16,
              }}
            >
              {caseStudies.map((study) => (
                <CaseStudyPreviewCard
                  key={study.id}
                  study={study}
                  clay={clay}
                  typography={typography}
                  palette={palette}
                  compact={isMobile}
                  onOpen={setActiveStudy}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {activeStudy && (
        <CaseStudyModal
          study={activeStudy}
          onClose={() => setActiveStudy(null)}
          compact={isMobile}
          typography={typography}
          palette={palette}
        />
      )}
    </>
  );
}
