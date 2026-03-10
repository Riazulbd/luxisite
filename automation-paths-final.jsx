import React, { useCallback, useEffect, useRef, useState } from "react";
import linkedInLogo from "./src/assets/logos/LinkedIn_2021.svg";
import vapiLogo from "./src/assets/logos/VAPI.svg";
import zapierLogo from "./src/assets/logos/zapier-2.svg";
import abidinHeadshot from "./src/assets/headshots/abidin.webp";
import loganHeadshot from "./src/assets/headshots/logan.webp";
import orianaHeadshot from "./src/assets/headshots/oriana.jpg";
import ralphHeadshot from "./src/assets/headshots/ralph.webp";
import tonyHeadshot from "./src/assets/headshots/tony.jpg";
import zacHeadshot from "./src/assets/headshots/zac.jpg";

const TYPOGRAPHY = {
  display: "'Fraunces', Georgia, serif",
  head: "'Product Sans', 'Fraunces', Georgia, serif",
  body: "'Manrope', sans-serif",
  mono: "'IBM Plex Mono', monospace",
  url: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=IBM+Plex+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&display=swap",
};

const THEMES = [
  { id: "crystal", name: "Crystal Blue", dark: false, bg: "#FEF7F0", bgDark: "#EEF0FF", card: "#FFFFFF", cardBorder: "rgba(0,0,0,0.05)", text: "#1C1825", text2: "#52495E", text3: "#8B839A", a1: "#5B6CFF", a2: "#9B72FF", grad: "linear-gradient(135deg,#5B6CFF,#9B72FF,#FF6B9D)", glow1: "rgba(91,108,255,0.18)", glow2: "rgba(155,114,255,0.12)", glow3: "rgba(52,211,153,0.10)", cardGlow: "0 0 40px rgba(91,108,255,0.06)", btnGlow: "0 6px 30px rgba(91,108,255,0.35)", chipBg: "rgba(91,108,255,0.08)", chipC: "#5B6CFF", tagBg: "rgba(91,108,255,0.08)", tagC: "#5B6CFF", starG: "linear-gradient(135deg,#FFCB47,#FF8C42)", navBg: "rgba(255,255,255,0.72)", navBorder: "rgba(255,255,255,0.8)", hoverBorder: "rgba(91,108,255,0.3)", iL: 0.7, iD: 0.04 },
  { id: "emerald", name: "Mint Ledger", dark: false, bg: "#F5FCF8", bgDark: "#E4F8ED", card: "#FFFFFF", cardBorder: "rgba(16,84,63,0.08)", text: "#133128", text2: "#456A5C", text3: "#80A193", a1: "#2FB98B", a2: "#1FB6D0", grad: "linear-gradient(135deg,#2FB98B,#21C7B9,#3BB8F5)", glow1: "rgba(47,185,139,0.18)", glow2: "rgba(31,182,208,0.12)", glow3: "rgba(59,184,245,0.10)", cardGlow: "0 0 42px rgba(47,185,139,0.05)", btnGlow: "0 6px 30px rgba(47,185,139,0.28)", chipBg: "rgba(47,185,139,0.10)", chipC: "#1A9B72", tagBg: "rgba(47,185,139,0.10)", tagC: "#1A9B72", starG: "linear-gradient(135deg,#FBBF24,#F59E0B)", navBg: "rgba(255,255,255,0.78)", navBorder: "rgba(255,255,255,0.84)", hoverBorder: "rgba(47,185,139,0.28)", iL: 0.7, iD: 0.04 },
  { id: "flame", name: "Sunset Flame", dark: false, bg: "#FFFAF5", bgDark: "#FFECE0", card: "#FFFFFF", cardBorder: "rgba(0,0,0,0.05)", text: "#1F1510", text2: "#6B5040", text3: "#A08878", a1: "#FF6B35", a2: "#FF4F81", grad: "linear-gradient(135deg,#FF6B35,#FF4F81,#FF2D87)", glow1: "rgba(255,107,53,0.18)", glow2: "rgba(255,79,129,0.12)", glow3: "rgba(255,140,66,0.10)", cardGlow: "0 0 40px rgba(255,107,53,0.05)", btnGlow: "0 6px 30px rgba(255,107,53,0.35), 0 0 50px rgba(255,79,129,0.12)", chipBg: "rgba(255,107,53,0.08)", chipC: "#E85A28", tagBg: "rgba(255,107,53,0.08)", tagC: "#E85A28", starG: "linear-gradient(135deg,#FFCB47,#FF8C42)", navBg: "rgba(255,250,245,0.75)", navBorder: "rgba(255,255,255,0.8)", hoverBorder: "rgba(255,107,53,0.3)", iL: 0.7, iD: 0.04 },
  { id: "violet", name: "Rose Quartz", dark: false, bg: "#FFF7FC", bgDark: "#F6EAF7", card: "#FFFFFF", cardBorder: "rgba(120,71,136,0.08)", text: "#2B1732", text2: "#6A5372", text3: "#A28CAD", a1: "#A855F7", a2: "#EC4899", grad: "linear-gradient(135deg,#A855F7,#EC4899,#F472B6)", glow1: "rgba(168,85,247,0.18)", glow2: "rgba(236,72,153,0.12)", glow3: "rgba(244,114,182,0.10)", cardGlow: "0 0 45px rgba(168,85,247,0.05)", btnGlow: "0 6px 30px rgba(168,85,247,0.28)", chipBg: "rgba(168,85,247,0.10)", chipC: "#A855F7", tagBg: "rgba(168,85,247,0.10)", tagC: "#A855F7", starG: "linear-gradient(135deg,#FBBF24,#F59E0B)", navBg: "rgba(255,255,255,0.78)", navBorder: "rgba(255,255,255,0.84)", hoverBorder: "rgba(168,85,247,0.28)", iL: 0.7, iD: 0.04 },
  { id: "ocean", name: "Sky Glass", dark: false, bg: "#F5FBFF", bgDark: "#E6F4FF", card: "#FFFFFF", cardBorder: "rgba(19,79,125,0.08)", text: "#14314B", text2: "#52748F", text3: "#8BA9BF", a1: "#06B6D4", a2: "#3B82F6", grad: "linear-gradient(135deg,#06B6D4,#3B82F6,#6366F1)", glow1: "rgba(6,182,212,0.18)", glow2: "rgba(59,130,246,0.12)", glow3: "rgba(99,102,241,0.10)", cardGlow: "0 0 45px rgba(6,182,212,0.05)", btnGlow: "0 6px 30px rgba(6,182,212,0.28)", chipBg: "rgba(6,182,212,0.10)", chipC: "#1599BF", tagBg: "rgba(6,182,212,0.10)", tagC: "#1599BF", starG: "linear-gradient(135deg,#FBBF24,#F59E0B)", navBg: "rgba(255,255,255,0.78)", navBorder: "rgba(255,255,255,0.84)", hoverBorder: "rgba(6,182,212,0.28)", iL: 0.7, iD: 0.04 },
];

const platformLogos = [
  { name: "HubSpot", kind: "fallback", icon: "HubSpot", color: "#33475B" },
  { name: "Twilio", kind: "fallback", icon: "Twilio", color: "#F22F46" },
  { name: "Docker", kind: "fallback", icon: "Docker", color: "#2496ED" },
  { name: "Cloudflare", kind: "fallback", icon: "Cloudflare", color: "#F48120" },
  { name: "Supabase", kind: "fallback", icon: "Supabase", color: "#0F172A" },
  { name: "GoHighLevel", kind: "fallback", icon: "GoHighLevel", color: "#1F2937" },
  { name: "Pipedrive", kind: "text", color: "#17313B" },
  { name: "n8n", kind: "fallback", icon: "n8n", color: "#111827" },
  { name: "Make", kind: "fallback", icon: "Make", color: "#111827" },
  { name: "LinkedIn", kind: "image", src: linkedInLogo, imageHeight: 22 },
  { name: "VAPI", kind: "image", src: vapiLogo, imageHeight: 22 },
  { name: "Zapier", kind: "image", src: zapierLogo, imageHeight: 18 },
];

const services = [
  { svg: ["GoHighLevel", "HubSpot", "Salesforce"], title: "CRM Architecture", description: "Multi-pipeline systems with lifecycle automation, lead scoring, and dashboards designed for how your team actually sells.", tags: ["GoHighLevel", "HubSpot", "Salesforce"] },
  { svg: ["VAPI", "Retell AI", "Twilio"], title: "Voice AI Agents", description: "Production-grade assistants on real phone lines. They qualify, book, handle objections, and keep working after hours.", tags: ["VAPI", "Retell", "Twilio"] },
  { svg: ["OpenAI", "Claude AI"], title: "SMS and Chat AI", description: "Intelligent conversational AI that nurtures leads and knows exactly when to hand off to a human.", tags: ["OpenAI", "Claude", "Custom"] },
  { svg: ["n8n", "Make"], title: "Automation Pipelines", description: "Complex workflows unifying CRM, AI agents, databases, and every third-party tool into one automated revenue machine.", tags: ["n8n", "Make", "Custom APIs"] },
  { svg: ["Next.js", "Supabase"], title: "Full-Stack Applications", description: "Custom dashboards, lead capture tools, and client portals built from scratch with modern frameworks.", tags: ["Next.js", "React", "Supabase"] },
  { svg: ["LinkedIn", "Playwright", "Supabase"], title: "Lead Gen Systems", description: "Automated prospecting, lead scoring, geographic qualification, and CRM enrichment that runs while you sleep.", tags: ["Playwright", "LinkedIn", "Supabase"] },
];

const processSteps = [
  { number: "01", title: "Diagnose", description: "Deep audit of your revenue pipeline. We find where leads die and revenue leaks." },
  { number: "02", title: "Architect", description: "System blueprint for CRM logic, automation flows, and AI strategy. Every decision is justified." },
  { number: "03", title: "Ship", description: "Full deployment. Voice agents, pipelines, dashboards, and integrations wired, tested, and documented." },
  { number: "04", title: "Compound", description: "Monitor KPIs, refine prompts, and tune conversion paths. Your system gets smarter every week." },
];

const stats = [
  {
    value: "5,000+",
    label: "Hours Delivered",
    detail: "Across CRM builds, automation systems, AI workflows, and implementation support.",
  },
  {
    value: "Top 1%",
    label: "Upwork Worldwide",
    detail: "Trusted for high-leverage systems work, not commodity task execution.",
  },
  {
    value: "12+",
    label: "Platforms Mastered",
    detail: "From GoHighLevel and HubSpot to Twilio, n8n, Playwright, and Supabase.",
  },
  {
    value: "US / UK",
    label: "Client Base",
    detail: "Built for agencies, consultants, operators, and service businesses shipping globally.",
  },
];

const heroPrinciples = [
  {
    emoji: "\u{1F50E}",
    title: "Audit before adding tools",
    copy: "Start by finding the leaks in lead flow, response time, routing, and reporting before layering on more software.",
  },
  {
    emoji: "\u{1F9E9}",
    title: "Build around the revenue path",
    copy: "CRM, AI, outbound, and dashboards get rebuilt around how leads should move from first touch to closed revenue.",
  },
  {
    emoji: "\u{1F680}",
    title: "Ship with QA and handoff",
    copy: "Every implementation is tested, documented, and handed over clearly so the system survives after launch.",
  },
];

const testimonials = [
  {
    quote: "Riazul was awesome to work with. I came to him with a complex automation spanning four different applications, and he completed the project flawlessly within our agreed timeline.",
    name: "Zac Perna",
    role: "Founder, The Social Blueprint",
    initial: "ZP",
    photo: zacHeadshot,
    photoPosition: "center top",
    gradient: "linear-gradient(135deg,#7C6BFF,#5B6CFF)",
    dark: false,
  },
  {
    quote: "Solved complex onboarding challenges in GoHighLevel. Professional, reliable, and easy to trust with mission-critical work.",
    name: "L Henderson",
    role: "CEO, Morpheus Interactive",
    initial: "LH",
    photo: loganHeadshot,
    photoPosition: "center top",
    gradient: "linear-gradient(135deg,#5B6CFF,#9B72FF)",
    dark: true,
  },
  {
    quote: "Versatile, responsive, and impactful for our marketing automation. Highly recommended.",
    name: "Ralph Adetayo",
    role: "Founder, ADET IT",
    initial: "RA",
    photo: ralphHeadshot,
    photoPosition: "center top",
    gradient: "linear-gradient(135deg,#22C55E,#14B8A6)",
    dark: false,
  },
  {
    quote: "An amazing team member. We were glad to have Riaz helping with integrations and making the systems actually work together.",
    name: "Tony Smith",
    role: "CEO, Bizaunch.io",
    initial: "TS",
    photo: tonyHeadshot,
    photoPosition: "center",
    gradient: "linear-gradient(135deg,#FF8C42,#FFCB47)",
    dark: true,
  },
  {
    quote: "He was an expert in automation, lead-gen funnels, and AI. Very honest to work with and always delivered on time.",
    name: "Oriana Schneps",
    role: "CEO, The.yacht.edit",
    initial: "OS",
    photo: orianaHeadshot,
    photoPosition: "center top",
    gradient: "linear-gradient(135deg,#FB7185,#A855F7)",
    dark: false,
  },
  {
    quote: "Riazul and his team have deep knowledge of email systems, HubSpot, and marketing automation for cold outreach.",
    name: "Abidin Karabulut",
    role: "CEO, Lookum",
    initial: "AK",
    photo: abidinHeadshot,
    photoPosition: "center top",
    gradient: "linear-gradient(135deg,#0EA5E9,#2563EB)",
    dark: true,
  },
];

const founderBullets = [
  "Most teams do not need more tools. They need the current stack to stop contradicting itself.",
  "The work starts with the revenue path, then rebuilds CRM, AI, automation, and reporting around that path.",
  "Every build includes architecture, QA, handoff, and clearer ownership so the system survives after launch.",
];

const deliveryLanes = [
  {
    emoji: "\u{1F3AF}",
    title: "Acquisition Systems",
    description: "Inbound capture, outbound workflows, enrichment, qualification logic, and the automations that move prospects into the right lane.",
    points: ["Lead capture flows", "Outbound sequencing", "Qualification scoring"],
  },
  {
    emoji: "\u{2699}\u{FE0F}",
    title: "Execution Systems",
    description: "The backend layer that keeps sales and fulfillment moving: CRM states, AI touchpoints, handoffs, notifications, and QA rules.",
    points: ["Pipeline automations", "AI assistants", "Internal operating logic"],
  },
  {
    emoji: "\u{1F4CA}",
    title: "Visibility Systems",
    description: "Clear dashboards and reporting that tell you where revenue leaks, where teams slow down, and which systems need refinement next.",
    points: ["Reporting dashboards", "Attribution clarity", "Decision-grade metrics"],
  },
];

const faqItems = [
  {
    question: "Who is this best for?",
    answer: "Agency founders, consultants, coaches, and service businesses that already have lead flow but need cleaner systems to support growth.",
  },
  {
    question: "Do you only work inside GoHighLevel?",
    answer: "No. GoHighLevel is often the core, but the work usually spans AI, telephony, automation tools, databases, custom apps, and reporting layers.",
  },
  {
    question: "What does a typical engagement look like?",
    answer: "Most projects start with an audit and architecture phase, then move into implementation, QA, documentation, and iterative refinement.",
  },
  {
    question: "Can you fix an existing stack instead of rebuilding everything?",
    answer: "Yes. Many projects begin as cleanups: reconnecting broken automations, rationalizing pipelines, and making the current stack trustworthy again.",
  },
];

const LogoSVG = ({ name, size = 20 }) => {
  const icons = {
    GoHighLevel: (
      <>
        <rect width={size} height={size} rx={4} fill="#FF6B35" />
        <path d="M4,14 L8,6 L12,10 L16,4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
      </>
    ),
    HubSpot: (
      <>
        <circle cx={size / 2} cy={size / 2} r={size / 2} fill="#FF7A59" />
        <circle cx={size / 2} cy={size / 2} r={size * 0.28} fill="#fff" />
        <circle cx={size * 0.25} cy={size * 0.35} r={2} fill="#fff" />
        <circle cx={size * 0.75} cy={size * 0.35} r={2} fill="#fff" />
        <circle cx={size * 0.25} cy={size * 0.65} r={2} fill="#fff" />
        <circle cx={size * 0.75} cy={size * 0.65} r={2} fill="#fff" />
      </>
    ),
    Salesforce: (
      <>
        <rect width={size} height={size} rx={4} fill="#00A1E0" />
        <path d="M3,13 Q5,7 10,8 Q15,5 17,10 Q18,14 14,14 Q12,16 8,14 Q4,15 3,13Z" fill="#fff" opacity="0.9" />
      </>
    ),
    VAPI: (
      <>
        <rect width={size} height={size} rx={4} fill="#5B6CFF" />
        <path d="M5,5 L10,15 L15,5" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    "Retell AI": (
      <>
        <rect width={size} height={size} rx={4} fill="#7C3AED" />
        <circle cx={size / 2} cy={size * 0.4} r={3} fill="none" stroke="#fff" strokeWidth="1.5" />
        <path d="M7,12 Q10,16 13,12" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </>
    ),
    Twilio: (
      <>
        <circle cx={size / 2} cy={size / 2} r={size / 2} fill="#F22F46" />
        <circle cx={size * 0.35} cy={size * 0.42} r={2.2} fill="#fff" />
        <circle cx={size * 0.65} cy={size * 0.42} r={2.2} fill="#fff" />
        <circle cx={size * 0.5} cy={size * 0.68} r={2.2} fill="#fff" />
      </>
    ),
    OpenAI: (
      <>
        <circle cx={size / 2} cy={size / 2} r={size / 2} fill="#10A37F" />
        <path d="M6,10 A4,4 0 0,1 10,6 M10,6 A4,4 0 0,1 14,10 M14,10 A4,4 0 0,1 10,14 M10,14 A4,4 0 0,1 6,10" stroke="#fff" strokeWidth="1.5" fill="none" />
        <circle cx={size / 2} cy={size / 2} r={1.5} fill="#fff" />
      </>
    ),
    "Claude AI": (
      <>
        <rect width={size} height={size} rx={4} fill="#D97706" />
        <circle cx={size / 2} cy={size * 0.45} r={4} fill="#fff" opacity="0.9" />
        <path d="M7,13 L10,11 L13,13" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </>
    ),
    n8n: (
      <>
        <rect width={size} height={size} rx={4} fill="#EA4C89" />
        <circle cx={size * 0.32} cy={size / 2} r={2.5} fill="none" stroke="#fff" strokeWidth="1.5" />
        <circle cx={size * 0.68} cy={size / 2} r={2.5} fill="none" stroke="#fff" strokeWidth="1.5" />
        <line x1={size * 0.44} y1={size / 2} x2={size * 0.56} y2={size / 2} stroke="#fff" strokeWidth="1.5" />
      </>
    ),
    "Next.js": (
      <>
        <circle cx={size / 2} cy={size / 2} r={size / 2} fill="#000" />
        <text x={size / 2} y={size * 0.65} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" fontFamily="sans-serif">N</text>
      </>
    ),
    Supabase: (
      <>
        <rect width={size} height={size} rx={4} fill="#3ECF8E" />
        <path d="M10,4 L10,11 L16,16 L10,11 L4,16 L10,11Z" fill="#fff" opacity="0.9" />
      </>
    ),
    Cloudflare: (
      <>
        <rect width={size} height={size} rx={4} fill="#F48120" />
        <path d="M4,12 Q6,8 10,9 Q12,7 15,9 Q17,9 17,12 Z" fill="#fff" opacity="0.9" />
        <path d="M6,12 Q7,10 10,10.5 Q11,9 13,10 Q14.5,10 14.5,12 Z" fill="#fffce8" opacity="0.7" />
      </>
    ),
    Docker: (
      <>
        <rect width={size} height={size} rx={4} fill="#2496ED" />
        <rect x="3" y="9" width="14" height="6" rx="1" fill="#fff" opacity="0.9" />
        <rect x="5" y="5" width="3" height="3" rx="0.5" fill="#fff" opacity="0.7" />
        <rect x="9" y="5" width="3" height="3" rx="0.5" fill="#fff" opacity="0.7" />
      </>
    ),
    Make: (
      <>
        <rect width={size} height={size} rx={4} fill="#6B21A8" />
        <circle cx={size * 0.35} cy={size / 2} r={2.8} fill="#fff" opacity="0.9" />
        <circle cx={size * 0.65} cy={size / 2} r={2.8} fill="#fff" opacity="0.9" />
      </>
    ),
    LinkedIn: (
      <>
        <rect width={size} height={size} rx={4} fill="#0077B5" />
        <rect x="4" y="8" width="3" height="8" rx="0.5" fill="#fff" />
        <circle cx="5.5" cy="5.5" r="1.8" fill="#fff" />
        <path d="M9,8 L9,16 M9,11 Q9,8 12,8 Q15,8 15,11 L15,16" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </>
    ),
    Playwright: (
      <>
        <rect width={size} height={size} rx={4} fill="#2D4552" />
        <circle cx={size * 0.35} cy={size * 0.42} r={2} fill="#E8585D" />
        <circle cx={size * 0.65} cy={size * 0.42} r={2} fill="#47B560" />
        <path d="M5,13 Q10,16 15,13" stroke="#fff" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      </>
    ),
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {icons[name] || <rect width={size} height={size} rx={4} fill="#888" />}
    </svg>
  );
};

const PlatformLogo = ({ item, compact, theme }) => {
  if (item.kind === "image") {
    return (
      <img
        src={item.src}
        alt={item.name}
        style={{
          display: "block",
          height: item.imageHeight ?? (compact ? 18 : 22),
          width: "auto",
          maxWidth: "100%",
          objectFit: "contain",
        }}
      />
    );
  }

  if (item.kind === "text") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: theme.a1 }} />
        <span style={{ fontFamily: TYPOGRAPHY.head, fontWeight: 700, fontSize: compact ? "0.86rem" : "0.92rem", color: item.color || theme.text, letterSpacing: "-0.03em" }}>
          {item.name}
        </span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <div style={{ width: compact ? 28 : 30, height: compact ? 28 : 30, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.03)" }}>
        <LogoSVG name={item.icon || item.name} size={compact ? 18 : 20} />
      </div>
      <span style={{ fontWeight: 700, fontSize: compact ? "0.76rem" : "0.84rem", color: item.color || theme.text }}>
        {item.name}
      </span>
    </div>
  );
};

const ServiceCard = ({ service, index, theme, compact }) => {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), index * 120);
          observer.unobserve(element);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [index]);

  const handleMove = useCallback(
    (event) => {
      if (compact) return;
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * -8;
      setTilt({ x, y });
    },
    [compact]
  );

  const active = hovered && !compact;

  return (
    <div
      ref={ref}
      onMouseEnter={compact ? undefined : () => setHovered(true)}
      onMouseLeave={
        compact
          ? undefined
          : () => {
              setHovered(false);
              setTilt({ x: 0, y: 0 });
            }
      }
      onMouseMove={compact ? undefined : handleMove}
      style={{
        background: theme.card,
        border: `1.5px solid ${active ? theme.hoverBorder : theme.cardBorder}`,
        borderRadius: compact ? 22 : 24,
        padding: compact ? "24px 18px 20px" : "30px 24px 24px",
        position: "relative",
        overflow: "hidden",
        transform: visible
          ? compact
            ? "translateY(0) scale(1)"
            : `perspective(800px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) translateY(${active ? -10 : 0}px) scale(${active ? 1.02 : 1})`
          : "translateY(50px) scale(0.92)",
        opacity: visible ? 1 : 0,
        boxShadow: active
          ? `0 4px 8px rgba(0,0,0,${theme.iD}), 0 20px 40px rgba(0,0,0,${theme.iD * 1.8}), 0 40px 80px rgba(0,0,0,${theme.iD * 1.5}), ${theme.cardGlow}`
          : `0 2px 4px rgba(0,0,0,${theme.iD}), 0 8px 18px rgba(0,0,0,${theme.iD * 1.3}), 0 24px 48px rgba(0,0,0,${theme.iD * 1.1})`,
        transition:
          "transform 0.5s cubic-bezier(0.34,1.56,0.64,1), opacity 0.7s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s, border-color 0.4s",
        willChange: "transform",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "50%",
          background: `linear-gradient(to bottom,rgba(255,255,255,${theme.iL * 0.65}),transparent)`,
          borderRadius: `${compact ? 22 : 24}px ${compact ? 22 : 24}px 50% 50%`,
          pointerEvents: "none",
        }}
      />

      {active && (
        <div
          style={{
            position: "absolute",
            inset: -1,
            borderRadius: compact ? 23 : 25,
            background: theme.grad,
            opacity: 0.15,
            filter: "blur(8px)",
            animation: "pulseGlow 2s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
      )}

      <div style={{ display: "flex", gap: 6, marginBottom: 18, position: "relative" }}>
        {service.svg.map((name, logoIndex) => (
          <div
            key={name}
            style={{
              width: compact ? 36 : 40,
              height: compact ? 36 : 40,
              borderRadius: 12,
              background: "rgba(0,0,0,0.03)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: active ? `translateY(-${3 + logoIndex * 2}px) rotate(${logoIndex % 2 === 0 ? -3 : 3}deg)` : "none",
              transition: `transform 0.5s cubic-bezier(0.34,1.56,0.64,1) ${logoIndex * 0.06}s`,
            }}
          >
            <LogoSVG name={name} size={compact ? 18 : 20} />
          </div>
        ))}
      </div>

      <h3
        style={{
          fontFamily: TYPOGRAPHY.head,
          fontSize: compact ? "1.1rem" : "1.25rem",
          fontWeight: 700,
          marginBottom: 8,
          color: theme.text,
          letterSpacing: "-0.02em",
          position: "relative",
        }}
      >
        {service.title}
      </h3>
      <p
        style={{
          fontSize: compact ? "0.85rem" : "0.88rem",
          color: theme.text2,
          lineHeight: 1.65,
          marginBottom: 16,
          position: "relative",
        }}
      >
        {service.description}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, position: "relative" }}>
        {service.tags.map((tag) => (
          <span
            key={tag}
            style={{
              fontFamily: TYPOGRAPHY.mono,
              fontSize: "0.6rem",
              fontWeight: 500,
              padding: "4px 10px",
              borderRadius: 999,
              background: theme.tagBg,
              color: theme.tagC,
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

const SectionLabel = ({ theme, children }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "5px 14px 5px 6px",
      background: theme.card,
      border: `1px solid ${theme.cardBorder}`,
      borderRadius: 999,
      fontFamily: TYPOGRAPHY.mono,
      fontSize: "0.7rem",
      fontWeight: 500,
      color: theme.chipC,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      boxShadow: `0 2px 4px rgba(0,0,0,${theme.iD}), 0 8px 18px rgba(0,0,0,${theme.iD * 1.3})`,
    }}
  >
    <span style={{ width: 18, height: 18, borderRadius: "50%", background: theme.grad }} />
    {children}
  </div>
);

const ReviewCard = ({ item, theme, compact, clay }) => {
  const isDark = item.dark;
  const background = isDark
    ? "linear-gradient(135deg, rgba(9,16,38,0.94), rgba(43,18,88,0.94), rgba(7,41,48,0.94))"
    : theme.card;
  const border = isDark ? "rgba(255,255,255,0.15)" : theme.cardBorder;
  const text = isDark ? "#F8FAFC" : theme.text;
  const text2 = isDark ? "rgba(248,250,252,0.78)" : theme.text2;
  const divider = isDark ? "rgba(255,255,255,0.22)" : "rgba(107,114,128,0.25)";

  return (
    <div
      style={{
        background,
        color: text,
        border: `1px solid ${border}`,
        borderRadius: compact ? 24 : 28,
        padding: compact ? "22px 18px" : "26px 22px",
        boxShadow: isDark ? "0 24px 60px rgba(6,10,18,0.25)" : clay(theme.cardGlow),
        minHeight: compact ? "auto" : 316,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {isDark && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at top left, rgba(91,108,255,0.22), transparent 34%), radial-gradient(circle at bottom right, rgba(255,79,129,0.18), transparent 32%)",
            pointerEvents: "none",
          }}
        />
      )}
      <div style={{ position: "relative" }}>
        <div style={{ display: "grid", gridTemplateColumns: compact ? "68px 1fr" : "76px 1fr", gap: compact ? 14 : 18, alignItems: "center", marginBottom: 20 }}>
          <div
            style={{
              width: compact ? 60 : 72,
              height: compact ? 60 : 72,
              borderRadius: "50%",
              background: item.gradient,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontFamily: TYPOGRAPHY.head,
              fontWeight: 700,
              fontSize: compact ? "0.92rem" : "1rem",
              letterSpacing: "-0.04em",
              boxShadow: isDark ? "0 12px 36px rgba(0,0,0,0.28)" : "0 12px 32px rgba(0,0,0,0.12)",
            }}
          >
            {item.photo ? (
              <img
                src={item.photo}
                alt={item.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: item.photoPosition || "center",
                }}
              />
            ) : (
              item.initial
            )}
          </div>
          <div>
            <div style={{ fontFamily: TYPOGRAPHY.head, fontWeight: 700, fontSize: compact ? "1rem" : "1.08rem", lineHeight: 1.1, letterSpacing: "-0.03em" }}>{item.name}</div>
            <div style={{ color: text2, fontSize: compact ? "0.82rem" : "0.88rem", lineHeight: 1.35, marginTop: 4 }}>{item.role}</div>
          </div>
        </div>
        <div style={{ height: 1, background: divider, marginBottom: 18 }} />
        <p style={{ color: text, fontSize: compact ? "0.96rem" : "1rem", lineHeight: 1.72 }}>{item.quote}</p>
      </div>
      <div style={{ display: "flex", gap: compact ? 3 : 4, marginTop: 22, position: "relative", alignItems: "center" }}>
        {[0, 1, 2, 3, 4].map((star) => (
          <span
            key={star}
            style={{
              display: "inline-block",
              fontSize: compact ? "1.02rem" : "1.12rem",
              lineHeight: 1,
              filter: isDark ? "drop-shadow(0 4px 10px rgba(0,0,0,0.24))" : "drop-shadow(0 3px 8px rgba(255,140,66,0.14))",
            }}
            role="img"
            aria-label="star"
          >
            ⭐
          </span>
        ))}
      </div>
    </div>
  );
};

const FaqCard = ({ item, theme, clay }) => (
  <div
    style={{
      background: theme.card,
      border: `1px solid ${theme.cardBorder}`,
      borderRadius: 24,
      padding: "22px 20px",
      boxShadow: clay(theme.cardGlow),
    }}
  >
    <div style={{ fontFamily: TYPOGRAPHY.head, fontWeight: 700, fontSize: "1rem", color: theme.text, marginBottom: 10, letterSpacing: "-0.03em" }}>
      {item.question}
    </div>
    <p style={{ color: theme.text2, lineHeight: 1.7, fontSize: "0.92rem" }}>{item.answer}</p>
  </div>
);

export default function App() {
  const [themeIndex, setThemeIndex] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === "undefined" ? 1280 : window.innerWidth
  );

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleResize = () => setViewportWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const theme = THEMES[themeIndex];
  const isMobile = viewportWidth < 768;
  const isTablet = viewportWidth < 1024;
  const transition = "all 0.55s cubic-bezier(0.4,0,0.2,1)";

  const clay = (extra = "") =>
    `0 2px 4px rgba(0,0,0,${theme.iD}), 0 8px 18px rgba(0,0,0,${theme.iD * 1.3}), 0 24px 48px rgba(0,0,0,${theme.iD * 1.1}), inset 0 2px 4px rgba(255,255,255,${theme.iL}), inset 0 -1px 2px rgba(0,0,0,${theme.iD})${extra ? `, ${extra}` : ""}`;

  const GradText = ({ children }) => (
    <span
      style={{
        background: theme.grad,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      {children}
    </span>
  );

  return (
    <div
      style={{
        background: theme.bg,
        color: theme.text,
        fontFamily: TYPOGRAPHY.body,
        minHeight: "100vh",
        overflowX: "hidden",
        transition,
        position: "relative",
      }}
    >
      <style>{`
        @import url('${TYPOGRAPHY.url}');
        @keyframes logoScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes blobDrift { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(30px,-25px) scale(1.04); } 66% { transform: translate(-20px,15px) scale(0.97); } }
        @keyframes pulseGlow { 0%,100% { opacity: 0.12; transform: scale(1); } 50% { opacity: 0.2; transform: scale(1.01); } }
        @keyframes heroLineIn {
          from { opacity: 0; transform: translateY(28px); filter: blur(10px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes heroAccentPulse {
          0%,100% { transform: translateY(0); text-shadow: 0 0 0 rgba(0,0,0,0); }
          50% { transform: translateY(-3px); text-shadow: 0 12px 26px ${theme.glow1}; }
        }
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; scroll-padding-top: ${isMobile ? 112 : 128}px; }
        body { -webkit-font-smoothing: antialiased; }
        ::selection { background: ${theme.a1}; color: white; }
        .hero-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        .hero-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {[
          { width: isMobile ? 320 : 550, height: isMobile ? 320 : 550, top: isMobile ? -90 : -160, left: isMobile ? -80 : -120, glow: theme.glow1 },
          { width: isMobile ? 360 : 650, height: isMobile ? 360 : 650, bottom: isMobile ? -120 : -220, right: isMobile ? -90 : -160, glow: theme.glow2 },
          { width: isMobile ? 250 : 420, height: isMobile ? 250 : 420, top: isMobile ? "54%" : "42%", left: isMobile ? "18%" : "32%", glow: theme.glow3 },
        ].map((blob, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              width: blob.width,
              height: blob.height,
              top: blob.top,
              left: blob.left,
              bottom: blob.bottom,
              right: blob.right,
              borderRadius: "50%",
              filter: "blur(100px)",
              background: `radial-gradient(circle,${blob.glow},transparent 70%)`,
              animation: `blobDrift ${22 + index * 4}s ease-in-out infinite${index === 1 ? " reverse" : ""}`,
            }}
          />
        ))}
      </div>

      {!isMobile && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 999,
            display: "flex",
            gap: 5,
            padding: "5px 7px",
            maxWidth: "calc(100vw - 32px)",
            background: theme.navBg,
            backdropFilter: "blur(20px)",
            borderRadius: 999,
            boxShadow: clay(theme.cardGlow),
            border: `1px solid ${theme.navBorder}`,
            transition,
          }}
        >
          {THEMES.map((entry, index) => (
            <button
              key={entry.id}
              onClick={() => setThemeIndex(index)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: themeIndex === index ? "8px 18px 8px 10px" : "8px 12px",
                background: themeIndex === index ? theme.grad : "transparent",
                color: themeIndex === index ? "#fff" : theme.text2,
                border: "none",
                borderRadius: 999,
                cursor: "pointer",
                fontFamily: TYPOGRAPHY.body,
                fontWeight: 700,
                fontSize: "0.76rem",
                transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                transform: themeIndex === index ? "scale(1.06)" : "scale(1)",
                boxShadow: themeIndex === index ? theme.btnGlow : "none",
              }}
            >
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: entry.a1, boxShadow: "0 0 0 2px rgba(255,255,255,0.18)" }} />
              {themeIndex === index && <span>{entry.name}</span>}
            </button>
          ))}
        </div>
      )}

      <nav style={{ position: "fixed", top: 0, width: "100%", zIndex: 1000, padding: isMobile ? "12px 14px" : "12px 20px" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: isMobile ? "stretch" : "center",
            flexWrap: isTablet ? "wrap" : "nowrap",
            gap: 12,
            background: theme.navBg,
            backdropFilter: "blur(22px) saturate(1.5)",
            borderRadius: isTablet ? 28 : 999,
            padding: isMobile ? "12px 14px" : "8px 10px 8px 22px",
            boxShadow: clay(theme.cardGlow),
            border: `1px solid ${theme.navBorder}`,
            transition,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: TYPOGRAPHY.display, fontWeight: 700, fontSize: isMobile ? "0.98rem" : "1.06rem", color: theme.text }}>
            <div style={{ width: 34, height: 34, background: theme.grad, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: "0.9rem", fontFamily: TYPOGRAPHY.display, boxShadow: `${theme.btnGlow}, inset 0 2px 4px rgba(255,255,255,0.35)` }}>
              A
            </div>
            Automation Paths
          </div>

          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", width: isMobile ? "100%" : isTablet ? "100%" : "auto", justifyContent: isMobile ? "flex-start" : isTablet ? "space-between" : "flex-end" }}>
            {!isMobile &&
              [
                { label: "About", href: "#about" },
                { label: "Services", href: "#services" },
                { label: "Process", href: "#process" },
                { label: "Proof", href: "#results" },
                { label: "FAQ", href: "#faq" },
              ].map((item) => (
                <a key={item.label} href={item.href} style={{ color: theme.text2, textDecoration: "none", fontSize: "0.84rem", fontWeight: 600, padding: "6px 14px", borderRadius: 999 }}>
                  {item.label}
                </a>
              ))}
            <a href="#cta" style={{ width: isMobile ? "100%" : "auto", padding: isMobile ? "12px 18px" : "8px 20px", background: theme.grad, color: "#fff", borderRadius: 999, fontWeight: 700, fontSize: "0.84rem", textDecoration: "none", boxShadow: `${theme.btnGlow}, inset 0 2px 4px rgba(255,255,255,0.3)`, textAlign: "center" }}>
              Book a Call -&gt;
            </a>
          </div>
        </div>
      </nav>

      <section style={{ minHeight: isMobile ? "auto" : "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: isMobile ? "108px 14px 20px" : isTablet ? "138px 20px 72px" : "136px 20px 74px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: isMobile ? "5px 12px 5px 6px" : "6px 16px 6px 7px", background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 999, fontSize: isMobile ? "0.7rem" : "0.82rem", fontWeight: 600, color: theme.text2, marginBottom: isMobile ? 14 : 28, boxShadow: clay(theme.cardGlow), position: "relative", zIndex: 2, maxWidth: isMobile ? "100%" : "none", animation: "heroFadeUp 0.7s ease-out both" }}>
          <span style={{ width: 24, height: 24, background: "linear-gradient(135deg,#34D399,#2DD4BF)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", color: "#fff" }}>
            +
          </span>
          Built for agencies, consultants, and operators fixing revenue systems
        </div>

        <h1 style={{ fontFamily: TYPOGRAPHY.head, fontSize: isMobile ? "clamp(2.15rem,11vw,3.1rem)" : "clamp(4.1rem,7.6vw,6.3rem)", lineHeight: isMobile ? 0.88 : 0.9, letterSpacing: isMobile ? "-0.07em" : "-0.055em", maxWidth: isTablet ? 760 : 980, marginBottom: isMobile ? 10 : 22, color: theme.text, position: "relative", zIndex: 2 }}>
          <span style={{ display: "block", fontStyle: "normal", fontWeight: 800, animation: "heroLineIn 0.82s cubic-bezier(0.16,1,0.3,1) both", transformOrigin: "center bottom" }}>Build the revenue system</span>
          <span style={{ display: "block", fontStyle: "italic", fontWeight: 350, animation: "heroLineIn 0.82s cubic-bezier(0.16,1,0.3,1) 0.12s both", transformOrigin: "center bottom" }}>your agency should have</span>
          <span style={{ display: "block", fontStyle: "normal", fontWeight: 800, animation: "heroLineIn 0.82s cubic-bezier(0.16,1,0.3,1) 0.24s both", transformOrigin: "center bottom" }}>
            launched <span style={{ color: theme.a1, fontWeight: 700, display: "inline-block", animation: "heroAccentPulse 2.8s ease-in-out 1.1s infinite" }}>already.</span>
          </span>
        </h1>

        <p style={{ fontSize: isMobile ? "0.9rem" : "1.14rem", color: theme.text2, maxWidth: isMobile ? 322 : 720, lineHeight: isMobile ? 1.58 : 1.78, marginBottom: isMobile ? 16 : 32, position: "relative", zIndex: 2, animation: "heroFadeUp 0.72s ease-out 0.32s both" }}>
          GoHighLevel architect, AI automation engineer, and GTM systems builder. I design CRM logic, automations, voice AI, and reporting layers that remove manual bottlenecks and make your growth stack trustworthy again.
        </p>

        <div style={{ display: isMobile ? "grid" : "flex", gap: isMobile ? 10 : 12, gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : undefined, flexWrap: isMobile ? undefined : "wrap", width: isMobile ? "100%" : "auto", maxWidth: isMobile ? 340 : "none", justifyContent: "center", position: "relative", zIndex: 2, animation: "heroFadeUp 0.72s ease-out 0.44s both" }}>
          <a href="#cta" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: isMobile ? "13px 14px" : "15px 30px", width: isMobile ? "100%" : "auto", background: theme.grad, color: "#fff", borderRadius: 999, fontWeight: 700, fontSize: isMobile ? "0.86rem" : "0.95rem", textDecoration: "none", boxShadow: `${theme.btnGlow}, inset 0 2px 6px rgba(255,255,255,0.25)` }}>
            Book Strategy Call -&gt;
          </a>
          <a href="#results" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: isMobile ? "13px 14px" : "15px 26px", width: isMobile ? "100%" : "auto", background: theme.card, color: theme.text, borderRadius: 999, fontWeight: 600, fontSize: isMobile ? "0.86rem" : "0.95rem", textDecoration: "none", boxShadow: clay(), border: `1px solid ${theme.cardBorder}` }}>
            See Proof
          </a>
        </div>

        <div className="hero-scroll" style={{ width: "100%", maxWidth: 1140, marginTop: isMobile ? 14 : 34, display: isMobile ? "flex" : "grid", gridTemplateColumns: isMobile ? undefined : "repeat(3, minmax(0, 1fr))", gap: isMobile ? 10 : 14, position: "relative", zIndex: 2, overflowX: isMobile ? "auto" : "visible", paddingBottom: isMobile ? 4 : 0, scrollSnapType: isMobile ? "x mandatory" : "none", animation: "heroFadeUp 0.76s ease-out 0.56s both" }}>
          {heroPrinciples.map((item) => (
            <div key={item.title} style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 24, padding: isMobile ? "14px 14px 12px" : "22px 22px", boxShadow: clay(theme.cardGlow), textAlign: "left", minWidth: isMobile ? "76vw" : "auto", maxWidth: isMobile ? 286 : "none", scrollSnapAlign: isMobile ? "start" : "none", flexShrink: 0 }}>
              <div style={{ width: isMobile ? 38 : 42, height: isMobile ? 38 : 42, borderRadius: 14, background: theme.chipBg, color: theme.a1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: isMobile ? "1rem" : "1.1rem", marginBottom: isMobile ? 8 : 14 }}>
                {item.emoji}
              </div>
              <div style={{ fontFamily: TYPOGRAPHY.head, fontSize: isMobile ? "0.92rem" : "1.06rem", fontWeight: 700, color: theme.text, marginBottom: 6, letterSpacing: "-0.03em" }}>{item.title}</div>
              <div style={{ color: theme.text2, fontSize: isMobile ? "0.8rem" : "0.88rem", lineHeight: isMobile ? 1.48 : 1.68, display: "-webkit-box", WebkitLineClamp: isMobile ? 3 : "unset", WebkitBoxOrient: "vertical", overflow: isMobile ? "hidden" : "visible" }}>{item.copy}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ padding: isMobile ? "20px 0 8px" : "28px 0", overflow: "hidden", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", fontSize: "0.72rem", color: theme.text3, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600, marginBottom: 18 }}>
          Platforms we architect across
        </div>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: isMobile ? 48 : 120, background: `linear-gradient(90deg,${theme.bg},transparent)`, zIndex: 2 }} />
          <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: isMobile ? 48 : 120, background: `linear-gradient(-90deg,${theme.bg},transparent)`, zIndex: 2 }} />
          <div style={{ display: "flex", gap: isMobile ? 10 : 14, animation: "logoScroll 50s linear infinite", width: "max-content" }}>
            {[...platformLogos, ...platformLogos].map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: item.kind === "image" ? (isMobile ? 150 : 180) : isMobile ? 126 : 148,
                  padding: item.kind === "image" ? (isMobile ? "12px 18px" : "14px 22px") : isMobile ? "9px 12px" : "10px 14px",
                  background: theme.card,
                  border: `1px solid ${theme.cardBorder}`,
                  borderRadius: 999,
                  boxShadow: clay(),
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                <PlatformLogo item={item} compact={isMobile} theme={theme} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <section id="about" style={{ padding: isMobile ? "30px 16px 40px" : "38px 20px 56px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", display: "grid", gridTemplateColumns: isTablet ? "1fr" : "minmax(0, 1.05fr) minmax(320px, 0.95fr)", gap: 18, alignItems: "stretch" }}>
          <div style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 30, padding: isMobile ? "24px 18px" : "30px 30px", boxShadow: clay(theme.cardGlow) }}>
            <SectionLabel theme={theme}>Why This Structure Works</SectionLabel>
            <h2 style={{ fontFamily: TYPOGRAPHY.head, fontSize: "clamp(2rem,4.1vw,3.25rem)", fontWeight: 800, lineHeight: 1.06, letterSpacing: "-0.04em", color: theme.text, marginTop: 18, marginBottom: 14 }}>
              More than automations. <GradText>It is operating design.</GradText>
            </h2>
            <p style={{ fontSize: "1rem", color: theme.text2, lineHeight: 1.76, maxWidth: 620, marginBottom: 20 }}>
              Most teams do not need another tool. They need their existing tools to stop contradicting each other. The work here starts with the revenue path, then rebuilds the stack around that path.
            </p>
            <div style={{ display: "grid", gap: 12 }}>
              {founderBullets.map((item, index) => (
                <div key={item} style={{ display: "grid", gridTemplateColumns: "26px 1fr", gap: 12, alignItems: "start" }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: index === 1 ? theme.chipBg : "rgba(255,255,255,0.8)", color: theme.a1, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: TYPOGRAPHY.mono, fontSize: "0.68rem", border: `1px solid ${theme.cardBorder}` }}>
                    +
                  </div>
                  <div style={{ color: theme.text, fontWeight: 600, lineHeight: 1.55 }}>{item}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ background: `linear-gradient(135deg,${theme.bgDark},${theme.card})`, border: `1px solid ${theme.cardBorder}`, borderRadius: 30, padding: isMobile ? "24px 18px" : "26px 24px", boxShadow: clay(theme.cardGlow) }}>
              <div style={{ fontFamily: TYPOGRAPHY.mono, fontSize: "0.7rem", color: theme.chipC, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
                What you leave with
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                {["Documented CRM logic", "Reliable lead routing", "Automation QA and ownership", "Reporting your team trusts"].map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, color: theme.text, fontWeight: 600 }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: theme.a1, boxShadow: `0 0 0 6px ${theme.chipBg}` }} />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 30, padding: isMobile ? "24px 18px" : "26px 24px", boxShadow: clay(theme.cardGlow) }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
                {[
                  { title: "Audit", copy: "Identify the leaks before building." },
                  { title: "Build", copy: "Implement with testing, not guesswork." },
                  { title: "Handoff", copy: "Docs, ownership, and training included." },
                  { title: "Refine", copy: "Keep improving conversion over time." },
                ].map((item) => (
                  <div key={item.title} style={{ padding: "14px 12px", borderRadius: 18, background: theme.tagBg }}>
                    <div style={{ fontFamily: TYPOGRAPHY.head, fontWeight: 700, fontSize: "1rem", color: theme.text, marginBottom: 6 }}>{item.title}</div>
                    <div style={{ fontSize: "0.84rem", lineHeight: 1.55, color: theme.text2 }}>{item.copy}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" style={{ padding: isMobile ? "64px 16px" : "80px 20px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px 5px 6px", background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 999, fontFamily: TYPOGRAPHY.mono, fontSize: "0.7rem", fontWeight: 500, color: theme.chipC, letterSpacing: "0.04em", textTransform: "uppercase", boxShadow: clay(), marginBottom: 16 }}>
              <span style={{ width: 18, height: 18, borderRadius: "50%", background: theme.grad }} />
              What We Build
            </div>
            <h2 style={{ fontFamily: TYPOGRAPHY.head, fontSize: "clamp(2.2rem,4.5vw,3.4rem)", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.03em", color: theme.text, marginBottom: 12 }}>
              Six core systems that create <GradText>a cleaner revenue engine.</GradText>
            </h2>
            <p style={{ fontSize: "1.05rem", color: theme.text2, maxWidth: 540, lineHeight: 1.7 }}>
              This is not generic implementation support. Each service ties back to one job: helping your business move leads, work, and reporting through a stack that does not fight itself.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {services.map((service, index) => (
              <ServiceCard key={service.title} service={service} index={index} theme={theme} compact={isMobile} />
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: isMobile ? "0 16px 56px" : "0 20px 76px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", display: "grid", gridTemplateColumns: isTablet ? "1fr" : "repeat(3, minmax(0, 1fr))", gap: 14 }}>
          {deliveryLanes.map((lane) => (
            <div key={lane.title} style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 28, padding: isMobile ? "22px 18px" : "24px 22px", boxShadow: clay(theme.cardGlow) }}>
              <div style={{ width: 42, height: 42, borderRadius: 14, background: theme.chipBg, color: theme.a1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", marginBottom: 16 }}>
                {lane.emoji}
              </div>
              <h3 style={{ fontFamily: TYPOGRAPHY.head, fontSize: "1.18rem", fontWeight: 700, letterSpacing: "-0.03em", color: theme.text, marginBottom: 10 }}>
                {lane.title}
              </h3>
              <p style={{ color: theme.text2, lineHeight: 1.7, fontSize: "0.92rem", marginBottom: 18 }}>{lane.description}</p>
              <div style={{ display: "grid", gap: 8 }}>
                {lane.points.map((point) => (
                  <div key={point} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: "0.84rem", color: theme.text, fontWeight: 600 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: theme.a1 }} />
                    {point}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        id="process"
        style={{
          background: `linear-gradient(135deg,${theme.bgDark},${theme.card} 72%)`,
          border: `1px solid ${theme.cardBorder}`,
          borderRadius: isMobile ? 28 : 36,
          margin: isMobile ? "0 12px" : "0 16px",
          padding: isMobile ? "52px 18px" : "64px 32px",
          position: "relative",
          overflow: "hidden",
          zIndex: 1,
          boxShadow: clay(theme.cardGlow),
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 40% 40% at 20% 80%,${theme.glow1},transparent), radial-gradient(ellipse 35% 35% at 80% 20%,${theme.glow2},transparent)`, pointerEvents: "none", opacity: 0.9 }} />
        <div style={{ maxWidth: 1140, margin: "0 auto", position: "relative", zIndex: 1, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px 5px 6px", background: "rgba(255,255,255,0.72)", border: `1px solid ${theme.cardBorder}`, borderRadius: 999, fontFamily: TYPOGRAPHY.mono, fontSize: "0.7rem", fontWeight: 500, color: theme.a1, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 16, boxShadow: clay() }}>
            <span style={{ width: 18, height: 18, borderRadius: "50%", background: theme.grad }} />
            How We Work
          </div>
          <h2 style={{ fontFamily: TYPOGRAPHY.head, fontSize: "clamp(2.1rem,4vw,3.2rem)", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.03em", color: theme.text, marginBottom: 12 }}>
            Think fractional CTO. <GradText>Not freelancer.</GradText>
          </h2>
          <p style={{ fontSize: "1rem", color: theme.text2, maxWidth: 500, lineHeight: 1.7, marginBottom: 40 }}>
            We diagnose bottlenecks, design architecture, ship infrastructure, and optimize for compound returns.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, width: "100%" }}>
            {processSteps.map((step) => (
              <div key={step.number} style={{ background: "rgba(255,255,255,0.78)", backdropFilter: "blur(14px)", border: `1px solid ${theme.cardBorder}`, borderRadius: 24, padding: "28px 20px", textAlign: "center", position: "relative", overflow: "hidden", boxShadow: clay(theme.cardGlow) }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "45%", background: `linear-gradient(to bottom,${theme.chipBg},transparent)`, borderRadius: "24px 24px 50% 50%" }} />
                <div style={{ fontFamily: TYPOGRAPHY.display, fontSize: "2.5rem", fontWeight: 900, background: theme.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", opacity: 0.58, lineHeight: 1, marginBottom: 12, position: "relative" }}>{step.number}</div>
                <h3 style={{ fontFamily: TYPOGRAPHY.head, fontSize: "1.15rem", fontWeight: 700, color: theme.text, marginBottom: 6, position: "relative" }}>{step.title}</h3>
                <p style={{ fontSize: "0.83rem", color: theme.text2, lineHeight: 1.6, position: "relative" }}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="results" style={{ padding: isMobile ? "64px 16px" : "80px 20px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <SectionLabel theme={theme}>Proof</SectionLabel>
          <h2 style={{ fontFamily: TYPOGRAPHY.head, fontSize: "clamp(2.1rem,4vw,3.2rem)", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.03em", color: theme.text, marginTop: 18, marginBottom: 12 }}>
            Strong systems leave <GradText>visible evidence.</GradText>
          </h2>
          <p style={{ fontSize: "1rem", color: theme.text2, maxWidth: 700, lineHeight: 1.74, marginBottom: 34 }}>
            The stats now use a cleaner sans treatment, and the review section is rebuilt around the testimonial style you shared instead of placeholder cards.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: isTablet ? "repeat(2, minmax(0, 1fr))" : "repeat(4, minmax(0, 1fr))", gap: 14, width: "100%", marginBottom: 22 }}>
            {stats.map((stat) => (
              <div key={stat.label} style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 24, padding: isMobile ? "22px 18px" : "24px 20px", textAlign: "left", boxShadow: clay(theme.cardGlow) }}>
                <div style={{ width: 56, height: 4, borderRadius: 999, background: theme.grad, marginBottom: 14 }} />
                <div style={{ fontFamily: TYPOGRAPHY.head, fontSize: isMobile ? "2.25rem" : "2.7rem", fontWeight: 800, letterSpacing: "-0.06em", lineHeight: 0.95, color: theme.text, fontVariantNumeric: "tabular-nums", marginBottom: 8 }}>
                  {stat.value}
                </div>
                <div style={{ fontFamily: TYPOGRAPHY.head, fontWeight: 700, fontSize: "0.98rem", color: theme.text, marginBottom: 8 }}>{stat.label}</div>
                <p style={{ fontSize: "0.84rem", lineHeight: 1.6, color: theme.text3 }}>{stat.detail}</p>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(320px, 1fr))", gap: 14, width: "100%" }}>
            {testimonials.map((item) => (
              <ReviewCard key={item.name} item={item} theme={theme} compact={isMobile} clay={clay} />
            ))}
          </div>
        </div>
      </section>

      <section id="faq" style={{ padding: isMobile ? "0 16px 56px" : "0 20px 80px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: 740, margin: "0 auto 30px" }}>
            <SectionLabel theme={theme}>FAQ</SectionLabel>
            <h2 style={{ fontFamily: TYPOGRAPHY.head, fontSize: "clamp(1.9rem,3.9vw,3rem)", fontWeight: 800, lineHeight: 1.06, letterSpacing: "-0.04em", color: theme.text, marginTop: 18, marginBottom: 12 }}>
              Questions clients usually ask <GradText>before we start.</GradText>
            </h2>
            <p style={{ color: theme.text2, lineHeight: 1.74, fontSize: "1rem" }}>
              This extra section gives the page more depth and answers the common objections that were missing from the earlier version.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: 14 }}>
            {faqItems.map((item) => (
              <FaqCard key={item.question} item={item} theme={theme} clay={clay} />
            ))}
          </div>
        </div>
      </section>

      <section id="cta" style={{ padding: isMobile ? "56px 16px 72px" : "60px 20px 80px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 760, margin: "0 auto", background: `linear-gradient(135deg,${theme.chipBg},rgba(255,230,230,0.06),${theme.tagBg})`, border: `1px solid ${theme.cardBorder}`, borderRadius: isMobile ? 28 : 36, padding: isMobile ? "40px 22px" : "56px 36px", boxShadow: `0 4px 8px rgba(0,0,0,${theme.iD}), 0 20px 50px rgba(0,0,0,${theme.iD * 1.5}), 0 40px 100px rgba(0,0,0,${theme.iD}), ${theme.cardGlow}` }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px 5px 6px", background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 999, fontFamily: TYPOGRAPHY.mono, fontSize: "0.7rem", fontWeight: 500, color: theme.chipC, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 16, boxShadow: clay() }}>
            <span style={{ width: 18, height: 18, borderRadius: "50%", background: theme.grad }} />
            Limited Availability
          </div>
          <h2 style={{ fontFamily: TYPOGRAPHY.head, fontSize: "clamp(1.9rem,3.5vw,2.7rem)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.03em", color: theme.text, marginBottom: 12 }}>
            Your revenue system is either
            <br />
            <GradText>compounding or leaking.</GradText>
          </h2>
          <p style={{ fontSize: "1.02rem", color: theme.text2, maxWidth: 450, margin: "0 auto 28px", lineHeight: 1.7 }}>
            Book a free 30-minute strategy call. We will diagnose your pipeline and show you what a purpose-built system should look like.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", flexDirection: isMobile ? "column" : "row" }}>
            <a href="#" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "15px 28px", width: isMobile ? "100%" : "auto", background: theme.grad, color: "#fff", borderRadius: 999, fontWeight: 700, fontSize: "0.95rem", textDecoration: "none", boxShadow: `${theme.btnGlow}, inset 0 2px 6px rgba(255,255,255,0.25)` }}>
              Book Your Strategy Call -&gt;
            </a>
            <a href="mailto:hello@automationpaths.com" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "15px 22px", width: isMobile ? "100%" : "auto", background: theme.card, color: theme.text, borderRadius: 999, fontWeight: 600, fontSize: "0.95rem", textDecoration: "none", boxShadow: clay(), border: `1px solid ${theme.cardBorder}` }}>
              hello@automationpaths.com
            </a>
          </div>
        </div>
      </section>

      <footer style={{ padding: isMobile ? "16px 16px 32px" : "24px 20px 32px", maxWidth: 1140, margin: "0 auto", display: "flex", justifyContent: isMobile ? "center" : "space-between", alignItems: "center", flexWrap: "wrap", textAlign: isMobile ? "center" : "left", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
          <span style={{ fontFamily: TYPOGRAPHY.display, fontWeight: 700, fontSize: "0.92rem", color: theme.text2 }}>Automation Paths</span>
          <span style={{ fontSize: "0.75rem", color: theme.text3 }}>(c) 2026 All rights reserved.</span>
        </div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
          {["LinkedIn", "YouTube", "Upwork"].map((item) => (
            <a key={item} href="#" style={{ fontSize: "0.82rem", fontWeight: 600, color: theme.text3, textDecoration: "none" }}>
              {item}
            </a>
          ))}
        </div>
      </footer>

      <div style={{ height: isMobile ? 16 : 90 }} />
    </div>
  );
}
