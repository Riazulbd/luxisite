import React, { useState } from "react";
import { clay, useTheme } from "../../hooks/useTheme";

function ShareButton({ label, onClick, theme }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: 0,
        borderRadius: 999,
        padding: "12px 16px",
        background: theme.surface2,
        color: theme.text,
        cursor: "pointer",
        fontFamily: "IBM Plex Mono, monospace",
        boxShadow: clay(0.8)
      }}
    >
      {label}
    </button>
  );
}

export default function ShareButtons({ url, title }) {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);

  const share = (shareUrl) => {
    window.open(shareUrl, "_blank", "noopener,noreferrer,width=640,height=720");
  };

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <ShareButton
        label="Twitter"
        theme={theme}
        onClick={() => share(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`)}
      />
      <ShareButton
        label="LinkedIn"
        theme={theme}
        onClick={() => share(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`)}
      />
      <ShareButton
        label="Facebook"
        theme={theme}
        onClick={() => share(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`)}
      />
      <ShareButton
        label={copied ? "Copied!" : "Copy Link"}
        theme={theme}
        onClick={async () => {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1800);
        }}
      />
    </div>
  );
}
