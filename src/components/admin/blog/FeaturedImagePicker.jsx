import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import { useTheme } from "../../../hooks/useTheme";
import { buttonStyle, inputStyle, panelStyle } from "../ui";
import MediaLibrary from "./MediaLibrary";

export default function FeaturedImagePicker({ value, altText, onChange, onAltChange }) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const uploadMutation = useMutation({
    mutationFn: async (files) => {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      const token = window.localStorage.getItem("ap_admin_token") || "";
      const response = await fetch("/api/media/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
        body: formData
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Upload failed");
      }
      return payload;
    },
    onSuccess: (payload) => {
      const first = payload.files?.[0];
      if (first) {
        onChange(first.url);
      }
    }
  });
  const dropzone = useDropzone({
    onDrop: (files) => uploadMutation.mutate(files),
    accept: { "image/*": [] }
  });

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div
        {...dropzone.getRootProps()}
        style={{
          ...panelStyle(theme, {
            padding: 18,
            borderStyle: "dashed",
            background: theme.surface2,
            cursor: "pointer"
          })
        }}
      >
        <input {...dropzone.getInputProps()} />
        {value ? (
          <img src={value} alt={altText || "Featured"} style={{ width: "100%", borderRadius: 16, aspectRatio: "16 / 9", objectFit: "cover" }} />
        ) : (
          <div style={{ color: theme.text2, fontFamily: "Manrope, sans-serif" }}>
            Drop a featured image here or click to upload.
          </div>
        )}
      </div>
      <input value={altText || ""} onChange={(event) => onAltChange(event.target.value)} placeholder="Alt text" style={inputStyle(theme)} />
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button type="button" onClick={() => setOpen(true)} style={buttonStyle(theme, "default")}>
          Choose from Library
        </button>
        {value ? (
          <button type="button" onClick={() => onChange("")} style={buttonStyle(theme, "ghost")}>
            Remove
          </button>
        ) : null}
      </div>
      {open ? (
        <MediaLibrary
          selectionMode
          onClose={() => setOpen(false)}
          onSelect={(item) => {
            onChange(item.url);
            setOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
