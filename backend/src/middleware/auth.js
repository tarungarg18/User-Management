import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export async function checkAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    return res.status(401).json({ message: "token missing" });
  }

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(data.id).select("_id name email role status");
    if (!user) {
      return res.status(401).json({ message: "user not found" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ message: "user inactive" });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "token invalid" });
  }
}

export function allowRoles(...roles) {
  return function roleCheck(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ message: "auth required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "forbidden" });
    }

    next();
  };
}
