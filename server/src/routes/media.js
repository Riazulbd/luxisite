import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { requireAuth } from "../middleware/auth.js";
import {
  buildPagination,
  getUploadsRoot,
  removeFileIfExists,
  resolveUploadPath
} from "../utils/blog.js";

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
  const absoluteDir = path.join(getUploadsRoot(), "blog", year, month);
  const relativeDir = `/uploads/blog/${year}/${month}`;
  fs.mkdirSync(absoluteDir, { recursive: true });
  return { absoluteDir, relativeDir };
}

function buildVariantPaths(relativeDir, absoluteDir, fileId) {
  return {
    full: {
      filename: `${fileId}.webp`,
      absolutePath: path.join(absoluteDir, `${fileId}.webp`),
      relativePath: `${relativeDir}/${fileId}.webp`
    },
    medium: {
      filename: `${fileId}-medium.webp`,
      absolutePath: path.join(absoluteDir, `${fileId}-medium.webp`),
      relativePath: `${relativeDir}/${fileId}-medium.webp`
    },
    thumbnail: {
      filename: `${fileId}-thumb.webp`,
      absolutePath: path.join(absoluteDir, `${fileId}-thumb.webp`),
      relativePath: `${relativeDir}/${fileId}-thumb.webp`
    },
    og: {
      filename: `${fileId}-og.webp`,
      absolutePath: path.join(absoluteDir, `${fileId}-og.webp`),
      relativePath: `${relativeDir}/${fileId}-og.webp`
    }
  };
}

function toMediaResponse(item) {
  return {
    ...item,
    url: item.file_path,
    medium_url: item.medium_path || item.file_path,
    thumbnail_url: item.thumbnail_path || item.file_path,
    og_url: item.og_path || item.file_path,
    variants: {
      full: item.file_path
        ? {
            url: item.file_path,
            width: item.width || null,
            height: item.height || null
          }
        : null,
      medium: item.medium_path
        ? {
            url: item.medium_path,
            width: item.medium_width || null,
            height: item.medium_height || null
          }
        : null,
      thumbnail: item.thumbnail_path
        ? {
            url: item.thumbnail_path,
            width: item.thumbnail_width || null,
            height: item.thumbnail_height || null
          }
        : null,
      og: item.og_path
        ? {
            url: item.og_path,
            width: item.og_width || null,
            height: item.og_height || null
          }
        : null
    }
  };
}

function deleteMediaVariants(item) {
  [
    item.file_path,
    item.medium_path,
    item.thumbnail_path,
    item.og_path
  ]
    .filter(Boolean)
    .forEach((variantPath) => removeFileIfExists(resolveUploadPath(variantPath)));
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
          filename,
          original_name,
          file_path,
          file_size,
          mime_type,
          width,
          height,
          alt_text,
          caption,
          medium_path,
          medium_width,
          medium_height,
          thumbnail_path,
          thumbnail_width,
          thumbnail_height,
          og_path,
          og_width,
          og_height
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
    );

    const uploaded = [];

    for (const file of files) {
      const { absoluteDir, relativeDir } = getUploadDirectory();
      const fileId = uuidv4();
      const variants = buildVariantPaths(relativeDir, absoluteDir, fileId);
      const image = sharp(file.buffer).rotate();

      const fullInfo = await image
        .clone()
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(variants.full.absolutePath);

      const mediumInfo = await image
        .clone()
        .resize({ width: 800, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(variants.medium.absolutePath);

      const thumbInfo = await image
        .clone()
        .resize({ width: 400, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(variants.thumbnail.absolutePath);

      const ogInfo = await image
        .clone()
        .resize({
          width: 1200,
          height: 630,
          fit: "cover",
          position: sharp.strategy.attention
        })
        .webp({ quality: 82 })
        .toFile(variants.og.absolutePath);

      const info = insertMedia.run(
        variants.full.filename,
        file.originalname,
        variants.full.relativePath,
        fullInfo.size,
        "image/webp",
        fullInfo.width || null,
        fullInfo.height || null,
        "",
        "",
        variants.medium.relativePath,
        mediumInfo.width || null,
        mediumInfo.height || null,
        variants.thumbnail.relativePath,
        thumbInfo.width || null,
        thumbInfo.height || null,
        variants.og.relativePath,
        ogInfo.width || null,
        ogInfo.height || null
      );

      uploaded.push({
        id: info.lastInsertRowid,
        url: variants.full.relativePath,
        medium_url: variants.medium.relativePath,
        thumbnail_url: variants.thumbnail.relativePath,
        og_url: variants.og.relativePath,
        width: fullInfo.width || null,
        height: fullInfo.height || null,
        medium_width: mediumInfo.width || null,
        medium_height: mediumInfo.height || null,
        thumbnail_width: thumbInfo.width || null,
        thumbnail_height: thumbInfo.height || null,
        og_width: ogInfo.width || null,
        og_height: ogInfo.height || null,
        filename: variants.full.filename,
        variants: {
          full: {
            url: variants.full.relativePath,
            width: fullInfo.width || null,
            height: fullInfo.height || null
          },
          medium: {
            url: variants.medium.relativePath,
            width: mediumInfo.width || null,
            height: mediumInfo.height || null
          },
          thumbnail: {
            url: variants.thumbnail.relativePath,
            width: thumbInfo.width || null,
            height: thumbInfo.height || null
          },
          og: {
            url: variants.og.relativePath,
            width: ogInfo.width || null,
            height: ogInfo.height || null
          }
        }
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
    .map((item) => toMediaResponse(item));

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

  deleteMediaVariants(item);
  db.prepare("DELETE FROM media WHERE id = ?").run(id);
  return res.json({ success: true });
});

export default router;
