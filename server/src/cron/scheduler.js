export function startScheduler(db) {
  setInterval(() => {
    const now = new Date().toISOString();
    const duePosts = db
      .prepare("SELECT id FROM posts WHERE status = 'scheduled' AND scheduled_at <= ?")
      .all(now);

    for (const post of duePosts) {
      db.prepare(
        "UPDATE posts SET status = 'published', published_at = scheduled_at, updated_at = ? WHERE id = ?"
      ).run(now, post.id);
      console.log(`[scheduler] Published post ID ${post.id}`);
    }
  }, 60_000);

  console.log("[scheduler] Checking for scheduled posts every 60s");
}
