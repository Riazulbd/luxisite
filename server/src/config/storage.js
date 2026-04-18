import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(__dirname, "../..");
const repoRoot = path.resolve(serverRoot, "..");
const localDataRoot = path.join(serverRoot, "data");
const localUploadsRoot = path.join(repoRoot, "uploads");
const isProduction = process.env.NODE_ENV === "production";

function resolveDataRoot() {
  const configured = process.env.CMS_DATA_DIR || process.env.DATA_DIR;
  if (configured) {
    return path.resolve(configured);
  }

  return isProduction ? "/data" : localDataRoot;
}

const dataRoot = resolveDataRoot();
const databasePath = path.resolve(
  process.env.CMS_DB_PATH || path.join(dataRoot, "blog.db")
);
const uploadsRoot = path.resolve(
  process.env.CMS_UPLOADS_DIR || path.join(dataRoot, "uploads")
);

function hasUserFiles(directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    return false;
  }

  return fs
    .readdirSync(directoryPath, { withFileTypes: true })
    .some((entry) => entry.name !== ".gitkeep");
}

function copyDirectoryContents(sourceDir, targetDir) {
  if (!fs.existsSync(sourceDir)) {
    return;
  }

  fs.mkdirSync(targetDir, { recursive: true });
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      copyDirectoryContents(sourcePath, targetPath);
      continue;
    }

    fs.copyFileSync(sourcePath, targetPath);
  }
}

export function ensureStorageDirectories() {
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  fs.mkdirSync(uploadsRoot, { recursive: true });
}

export function hydrateStorageFromLegacy() {
  ensureStorageDirectories();

  const legacyDatabasePath = path.join(localDataRoot, "blog.db");
  if (
    databasePath !== legacyDatabasePath &&
    !fs.existsSync(databasePath) &&
    fs.existsSync(legacyDatabasePath)
  ) {
    fs.copyFileSync(legacyDatabasePath, databasePath);
  }

  if (uploadsRoot !== localUploadsRoot && !hasUserFiles(uploadsRoot)) {
    copyDirectoryContents(localUploadsRoot, uploadsRoot);
  }
}

export function getDatabasePath() {
  return databasePath;
}

export function getUploadsRoot() {
  ensureStorageDirectories();
  return uploadsRoot;
}

export function getStorageSummary() {
  return {
    dataRoot,
    databasePath,
    uploadsRoot
  };
}
