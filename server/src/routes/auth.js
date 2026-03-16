import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { requireAuth } from "../middleware/auth.js";
import { getJwtSecret } from "../utils/auth.js";

const router = express.Router();

function serializeUser(user) {
  if (!user) {
    return null;
  }

  const { password_hash, ...safeUser } = user;
  return safeUser;
}

function signToken(user, jwtSecret) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name
    },
    jwtSecret,
    { expiresIn: "7d" }
  );
}

function getCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000
  };
}

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const db = req.app.locals.db;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.trim().toLowerCase());

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "Incorrect email or password" });
  }

  const token = signToken(user, req.app.locals.jwtSecret || getJwtSecret(db));
  res.cookie("token", token, getCookieOptions());

  return res.json({
    token,
    user: serializeUser(user)
  });
});

router.post("/logout", (_req, res) => {
  res.clearCookie("token", getCookieOptions());
  return res.json({ success: true });
});

router.get("/me", requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.json({ user: serializeUser(user) });
});

export default router;
