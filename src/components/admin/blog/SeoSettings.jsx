import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../../hooks/useApi";
import { useTheme } from "../../../hooks/useTheme";
import { buttonStyle, inputStyle, panelStyle } from "../ui";

export default function SeoSettings() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["seo-settings"],
    queryFn: () => apiFetch("/api/seo/settings")
  });
  const [settings, setSettings] = useState({});

  useEffect(() => {
    if (query.data?.settings) {
      setSettings(query.data.settings);
    }
  }, [query.data?.settings]);

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      apiFetch("/api/seo/settings", {
        method: "PUT",
        body: JSON.stringify({ settings: payload })
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["seo-settings"] })
  });

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div>
        <h1 style={{ margin: 0, fontFamily: "Outfit, sans-serif", color: theme.text }}>SEO settings</h1>
        <p style={{ margin: "8px 0 0", color: theme.text3, fontFamily: "Manrope, sans-serif" }}>
          Configure scoring thresholds and AI defaults without restarting the app.
        </p>
      </div>
      <section style={{ ...panelStyle(theme, { padding: 20, display: "grid", gap: 14 }) }}>
        {Object.entries(settings).map(([key, value]) => (
          <label key={key} style={{ display: "grid", gap: 8 }}>
            <span style={{ fontFamily: "IBM Plex Mono, monospace", color: theme.text2, fontSize: "0.82rem" }}>
              {key}
            </span>
            <input
              type={key.includes("password") || key.includes("api_key") ? "password" : "text"}
              value={value}
              onChange={(event) => setSettings((current) => ({ ...current, [key]: event.target.value }))}
              style={inputStyle(theme)}
            />
          </label>
        ))}
        <button type="button" onClick={() => saveMutation.mutate(settings)} style={buttonStyle(theme, "primary")}>
          {saveMutation.isPending ? "Saving..." : "Save All"}
        </button>
      </section>
    </div>
  );
}

