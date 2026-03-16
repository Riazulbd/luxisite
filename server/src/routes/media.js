import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { requireAuth } from "../middleware/auth.js";
import { buildPagination, removeFileIfExists, resolveUploadPath } from "../utils/blog.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (_req, file, callback) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp"
    ];

    if (!allowed.includes(file.mimetype)) {
      callback(new Error("Only JPEG, PNG, GIF, and WebP uploads are allowed"));
      return;
    }

    callback(null, true);
  }
});

function getUploadDirectory() {
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const absoluteDir = path.resolve(process.cwd(), "uploads", "blog", year, month);
  const relativeDir = `/uploads/blog/${year}/${month}`;
  fs.mkdirSync(absoluteDir, { recursive: true });
  return { absoluteDir, relativeDir };
}

router.post("/upload", requireAuth, upload.array("files", 10), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const files = req.files || [];

    if (!files.length) {
      return res.status(400).json({ error: "Please choose at least one image to upload" });
    }

    const insertMedia = db.prepare(
      `
        INSERT INTO media (
          filename, original_name, file_path, file_size, mime_type, width, height, alt_text, caption
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
    );

    const uploaded = [];

    for (const file of files) {
      const { absoluteDir, relativeDir } = getUploadDirectory();
      const fileId = uuidv4();
      const filename = `${fileId}.webp`;
      const thumbFilename = `${fileId}-thumb.webp`;
      const absolutePath = path.join(absoluteDir, filename);
      const absoluteThumbPath = path.join(absoluteDir, thumbFilename);
      const relativePath = `${relativeDir}/${filename}`;
      const relativeThumbPath = `${relativeDir}/${thumbFilename}`;

      const image = sharp(file.buffer).rotate();
      const metadata = await image.metadata();

      await image
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(absolutePath);

      await sharp(file.buffer)
        .rotate()
        .resize({ width: 400, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(absoluteThumbPath);

      const info = insertMedia.run(
        filename,
        file.originalname,
        relativePath,
        file.size,
        "image/webp",
        metadata.width || null,
        metadata.height || null,
        "",
        ""
      );

      uploaded.push({
        id: info.lastInsertRowid,
        url: relativePath,
        thumbnail_url: relativeThumbPath,
        width: metadata.width || null,
        height: metadata.height || null,
        filename
      });
    }

    return res.status(201).json({ files: uploaded });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Upload failed" });
  }
});

router.get("/", requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(req.query.limit || 24)));
  const offset = (page - 1) * limit;
  const total = db.prepare("SELECT COUNT(*) AS count FROM media").get().count;
  const media = db
    .prepare(
      `
        SELECT *
        FROM media
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `
    )
    .all(limit, offset)
    .map((item) => ({
      ...item,
      url: item.file_path,
      thumbnail_url: item.file_path.replace(/\.webp$/, "-thumb.webp")
    }));

  return res.json({
    media,
    pagination: buildPagination(page, limit, total)
  });
});

router.delete("/:id", requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const id = Number(req.params.id);
  const item = db.prepare("SELECT * FROM media WHERE id = ?").get(id);

  if (!item) {
    return res.status(404).json({ error: "Media item not found" });
  }

  const absoluteFile = resolveUploadPath(item.file_path);
  const absoluteThumb = resolveUploadPath(
    item.file_path.replace(/\.webp$/, "-thumb.webp")
  );
  removeFileIfExists(absoluteFile);
  removeFileIfExists(absoluteThumb);

  db.prepare("DELETE FROM media WHERE id = ?").run(id);
  return res.json({ success: true });
});

export default router;
