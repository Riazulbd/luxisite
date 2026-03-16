import React, { useState } from "react";
import { useTheme } from "../../../hooks/useTheme";
import { buttonStyle, inputStyle, panelStyle } from "../ui";

export default function SchedulePublish({ initialValue, onSchedule, onClose }) {
  const theme = useTheme();
  const [value, setValue] = useState(
    initialValue ? new Date(initialValue).toISOString().slice(0, 16) : ""
  );

  return (
    <div style={{ ...panelStyle(theme, { padding: 18, display: "grid", gap: 12 }) }}>
      <div style={{ fontFamily: "Outfit, sans-serif", color: theme.text }}>Schedule publish</div>
      <input type="datetime-local" value={value} onChange={(event) => setValue(event.target.value)} style={inputStyle(theme)} />
      <div style={{ display: "flex", gap: 10 }}>
        <button type="button" onClick={() => onSchedule(value)} style={buttonStyle(theme, "primary")}>
          Schedule
        </button>
        <button type="button" onClick={onClose} style={buttonStyle(theme, "ghost")}>
          Cancel
        </button>
      </div>
    </div>
  );
}

