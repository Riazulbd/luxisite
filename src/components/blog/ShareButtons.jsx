import React, { useState } from "react";
import { clay, useTheme } from "../../hooks/useTheme";

function BrandIcon({ name }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true
  };

  if (name === "x") {
    return (
      <svg {...common}>
        <path
          d="M18.901 2H22.58L14.544 11.186L24 22H16.595L10.796 15.436L4.993 22H1.312L9.907 12.274L0.837 2H8.43L13.674 8.001L18.901 2Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (name === "linkedin") {
    return (
      <svg {...common}>
        <path
          d="M20.447 20.452H16.893V14.87C16.893 13.539 16.867 11.828 15.04 11.828C13.186 11.828 12.902 13.277 12.902 14.773V20.452H9.348V9H12.761V10.561H12.809C13.285 9.659 14.447 8.708 16.182 8.708C19.788 8.708 20.448 11.082 20.448 14.17V20.452H20.447ZM5.337 7.433C4.194 7.433 3.271 6.507 3.271 5.367C3.271 4.227 4.195 3.302 5.337 3.302C6.477 3.302 7.402 4.227 7.402 5.367C7.402 6.507 6.477 7.433 5.337 7.433ZM7.119 20.452H3.555V9H7.119V20.452Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (name === "facebook") {
    return (
      <svg {...common}>
        <path
          d="M13.5 22V12.985H16.52L16.972 9.475H13.5V7.242C13.5 6.226 13.785 5.532 15.243 5.532H17.094V2.391C16.194 2.296 15.289 2.25 14.383 2.255C11.695 2.255 9.855 3.896 9.855 6.91V9.469H6.828V12.979H9.855V22H13.5Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path
        d="M10.586 13.414C9.805 14.195 8.538 14.195 7.757 13.414C6.976 12.633 6.976 11.367 7.757 10.586L10.586 7.757C11.367 6.976 12.633 6.976 13.414 7.757C14.195 8.538 14.195 9.805 13.414 10.586"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.414 10.586C14.195 9.805 15.462 9.805 16.243 10.586C17.024 11.367 17.024 12.633 16.243 13.414L13.414 16.243C12.633 17.024 11.367 17.024 10.586 16.243C9.805 15.462 9.805 14.195 10.586 13.414"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShareButton({ label, brandColor, onClick, children, copied = false }) {
  const theme = useTheme();

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      style={{
        width: 52,
        height: 52,
        border: 0,
        borderRadius: 999,
        background: copied ? theme.grad : theme.surface2,
        color: copied ? "#FFFFFF" : brandColor,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: clay(0.8),
        transition: "transform 180ms ease, box-shadow 180ms ease, background 180ms ease"
      }}
    >
      {children}
    </button>
  );
}

export default function ShareButtons({ url, title }) {
  const [copied, setCopied] = useState(false);

  const share = (shareUrl) => {
    window.open(shareUrl, "_blank", "noopener,noreferrer,width=640,height=720");
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <ShareButton
        label="Share on X"
        brandColor="#111827"
        onClick={() =>
          share(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
          )
        }
      >
        <BrandIcon name="x" />
      </ShareButton>
      <ShareButton
        label="Share on LinkedIn"
        brandColor="#0A66C2"
        onClick={() =>
          share(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
          )
        }
      >
        <BrandIcon name="linkedin" />
      </ShareButton>
      <ShareButton
        label="Share on Facebook"
        brandColor="#1877F2"
        onClick={() =>
          share(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
          )
        }
      >
        <BrandIcon name="facebook" />
      </ShareButton>
      <ShareButton
        label={copied ? "Link copied" : "Copy link"}
        brandColor="#C8742A"
        copied={copied}
        onClick={async () => {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1800);
        }}
      >
        {copied ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M5 12.5L9.5 17L19 7.5"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <BrandIcon name="link" />
        )}
      </ShareButton>
    </div>
  );
}
