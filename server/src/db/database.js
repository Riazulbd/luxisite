import { DatabaseSync } from "node:sqlite";

let db;

export function initDatabase(dbPath) {
  db = new DatabaseSync(dbPath);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  return db;
}

export function getDb() {
  if (!db) {
    throw new Error("Database not initialized");
  }

  return db;
}
