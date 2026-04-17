import bcrypt from "bcryptjs";
import { User } from "../models/User.js";

function pickUserData(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    createdBy: user.createdBy,
    updatedBy: user.updatedBy
  };
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function listUsers(req, res) {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const search = (req.query.search || "").trim();
  const role = (req.query.role || "").trim();
  const status = (req.query.status || "").trim();

  const where = {};

  if (search) {
    where.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ];
  }

  if (role) {
    where.role = role;
  }

  if (status) {
    where.status = status;
  }

  const total = await User.countDocuments(where);
  const users = await User.find(where)
    .select("name email role status createdBy updatedBy createdAt updatedAt")
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return res.json({
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    data: users.map((u) => pickUserData(u))
  });
}

export async function getUserById(req, res) {
  const user = await User.findById(req.params.id)
    .select("name email role status createdBy updatedBy createdAt updatedAt")
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email");

  if (!user) {
    return res.status(404).json({ message: "user not found" });
  }

  if (req.user.role === "user" && req.user._id.toString() !== user._id.toString()) {
    return res.status(403).json({ message: "forbidden" });
  }

  return res.json(pickUserData(user));
}

export async function createUser(req, res) {
  const { name, email, password, role, status } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "name, email, password required" });
  }

  if (!validEmail(email)) {
    return res.status(400).json({ message: "email invalid" });
  }

  if (!["admin", "manager", "user"].includes(role || "user")) {
    return res.status(400).json({ message: "role invalid" });
  }

  if (status && !["active", "inactive"].includes(status)) {
    return res.status(400).json({ message: "status invalid" });
  }

  const found = await User.findOne({ email: email.toLowerCase().trim() });
  if (found) {
    return res.status(409).json({ message: "email already exists" });
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hash,
    role: role || "user",
    status: status || "active",
    createdBy: req.user._id,
    updatedBy: req.user._id
  });

  return res.status(201).json(pickUserData(user));
}

export async function updateUser(req, res) {
  const target = await User.findById(req.params.id);
  if (!target) {
    return res.status(404).json({ message: "user not found" });
  }

  if (req.user.role === "manager" && target.role === "admin") {
    return res.status(403).json({ message: "cannot update admin" });
  }

  const { name, email, role, status } = req.body;

  if (name !== undefined) {
    if (!name.trim()) {
      return res.status(400).json({ message: "name invalid" });
    }
    target.name = name.trim();
  }

  if (email !== undefined) {
    if (!validEmail(email)) {
      return res.status(400).json({ message: "email invalid" });
    }

    const emailText = email.toLowerCase().trim();
    const found = await User.findOne({ email: emailText, _id: { $ne: target._id } });
    if (found) {
      return res.status(409).json({ message: "email already exists" });
    }

    target.email = emailText;
  }

  if (role !== undefined) {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "only admin can change role" });
    }

    if (!["admin", "manager", "user"].includes(role)) {
      return res.status(400).json({ message: "role invalid" });
    }

    target.role = role;
  }

  if (status !== undefined) {
    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ message: "status invalid" });
    }
    target.status = status;
  }

  target.updatedBy = req.user._id;
  await target.save();

  const fresh = await User.findById(target._id)
    .select("name email role status createdBy updatedBy createdAt updatedAt")
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email");

  return res.json(pickUserData(fresh));
}

export async function deactivateUser(req, res) {
  const target = await User.findById(req.params.id);
  if (!target) {
    return res.status(404).json({ message: "user not found" });
  }

  if (target.role === "admin" && req.user._id.toString() !== target._id.toString()) {
    return res.status(403).json({ message: "cannot deactivate other admin" });
  }

  target.status = "inactive";
  target.updatedBy = req.user._id;
  await target.save();

  return res.json({ message: "user deactivated", id: target._id, status: target.status });
}

export async function getMyProfile(req, res) {
  const me = await User.findById(req.user._id)
    .select("name email role status createdBy updatedBy createdAt updatedAt")
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email");

  return res.json(pickUserData(me));
}

export async function updateMyProfile(req, res) {
  const me = await User.findById(req.user._id).select("+password");
  const { name, password } = req.body;

  if (name !== undefined) {
    if (!name.trim()) {
      return res.status(400).json({ message: "name invalid" });
    }
    me.name = name.trim();
  }

  if (password !== undefined) {
    if (String(password).length < 6) {
      return res.status(400).json({ message: "password min 6 chars" });
    }
    me.password = await bcrypt.hash(password, 10);
  }

  me.updatedBy = req.user._id;
  await me.save();

  return res.json({
    id: me._id,
    name: me.name,
    email: me.email,
    role: me.role,
    status: me.status,
    createdAt: me.createdAt,
    updatedAt: me.updatedAt,
    createdBy: me.createdBy,
    updatedBy: me.updatedBy
  });
}
