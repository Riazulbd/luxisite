import React, { useEffect, useMemo, useState } from "react";
import { clay, useTheme } from "../../hooks/useTheme";
import { useViewport } from "../../hooks/useViewport";

function slugHeading(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function TableOfContents({ content }) {
  const theme = useTheme();
  const { isMobile, isTablet } = useViewport();
  const [activeId, setActiveId] = useState("");

  const items = useMemo(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const doc = new DOMParser().parseFromString(content || "", "text/html");
    return Array.from(doc.querySelectorAll("h2, h3")).map((node) => ({
      id: slugHeading(node.textContent || ""),
      text: node.textContent || "",
      level: node.tagName.toLowerCase()
    }));
  }, [content]);

  useEffect(() => {
    if (!items.length) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible?.target?.id) {
          setActiveId(visible.target.id);
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px"
      }
    );

    items.forEach((item) => {
      const node = document.getElementById(item.id);
      if (node) {
        observer.observe(node);
      }
    });

    return () => observer.disconnect();
  }, [items]);

  if (!items.length) {
    return null;
  }

  if (isMobile) {
    return (
      <details
        style={{
          background: theme.card,
          border: `1px solid ${theme.cardBorder}`,
          borderRadius: 22,
          padding: 18,
          boxShadow: clay(1)
        }}
      >
        <summary
          style={{
            cursor: "pointer",
            fontFamily: "Outfit, sans-serif",
            color: theme.text
          }}
        >
          On this page
        </summary>
        <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              style={{
                textDecoration: "none",
                color: theme.text2,
                fontFamily: "Manrope, sans-serif",
                paddingLeft: item.level === "h3" ? 14 : 0,
                fontSize: item.level === "h3" ? "0.92rem" : "0.98rem"
              }}
            >
              {item.text}
            </a>
          ))}
        </div>
      </details>
    );
  }

  return (
    <aside
      style={{
        position: isTablet ? "static" : "sticky",
        top: isTablet ? "auto" : 24,
        background: theme.card,
        border: `1px solid ${theme.cardBorder}`,
        borderRadius: 22,
        padding: 20,
        boxShadow: clay(1)
      }}
    >
      <h3
        style={{
          margin: "0 0 14px",
          fontFamily: "Outfit, sans-serif",
          color: theme.text
        }}
      >
        On this page
      </h3>
      <div style={{ display: "grid", gap: 10 }}>
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            style={{
              textDecoration: "none",
              color: item.id === activeId ? theme.accentDark : theme.text2,
              fontFamily: "Manrope, sans-serif",
              paddingLeft: item.level === "h3" ? 14 : 0,
              fontSize: item.level === "h3" ? "0.92rem" : "0.98rem"
            }}
          >
            {item.text}
          </a>
        ))}
      </div>
    </aside>
  );
}

