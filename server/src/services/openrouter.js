import { getDb } from "../db/database.js";

function getApiKey() {
  if (process.env.OPENROUTER_API_KEY) {
    return process.env.OPENROUTER_API_KEY;
  }

  const db = getDb();
  const row = db
    .prepare("SELECT setting_value FROM seo_settings WHERE setting_key = ?")
    .get("openrouter_api_key");
  return row?.setting_value || "";
}

function getModel() {
  if (process.env.OPENROUTER_MODEL) {
    return process.env.OPENROUTER_MODEL;
  }

  const db = getDb();
  const row = db
    .prepare("SELECT setting_value FROM seo_settings WHERE setting_key = ?")
    .get("openrouter_model");
  return row?.setting_value || "anthropic/claude-sonnet-4";
}

export async function callOpenRouter(systemPrompt, userPrompt, options = {}) {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error("OpenRouter API key not configured");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.SITE_URL || "https://automationpaths.com",
      "X-Title": "Automation Paths CMS"
    },
    body: JSON.stringify({
      model: options.model || getModel(),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? 4000
    })
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    throw new Error(
      `OpenRouter error: ${response.status} - ${errorPayload.error?.message || "Unknown"}`
    );
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}
