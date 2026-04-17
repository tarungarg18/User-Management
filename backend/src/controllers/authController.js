import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { makeToken } from "../utils/makeToken.js";

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function loginUser(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "email and password required" });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
  if (!user) {
    return res.status(401).json({ message: "invalid credentials" });
  }

  if (user.status !== "active") {
    return res.status(403).json({ message: "user inactive" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "invalid credentials" });
  }

  const token = makeToken(user._id.toString());

  return res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  });
}

export async function registerUser(req, res) {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "name, email, password required" });
  }

  if (!validEmail(email)) {
    return res.status(400).json({ message: "email invalid" });
  }

  const found = await User.findOne({ email: email.toLowerCase().trim() });
  if (found) {
    return res.status(409).json({ message: "email already exists" });
  }

  const hash = await bcrypt.hash(password, 10);
  const firstAdmin = (await User.countDocuments()) === 0;

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hash,
    role: firstAdmin ? "admin" : role || "user",
    status: "active",
    createdBy: req.user?._id || null,
    updatedBy: req.user?._id || null
  });

  return res.status(201).json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  });
}

export async function seedAdminOnce(req, res) {
  const { name, email, password, seedKey } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "name, email, password required" });
  }

  if (!validEmail(email)) {
    return res.status(400).json({ message: "email invalid" });
  }

  if (String(password).length < 6) {
    return res.status(400).json({ message: "password min 6 chars" });
  }

  const adminExists = await User.exists({ role: "admin" });
  if (adminExists) {
    return res.status(409).json({ message: "admin already exists" });
  }

  if (process.env.SEED_ADMIN_KEY && process.env.SEED_ADMIN_KEY !== seedKey) {
    return res.status(403).json({ message: "seed key invalid" });
  }

  const found = await User.findOne({ email: email.toLowerCase().trim() });
  if (found) {
    return res.status(409).json({ message: "email already exists" });
  }

  const hash = await bcrypt.hash(password, 10);
  const admin = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hash,
    role: "admin",
    status: "active"
  });

  admin.createdBy = admin._id;
  admin.updatedBy = admin._id;
  await admin.save();

  return res.status(201).json({
    id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    status: admin.status,
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt
  });
}
