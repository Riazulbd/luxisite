import jwt from "jsonwebtoken";
import { getJwtSecret } from "../utils/auth.js";

function readToken(req) {
  const authHeader = req.headers.authorization || "";
  if (req.cookies?.token) {
    return req.cookies.token;
  }

  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return null;
}

export function requireAuth(req, res, next) {
  const token = readToken(req);

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const jwtSecret = req.app.locals.jwtSecret || getJwtSecret(req.app.locals.db);
    req.user = jwt.verify(token, jwtSecret);
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function optionalAuth(req, _res, next) {
  const token = readToken(req);

  if (token) {
    try {
      const jwtSecret = req.app.locals.jwtSecret || getJwtSecret(req.app.locals.db);
      req.user = jwt.verify(token, jwtSecret);
    } catch (error) {
      req.user = null;
    }
  }

  return next();
}
