import React, { useCallback, useEffect, useRef, useState } from "react";

const TYPOGRAPHY = {
  head: "'Fraunces', Georgia, serif",
  body: "'Manrope', sans-serif",
  mono: "'IBM Plex Mono', monospace",
  url: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=IBM+Plex+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&display=swap",
};

const THEME = {
  bg: "#f5f1ec",
  bgDark: "#1f1712",
  card: "rgba(255,255,255,0.82)",
  cardBorder: "rgba(61,44,34,0.08)",
  text: "#1d1714",
  text2: "#65574e",
  text3: "#9f8f83",
  accent: "#c16e2b",
  accentDark: "#8f4f25",
  grad: "linear-gradient(135deg,#cf7a31,#a85b24,#7b4320)",
  glow1: "rgba(193,110,43,0.18)",
  glow2: "rgba(143,79,37,0.13)",
  glow3: "rgba(102,76,59,0.08)",
  cardGlow: "0 0 40px rgba(193,110,43,0.08)",
  btnGlow: "0 8px 30px rgba(193,110,43,0.24)",
  chipBg: "rgba(193,110,43,0.08)",
  chipC: "#b46426",
  tagBg: "rgba(193,110,43,0.08)",
  tagC: "#b46426",
  navBg: "rgba(245,241,236,0.82)",
  navBorder: "rgba(255,255,255,0.7)",
  hoverBorder: "rgba(193,110,43,0.28)",
  iL: 0.62,
  iD: 0.05,
};

const BRAND_COLORS = {
  GoHighLevel: "#FF6B35",
  HubSpot: "#FF7A59",
  Salesforce: "#00A1E0",
  VAPI: "#5B6CFF",
  "Retell AI": "#7C3AED",
  Twilio: "#F22F46",
  OpenAI: "#10A37F",
  "Claude AI": "#D97706",
  n8n: "#EA4C89",
  "Next.js": "#111827",
  Supabase: "#3ECF8E",
  Cloudflare: "#F48120",
  Docker: "#2496ED",
  Make: "#6B21A8",
  LinkedIn: "#0077B5",
  Playwright: "#2D4552",
};

const PLATFORMS = Object.keys(BRAND_COLORS);

const SERVICES = [
  { title: "CRM Architecture", description: "Multi-pipeline systems with lifecycle automation, lead scoring, and reporting designed around how your team actually sells.", tags: ["GoHighLevel", "HubSpot", "Salesforce"] },
  { title: "Voice AI Agents", description: "Production voice systems that qualify, book, follow up, and keep operating after hours on real phone lines.", tags: ["VAPI", "Retell AI", "Twilio"] },
  { title: "SMS and Chat AI", description: "Conversational lead handling that nurtures interest, qualifies intent, and routes people to humans at the right moment.", tags: ["OpenAI", "Claude AI", "Custom"] },
  { title: "Automation Pipelines", description: "Operational workflows connecting CRM, AI, databases, and third-party tools into one durable system layer.", tags: ["n8n", "Make", "Custom APIs"] },
  { title: "Full-Stack Applications", description: "Dashboards, portals, and internal tools built with modern frameworks instead of stacked no-code workarounds.", tags: ["Next.js", "React", "Supabase"] },
  { title: "Lead Gen Systems", description: "Prospecting and enrichment systems that score leads, sync records, and keep outbound motion organized.", tags: ["Playwright", "LinkedIn", "Supabase"] },
];

const PROCESS = [
  { number: "01", title: "Diagnose", description: "Audit the funnel, handoffs, and reporting so the actual bottlenecks are clear." },
  { number: "02", title: "Architect", description: "Design CRM logic, automations, AI behavior, and reporting before a single shortcut gets added." },
  { number: "03", title: "Ship", description: "Deploy the stack, test the moving parts, and document what the team needs to maintain it." },
  { number: "04", title: "Compound", description: "Tune prompts, improve conversion paths, and keep the system learning from real traffic." },
];

const STATS = [
  { value: "5,000+", label: "Hours Delivered" },
  { value: "Top 1%", label: "Upwork Worldwide" },
  { value: "12+", label: "Platforms Mastered" },
  { value: "US / UK", label: "Client Base" },
];

const TESTIMONIALS = [
  { quote: "He redesigned our revenue operation. Pipeline velocity doubled in three months.", name: "Agency Owner", role: "US Digital Agency - $2M ARR", initial: "J" },
  { quote: "Voice AI went live in 12 days. The first week qualified 47 leads and booked 19.", name: "Coaching CEO", role: "Education and Coaching - US", initial: "D" },
  { quote: "Three platforms were consolidated into one CRM and the custom dashboards changed how we run the business.", name: "Founder", role: "Real Estate Investing - US", initial: "M" },
  { quote: "Riazul challenged our assumptions and shipped a system that actually scales.", name: "Firm Partner", role: "Executive Search - US", initial: "L" },
];

const BrandBadge = ({ name, size = 38 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: 12,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: BRAND_COLORS[name] || "#888",
      color: "#fff",
      fontFamily: TYPOGRAPHY.mono,
      fontSize: size < 34 ? "0.58rem" : "0.64rem",
      fontWeight: 700,
      letterSpacing: "-0.02em",
      boxShadow: "inset 0 2px 4px rgba(255,255,255,0.2)",
    }}
  >
    {name.slice(0, 2).toUpperCase()}
  </div>
);

const ServiceCard = ({ service, index, compact }) => {
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
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => setVisible(true), index * 100);
        observer.unobserve(element);
      }
    }, { threshold: 0.15 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [index]);

  const handleMove = useCallback((event) => {
    if (compact) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * -8;
    setTilt({ x, y });
  }, [compact]);

  const active = hovered && !compact;

  return (
    <div
      ref={ref}
      onMouseEnter={compact ? undefined : () => setHovered(true)}
      onMouseLeave={compact ? undefined : () => { setHovered(false); setTilt({ x: 0, y: 0 }); }}
      onMouseMove={compact ? undefined : handleMove}
      style={{
        position: "relative",
        overflow: "hidden",
        background: THEME.card,
        border: `1.5px solid ${active ? THEME.hoverBorder : THEME.cardBorder}`,
        borderRadius: compact ? 22 : 26,
        padding: compact ? "24px 18px 20px" : "30px 24px 24px",
        opacity: visible ? 1 : 0,
        transform: visible ? (compact ? "translateY(0) scale(1)" : `perspective(800px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) translateY(${active ? -10 : 0}px) scale(${active ? 1.02 : 1})`) : "translateY(40px) scale(0.95)",
        boxShadow: active ? `0 4px 8px rgba(0,0,0,${THEME.iD}), 0 20px 40px rgba(0,0,0,${THEME.iD * 1.8}), 0 40px 80px rgba(0,0,0,${THEME.iD * 1.5}), ${THEME.cardGlow}` : `0 2px 4px rgba(0,0,0,${THEME.iD}), 0 8px 18px rgba(0,0,0,${THEME.iD * 1.3}), 0 24px 48px rgba(0,0,0,${THEME.iD * 1.1})`,
        transition: "transform 0.5s cubic-bezier(0.34,1.56,0.64,1), opacity 0.7s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s, border-color 0.4s",
      }}
    >
      <div style={{ position: "absolute", inset: "0 0 auto 0", height: "50%", background: `linear-gradient(to bottom, rgba(255,255,255,${THEME.iL * 0.65}), transparent)`, borderRadius: "26px 26px 50% 50%", pointerEvents: "none" }} />
      <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
        {service.tags.slice(0, 3).map((name, tagIndex) => (
          <div key={name} style={{ transform: active ? `translateY(-${3 + tagIndex * 2}px)` : "none", transition: `transform 0.4s ease ${tagIndex * 0.05}s` }}>
            <BrandBadge name={name} size={compact ? 34 : 38} />
          </div>
        ))}
      </div>
      <h3 style={{ marginBottom: 8, color: THEME.text, fontFamily: TYPOGRAPHY.head, fontSize: compact ? "1.08rem" : "1.24rem", fontWeight: 700, letterSpacing: "-0.02em" }}>{service.title}</h3>
      <p style={{ marginBottom: 16, color: THEME.text2, fontSize: compact ? "0.85rem" : "0.88rem", lineHeight: 1.68 }}>{service.description}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {service.tags.map((tag) => (
          <span key={tag} style={{ padding: "4px 10px", borderRadius: 999, background: THEME.tagBg, color: THEME.tagC, fontFamily: TYPOGRAPHY.mono, fontSize: "0.6rem", fontWeight: 500 }}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  const [viewportWidth, setViewportWidth] = useState(() => (typeof window === "undefined" ? 1280 : window.innerWidth));

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleResize = () => setViewportWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = viewportWidth < 768;
  const isTablet = viewportWidth < 1024;
  const sectionPad = isMobile ? "64px 16px" : "80px 20px";
  const clay = (extra = "") => `0 2px 4px rgba(0,0,0,${THEME.iD}), 0 8px 18px rgba(0,0,0,${THEME.iD * 1.3}), 0 24px 48px rgba(0,0,0,${THEME.iD * 1.1})${extra ? `, ${extra}` : ""}`;

  return (
    <div style={{ minHeight: "100vh", overflowX: "hidden", position: "relative", background: THEME.bg, color: THEME.text, fontFamily: TYPOGRAPHY.body }}>
      <style>{`
        @import url('${TYPOGRAPHY.url}');
        @keyframes logoScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes blobDrift { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(24px,-18px) scale(1.04); } 66% { transform: translate(-18px,14px) scale(0.97); } }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; scroll-padding-top: ${isMobile ? 112 : 128}px; }
        body { -webkit-font-smoothing: antialiased; }
        ::selection { background: ${THEME.accent}; color: white; }
      `}</style>

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {[{ width: isMobile ? 320 : 560, height: isMobile ? 320 : 560, top: isMobile ? -100 : -160, left: isMobile ? -80 : -120, glow: THEME.glow1 }, { width: isMobile ? 360 : 650, height: isMobile ? 360 : 650, bottom: isMobile ? -120 : -220, right: isMobile ? -90 : -160, glow: THEME.glow2 }, { width: isMobile ? 250 : 420, height: isMobile ? 250 : 420, top: isMobile ? "56%" : "42%", left: isMobile ? "18%" : "32%", glow: THEME.glow3 }].map((blob, index) => (
          <div key={index} style={{ position: "absolute", width: blob.width, height: blob.height, top: blob.top, left: blob.left, bottom: blob.bottom, right: blob.right, borderRadius: "50%", filter: "blur(100px)", background: `radial-gradient(circle, ${blob.glow}, transparent 70%)`, animation: `blobDrift ${22 + index * 4}s ease-in-out infinite${index === 1 ? " reverse" : ""}` }} />
        ))}
      </div>

      <nav style={{ position: "fixed", inset: "0 auto auto 0", width: "100%", zIndex: 20, padding: isMobile ? "12px 14px" : "12px 20px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: isMobile ? "stretch" : "center", flexWrap: isTablet ? "wrap" : "nowrap", gap: 12, padding: isMobile ? "12px 14px" : "8px 10px 8px 22px", borderRadius: isTablet ? 28 : 999, background: THEME.navBg, backdropFilter: "blur(22px) saturate(1.5)", border: `1px solid ${THEME.navBorder}`, boxShadow: clay(THEME.cardGlow) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: THEME.text, fontFamily: TYPOGRAPHY.head, fontSize: isMobile ? "0.98rem" : "1.08rem", fontWeight: 700 }}>
            <div style={{ width: 34, height: 34, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: THEME.grad, color: "#fff", fontSize: "0.9rem", fontWeight: 900, boxShadow: `${THEME.btnGlow}, inset 0 2px 4px rgba(255,255,255,0.35)` }}>A</div>
            Automation Paths
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", width: isMobile ? "100%" : isTablet ? "100%" : "auto", justifyContent: isMobile ? "flex-start" : isTablet ? "space-between" : "flex-end" }}>
            {!isMobile && ["Services", "Process", "Results"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} style={{ padding: "6px 14px", borderRadius: 999, color: THEME.text2, textDecoration: "none", fontSize: "0.84rem", fontWeight: 600 }}>{item}</a>
            ))}
            <a href="#cta" style={{ width: isMobile ? "100%" : "auto", padding: isMobile ? "12px 18px" : "8px 20px", borderRadius: 999, background: THEME.grad, color: "#fff", textAlign: "center", textDecoration: "none", fontSize: "0.84rem", fontWeight: 700, boxShadow: `${THEME.btnGlow}, inset 0 2px 4px rgba(255,255,255,0.3)` }}>Book a Call -&gt;</a>
          </div>
        </div>
      </nav>

      <section style={{ minHeight: isMobile ? "auto" : "100vh", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: isMobile ? "146px 16px 56px" : isTablet ? "144px 20px 68px" : "148px 20px 72px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: isMobile ? 24 : 28, padding: "6px 16px 6px 7px", borderRadius: 999, background: THEME.card, border: `1px solid ${THEME.cardBorder}`, boxShadow: clay(THEME.cardGlow), color: THEME.text2, fontSize: isMobile ? "0.76rem" : "0.82rem", fontWeight: 600 }}>
          <span style={{ width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#34d399,#2dd4bf)", color: "#fff", fontSize: "0.65rem" }}>+</span>
          Built for agencies scaling past founder-led ops
        </div>
        <h1 style={{ maxWidth: isTablet ? 760 : 980, marginBottom: isMobile ? 22 : 26, color: THEME.text, fontFamily: TYPOGRAPHY.head, fontSize: isMobile ? "clamp(3.3rem,16vw,4.8rem)" : "clamp(4.8rem,9vw,7.3rem)", lineHeight: isMobile ? 0.92 : 0.88, letterSpacing: "-0.05em" }}>
          <span style={{ display: "block", fontStyle: "italic", fontWeight: 350 }}>Building the</span>
          <span style={{ display: "block", fontStyle: "normal", fontWeight: 800 }}>systems agencies</span>
          <span style={{ display: "block", fontStyle: "italic", fontWeight: 350 }}>rely on to <span style={{ color: THEME.accent, fontWeight: 700 }}>scale.</span></span>
        </h1>
        <p style={{ maxWidth: isMobile ? 360 : 700, marginBottom: isMobile ? 28 : 34, color: THEME.text2, fontSize: isMobile ? "1rem" : "1.18rem", lineHeight: 1.72 }}>
          GoHighLevel architect, AI automation engineer, and GTM strategist. I build the infrastructure that turns your leads into revenue - reliably, at scale.
        </p>
        <div style={{ width: isMobile ? "100%" : "auto", maxWidth: isMobile ? 360 : "none", display: "flex", flexDirection: isMobile ? "column" : "row", flexWrap: "wrap", alignItems: "stretch", justifyContent: "center", gap: 12 }}>
          <a href="#cta" style={{ width: isMobile ? "100%" : "auto", padding: "15px 30px", borderRadius: 999, background: THEME.grad, color: "#fff", textDecoration: "none", fontSize: "0.95rem", fontWeight: 700, boxShadow: `${THEME.btnGlow}, inset 0 2px 6px rgba(255,255,255,0.25)`, textAlign: "center" }}>Book Strategy Call -&gt;</a>
          <a href="#services" style={{ width: isMobile ? "100%" : "auto", padding: "15px 26px", borderRadius: 999, background: THEME.card, color: THEME.text, textDecoration: "none", fontSize: "0.95rem", fontWeight: 600, border: `1px solid ${THEME.cardBorder}`, boxShadow: clay(), textAlign: "center" }}>See How It Works</a>
        </div>
      </section>

      <div style={{ position: "relative", zIndex: 1, overflow: "hidden", padding: isMobile ? "16px 0 8px" : "28px 0" }}>
        <div style={{ marginBottom: 18, textAlign: "center", color: THEME.text3, fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em" }}>Platforms we architect across</div>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", inset: "0 auto 0 0", width: isMobile ? 48 : 120, background: `linear-gradient(90deg, ${THEME.bg}, transparent)`, zIndex: 2 }} />
          <div style={{ position: "absolute", inset: "0 0 0 auto", width: isMobile ? 48 : 120, background: `linear-gradient(-90deg, ${THEME.bg}, transparent)`, zIndex: 2 }} />
          <div style={{ display: "flex", gap: isMobile ? 10 : 14, width: "max-content", animation: "logoScroll 50s linear infinite" }}>
            {[...PLATFORMS, ...PLATFORMS].map((name, index) => (
              <div key={`${name}-${index}`} style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap", padding: isMobile ? "7px 12px 7px 7px" : "7px 14px 7px 7px", borderRadius: 999, background: THEME.card, border: `1px solid ${THEME.cardBorder}`, boxShadow: clay() }}>
                <BrandBadge name={name} size={isMobile ? 30 : 32} />
                <span style={{ color: THEME.text, fontSize: isMobile ? "0.74rem" : "0.8rem", fontWeight: 700 }}>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section id="services" style={{ position: "relative", zIndex: 1, padding: sectionPad }}>
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16, padding: "5px 14px 5px 6px", borderRadius: 999, background: THEME.card, border: `1px solid ${THEME.cardBorder}`, boxShadow: clay(), color: THEME.chipC, fontFamily: TYPOGRAPHY.mono, fontSize: "0.7rem", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}><span style={{ width: 18, height: 18, borderRadius: "50%", background: THEME.grad }} />What We Build</div>
            <h2 style={{ marginBottom: 12, color: THEME.text, fontFamily: TYPOGRAPHY.head, fontSize: "clamp(2.2rem,4.5vw,3.4rem)", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.03em" }}>Six systems. One revenue engine.</h2>
            <p style={{ maxWidth: 540, color: THEME.text2, fontSize: "1.05rem", lineHeight: 1.7 }}>Every dollar flows through infrastructure. Yours should be built to convert, not just connect.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {SERVICES.map((service, index) => <ServiceCard key={service.title} service={service} index={index} compact={isMobile} />)}
          </div>
        </div>
      </section>

      <section id="process" style={{ position: "relative", zIndex: 1, margin: isMobile ? "0 12px" : "0 16px", padding: isMobile ? "52px 18px" : "64px 32px", overflow: "hidden", borderRadius: isMobile ? 28 : 36, background: THEME.bgDark }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 40% 40% at 20% 80%, ${THEME.glow1}, transparent), radial-gradient(ellipse 35% 35% at 80% 20%, ${THEME.glow2}, transparent)` }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1140, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16, padding: "5px 14px 5px 6px", borderRadius: 999, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: THEME.accent, fontFamily: TYPOGRAPHY.mono, fontSize: "0.7rem", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}><span style={{ width: 18, height: 18, borderRadius: "50%", background: THEME.grad }} />How We Work</div>
          <h2 style={{ marginBottom: 12, color: "#fff", fontFamily: TYPOGRAPHY.head, fontSize: "clamp(2.1rem,4vw,3.2rem)", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.03em" }}>Think fractional CTO. Not freelancer.</h2>
          <p style={{ maxWidth: 500, marginBottom: 40, color: "rgba(255,255,255,0.52)", fontSize: "1rem", lineHeight: 1.7 }}>We diagnose bottlenecks, design architecture, ship infrastructure, and optimize for compound returns.</p>
          <div style={{ width: "100%", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
            {PROCESS.map((step) => (
              <div key={step.number} style={{ position: "relative", overflow: "hidden", padding: "28px 20px", borderRadius: 24, textAlign: "center", background: "rgba(255,255,255,0.04)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ position: "absolute", inset: "0 0 auto 0", height: "45%", borderRadius: "24px 24px 50% 50%", background: "linear-gradient(to bottom, rgba(255,255,255,0.04), transparent)" }} />
                <div style={{ position: "relative", marginBottom: 12, color: THEME.accent, fontFamily: TYPOGRAPHY.head, fontSize: "2.5rem", fontWeight: 900, lineHeight: 1 }}>{step.number}</div>
                <h3 style={{ position: "relative", marginBottom: 6, color: "#fff", fontFamily: TYPOGRAPHY.head, fontSize: "1.15rem", fontWeight: 700 }}>{step.title}</h3>
                <p style={{ position: "relative", color: "rgba(255,255,255,0.44)", fontSize: "0.83rem", lineHeight: 1.6 }}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="results" style={{ position: "relative", zIndex: 1, padding: sectionPad }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16, padding: "5px 14px 5px 6px", borderRadius: 999, background: THEME.card, border: `1px solid ${THEME.cardBorder}`, boxShadow: clay(), color: THEME.chipC, fontFamily: TYPOGRAPHY.mono, fontSize: "0.7rem", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}><span style={{ width: 18, height: 18, borderRadius: "50%", background: THEME.grad }} />Proven Results</div>
          <h2 style={{ marginBottom: 36, color: THEME.text, fontFamily: TYPOGRAPHY.head, fontSize: "clamp(2.1rem,4vw,3.2rem)", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.03em" }}>Numbers do not need a sales pitch.</h2>
          <div style={{ width: "100%", marginBottom: 36, display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? 148 : 200}px, 1fr))`, gap: 14 }}>
            {STATS.map((stat) => (
              <div key={stat.label} style={{ padding: "28px 20px", borderRadius: 24, background: THEME.card, border: `1px solid ${THEME.cardBorder}`, boxShadow: clay(THEME.cardGlow) }}>
                <div style={{ marginBottom: 6, color: THEME.accent, fontFamily: TYPOGRAPHY.head, fontSize: "2.3rem", fontWeight: 900, lineHeight: 1 }}>{stat.value}</div>
                <div style={{ color: THEME.text3, fontSize: "0.82rem", fontWeight: 600 }}>{stat.label}</div>
              </div>
            ))}
          </div>
          <div style={{ width: "100%", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(320px, 1fr))", gap: 14 }}>
            {TESTIMONIALS.map((testimonial) => (
              <div key={testimonial.name} style={{ position: "relative", overflow: "hidden", textAlign: "left", padding: isMobile ? "24px 20px" : "28px", borderRadius: 24, background: THEME.card, border: `1px solid ${THEME.cardBorder}`, boxShadow: clay(THEME.cardGlow) }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>{[0, 1, 2, 3, 4].map((star) => <div key={star} style={{ width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", background: THEME.grad, color: "#fff", fontSize: "0.7rem" }}>*</div>)}</div>
                <p style={{ marginBottom: 18, color: THEME.text2, fontSize: "0.97rem", lineHeight: 1.7, fontStyle: "italic" }}>"{testimonial.quote}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", background: THEME.grad, color: "#fff", fontFamily: TYPOGRAPHY.head, fontSize: "0.85rem", fontWeight: 800 }}>{testimonial.initial}</div>
                  <div><div style={{ color: THEME.text, fontSize: "0.88rem", fontWeight: 700 }}>{testimonial.name}</div><div style={{ color: THEME.text3, fontSize: "0.72rem" }}>{testimonial.role}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="cta" style={{ position: "relative", zIndex: 1, padding: isMobile ? "56px 16px 72px" : "60px 20px 80px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: isMobile ? "40px 22px" : "56px 36px", borderRadius: isMobile ? 28 : 36, background: `linear-gradient(135deg, ${THEME.chipBg}, rgba(255,230,230,0.06), ${THEME.tagBg})`, border: `1px solid ${THEME.cardBorder}`, boxShadow: `0 4px 8px rgba(0,0,0,${THEME.iD}), 0 20px 50px rgba(0,0,0,${THEME.iD * 1.5}), 0 40px 100px rgba(0,0,0,${THEME.iD}), ${THEME.cardGlow}` }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16, padding: "5px 14px 5px 6px", borderRadius: 999, background: THEME.card, border: `1px solid ${THEME.cardBorder}`, boxShadow: clay(), color: THEME.chipC, fontFamily: TYPOGRAPHY.mono, fontSize: "0.7rem", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}><span style={{ width: 18, height: 18, borderRadius: "50%", background: THEME.grad }} />Limited Availability</div>
          <h2 style={{ marginBottom: 12, color: THEME.text, fontFamily: TYPOGRAPHY.head, fontSize: "clamp(1.9rem,3.5vw,2.7rem)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.03em" }}>Your revenue system is either<br />compounding or leaking.</h2>
          <p style={{ maxWidth: 450, margin: "0 auto 28px", color: THEME.text2, fontSize: "1.02rem", lineHeight: 1.7 }}>Book a free 30-minute strategy call. We will diagnose your pipeline and show you what a purpose-built system should look like.</p>
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", flexWrap: "wrap", alignItems: "stretch", justifyContent: "center", gap: 12 }}>
            <a href="#" style={{ width: isMobile ? "100%" : "auto", padding: "15px 28px", borderRadius: 999, background: THEME.grad, color: "#fff", textDecoration: "none", fontSize: "0.95rem", fontWeight: 700, textAlign: "center", boxShadow: `${THEME.btnGlow}, inset 0 2px 6px rgba(255,255,255,0.25)` }}>Book Your Strategy Call -&gt;</a>
            <a href="mailto:hello@automationpaths.com" style={{ width: isMobile ? "100%" : "auto", padding: "15px 22px", borderRadius: 999, background: THEME.card, color: THEME.text, textDecoration: "none", fontSize: "0.95rem", fontWeight: 600, textAlign: "center", border: `1px solid ${THEME.cardBorder}`, boxShadow: clay() }}>hello@automationpaths.com</a>
          </div>
        </div>
      </section>

      <footer style={{ maxWidth: 1140, margin: "0 auto", padding: isMobile ? "16px 16px 32px" : "24px 20px 32px", display: "flex", justifyContent: isMobile ? "center" : "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, textAlign: isMobile ? "center" : "left" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
          <span style={{ color: THEME.text2, fontFamily: TYPOGRAPHY.head, fontSize: "0.92rem", fontWeight: 700 }}>Automation Paths</span>
          <span style={{ color: THEME.text3, fontSize: "0.75rem" }}>(c) 2026 All rights reserved.</span>
        </div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
          {["LinkedIn", "YouTube", "Upwork"].map((item) => <a key={item} href="#" style={{ color: THEME.text3, textDecoration: "none", fontSize: "0.82rem", fontWeight: 600 }}>{item}</a>)}
        </div>
      </footer>
    </div>
  );
}
