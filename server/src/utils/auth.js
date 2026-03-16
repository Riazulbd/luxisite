import { randomBytes } from "crypto";

let cachedJwtSecret = "";

export function getJwtSecret(db) {
  if (process.env.JWT_SECRET) {
    cachedJwtSecret = process.env.JWT_SECRET;
    return cachedJwtSecret;
  }

  if (cachedJwtSecret) {
    return cachedJwtSecret;
  }

  const existing = db
    .prepare("SELECT setting_value FROM seo_settings WHERE setting_key = ?")
    .get("jwt_secret");

  if (existing?.setting_value) {
    cachedJwtSecret = existing.setting_value;
    return cachedJwtSecret;
  }

  cachedJwtSecret = randomBytes(48).toString("hex");
  db.prepare(
    "INSERT OR REPLACE INTO seo_settings (setting_key, setting_value, description, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)"
  ).run(
    "jwt_secret",
    cachedJwtSecret,
    "Internal JWT signing secret"
  );

  return cachedJwtSecret;
}
