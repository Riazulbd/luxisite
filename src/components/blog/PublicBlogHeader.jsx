import React from "react";
import { Link, useLocation } from "react-router-dom";
import automationPathsBrandLogo from "../../../Automation Paths Logo (3).png";
import { clay, useTheme } from "../../hooks/useTheme";
import { useViewport } from "../../hooks/useViewport";

const UPWORK_URL = "https://www.upwork.com/freelancers/automationpaths";

function HeaderLink({ item, active, theme }) {
  const sharedStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 14px",
    borderRadius: 999,
    textDecoration: "none",
    fontFamily: "Manrope, sans-serif",
    fontSize: "0.84rem",
    fontWeight: 700,
    color: active ? "#fff" : theme.text2,
    background: active ? theme.grad : "transparent",
    boxShadow: active ? clay(0.85) : "none"
  };

  if (item.to) {
    return (
      <Link to={item.to} style={sharedStyle}>
        {item.label}
      </Link>
    );
  }

  return (
    <a href={item.href} style={sharedStyle}>
      {item.label}
    </a>
  );
}

export default function PublicBlogHeader() {
  const theme = useTheme();
  const { isMobile, isTablet } = useViewport();
  const location = useLocation();
  const navItems = isMobile
    ? [
        { label: "Home", href: "/" },
        { label: "Blog", to: "/blog" }
      ]
    : [
        { label: "Home", href: "/" },
        { label: "About", href: "/#about" },
        { label: "Results", href: "/#results" },
        { label: "Blog", to: "/blog" }
      ];

  return (
    <header style={{ maxWidth: 1240, margin: "0 auto 24px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: isTablet ? "wrap" : "nowrap",
          padding: isMobile ? "14px 14px" : "10px 12px 10px 20px",
          background: theme.surface,
          border: `1px solid ${theme.cardBorder}`,
          borderRadius: isTablet ? 28 : 999,
          boxShadow: clay(1.1)
        }}
      >
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: isMobile ? "center" : "flex-start",
            width: isMobile ? "100%" : "auto"
          }}
        >
          <img
            src={automationPathsBrandLogo}
            alt="Automation Paths"
            width="200"
            height="50"
            decoding="async"
            style={{
              display: "block",
              height: isMobile ? 30 : 36,
              width: "auto",
              objectFit: "contain"
            }}
          />
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: isMobile ? "space-between" : isTablet ? "space-between" : "flex-end",
            gap: 8,
            flexWrap: "wrap",
            width: isMobile || isTablet ? "100%" : "auto"
          }}
        >
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {navItems.map((item) => {
              const active =
                item.to && location.pathname.startsWith(item.to);
              return (
                <HeaderLink
                  key={item.label}
                  item={item}
                  active={active}
                  theme={theme}
                />
              );
            })}
          </div>
          <a
            href={UPWORK_URL}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: isMobile ? "12px 18px" : "10px 18px",
              minWidth: isMobile ? "100%" : "auto",
              borderRadius: 999,
              background: theme.grad,
              color: "#fff",
              textDecoration: "none",
              fontFamily: "Manrope, sans-serif",
              fontWeight: 800,
              fontSize: "0.84rem",
              boxShadow: clay(1.2)
            }}
          >
            Hire on Upwork
          </a>
        </div>
      </div>
    </header>
  );
}
