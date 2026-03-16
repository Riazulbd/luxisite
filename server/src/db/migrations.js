import bcrypt from "bcryptjs";

function ensureColumn(db, tableName, columnName, definition) {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
  if (columns.some((column) => column.name === columnName)) {
    return;
  }

  db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
}

export function runMigrations(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT 'Admin',
      avatar TEXT,
      bio TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      color TEXT DEFAULT '#C8742A',
      parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      meta_title TEXT,
      meta_description TEXT,
      post_count INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      post_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      excerpt TEXT,
      content TEXT NOT NULL,
      content_raw TEXT,
      featured_image TEXT,
      featured_image_alt TEXT,
      featured_image_caption TEXT,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      author_id INTEGER REFERENCES users(id) DEFAULT 1,
      status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'scheduled', 'trash')),
      published_at DATETIME,
      scheduled_at DATETIME,
      reading_time INTEGER DEFAULT 0,
      word_count INTEGER DEFAULT 0,
      view_count INTEGER DEFAULT 0,
      meta_title TEXT,
      meta_description TEXT,
      focus_keyword TEXT,
      secondary_keywords TEXT,
      canonical_url TEXT,
      og_title TEXT,
      og_description TEXT,
      og_image TEXT,
      twitter_title TEXT,
      twitter_description TEXT,
      twitter_image TEXT,
      schema_type TEXT DEFAULT 'BlogPosting' CHECK(schema_type IN ('Article', 'BlogPosting', 'HowTo', 'FAQPage', 'TechArticle')),
      schema_json TEXT,
      seo_score INTEGER DEFAULT 0,
      readability_score INTEGER DEFAULT 0,
      technical_seo_score INTEGER DEFAULT 0,
      ai_generated_slug TEXT,
      ai_summary TEXT,
      ai_keywords TEXT,
      ai_seo_suggestions TEXT,
      ai_improved_content TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS post_tags (
      post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
      tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (post_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS post_revisions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      excerpt TEXT,
      meta_title TEXT,
      meta_description TEXT,
      revision_type TEXT DEFAULT 'manual' CHECK(revision_type IN ('manual', 'autosave', 'ai_improvement', 'publish')),
      revision_note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      width INTEGER,
      height INTEGER,
      alt_text TEXT,
      caption TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS seo_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      setting_key TEXT UNIQUE NOT NULL,
      setting_value TEXT NOT NULL,
      description TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS analytics_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      page_url TEXT,
      referrer TEXT,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      session_id TEXT,
      user_agent TEXT,
      ip_hash TEXT,
      country TEXT,
      device_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
    CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
    CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category_id);
    CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published_at DESC);
    CREATE INDEX IF NOT EXISTS idx_posts_seo_score ON posts(seo_score);
    CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
    CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
    CREATE INDEX IF NOT EXISTS idx_revisions_post ON post_revisions(post_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_media_created ON media(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_analytics_event ON analytics_events(event_type);
    CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at);
  `);

  ensureColumn(db, "media", "medium_path", "TEXT");
  ensureColumn(db, "media", "medium_width", "INTEGER");
  ensureColumn(db, "media", "medium_height", "INTEGER");
  ensureColumn(db, "media", "thumbnail_path", "TEXT");
  ensureColumn(db, "media", "thumbnail_width", "INTEGER");
  ensureColumn(db, "media", "thumbnail_height", "INTEGER");
  ensureColumn(db, "media", "og_path", "TEXT");
  ensureColumn(db, "media", "og_width", "INTEGER");
  ensureColumn(db, "media", "og_height", "INTEGER");

  const insertSetting = db.prepare(
    "INSERT OR IGNORE INTO seo_settings (setting_key, setting_value, description) VALUES (?, ?, ?)"
  );
  const defaults = [
    ["min_word_count", "300", "Minimum word count for SEO pass"],
    ["max_word_count", "5000", "Ideal max word count"],
    ["keyword_density_min", "0.5", "Min keyword density %"],
    ["keyword_density_max", "2.5", "Max keyword density %"],
    ["keyword_density_warning_min", "0.25", "Low-end warning band for keyword density %"],
    ["keyword_density_warning_max", "3.5", "High-end warning band for keyword density %"],
    ["meta_title_min_length", "30", "Min meta title chars"],
    ["meta_title_max_length", "60", "Max meta title chars"],
    ["meta_title_warning_min_length", "25", "Low-end warning band for meta title chars"],
    ["meta_title_warning_max_length", "65", "High-end warning band for meta title chars"],
    ["meta_desc_min_length", "120", "Min meta description chars"],
    ["meta_desc_max_length", "160", "Max meta description chars"],
    ["meta_desc_warning_min_length", "100", "Low-end warning band for meta description chars"],
    ["meta_desc_warning_max_length", "170", "High-end warning band for meta description chars"],
    ["min_headings", "3", "Minimum H2/H3 headings"],
    ["min_internal_links", "2", "Min internal links"],
    ["min_external_links", "1", "Min external links"],
    ["min_images", "1", "Min images per post"],
    ["image_alt_required", "true", "Require alt text on all images"],
    ["paragraph_max_words", "150", "Maximum ideal words per paragraph"],
    ["paragraph_warning_words", "200", "Paragraph warning threshold in words"],
    ["avg_sentence_max_words", "20", "Maximum ideal average sentence length"],
    ["avg_sentence_warning_words", "24", "Average sentence warning threshold"],
    ["transition_words_min", "3", "Minimum transition word count"],
    ["long_sentence_word_count", "25", "Words that count as a long sentence"],
    ["max_consecutive_long_sentences", "2", "Maximum consecutive long sentences allowed"],
    ["slug_max_length", "75", "Maximum slug length for SEO"],
    ["passive_voice_max_percent", "10", "Maximum passive voice percentage"],
    ["passive_voice_warning_percent", "20", "Passive voice warning threshold"],
    ["flesch_good_min", "60", "Minimum Flesch score for a pass"],
    ["flesch_warning_min", "45", "Minimum Flesch score for a warning"],
    ["sentence_start_repetition_max", "2", "Maximum repeated sentence starts allowed"],
    ["min_word_count_warning_ratio", "0.7", "Warning ratio vs min word count"],
    ["readability_target", "grade_8", "Target Flesch-Kincaid grade"],
    ["openrouter_model", "anthropic/claude-sonnet-4", "Default AI model"],
    ["openrouter_api_key", "", "OpenRouter API key"]
  ];

  for (const [key, value, description] of defaults) {
    insertSetting.run(key, value, description);
  }

  const fallbackAdminEmail = "admin@automationpaths.com";
  const adminEmail = (process.env.ADMIN_EMAIL || fallbackAdminEmail).trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "changeme123";
  const passwordHash = bcrypt.hashSync(adminPassword, 12);
  const configuredAdmin = db
    .prepare("SELECT id, email, password_hash, name FROM users WHERE email = ?")
    .get(adminEmail);
  const legacyAdmin = adminEmail === fallbackAdminEmail
    ? null
    : db.prepare("SELECT id, email, password_hash, name FROM users WHERE email = ?").get(fallbackAdminEmail);

  if (configuredAdmin) {
    if (
      !bcrypt.compareSync(adminPassword, configuredAdmin.password_hash) ||
      configuredAdmin.name !== "Riazul Islam"
    ) {
      db.prepare(
        "UPDATE users SET password_hash = ?, name = ? WHERE id = ?"
      ).run(passwordHash, "Riazul Islam", configuredAdmin.id);
    }
  } else if (legacyAdmin) {
    db.prepare(
      "UPDATE users SET email = ?, password_hash = ?, name = ? WHERE id = ?"
    ).run(adminEmail, passwordHash, "Riazul Islam", legacyAdmin.id);
  } else {
    db.prepare(
      "INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)"
    ).run(adminEmail, passwordHash, "Riazul Islam");
  }

  db.prepare(
    "INSERT OR IGNORE INTO categories (name, slug, description) VALUES (?, ?, ?)"
  ).run("Uncategorized", "uncategorized", "Default category");

  console.log("[db] Migrations complete");
}
