import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";

async function runSeedNow() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = "admin@purplemerit.com";
  const found = await User.findOne({ email });

  if (found) {
    console.log("admin already exists");
    process.exit(0);
  }

  const hash = await bcrypt.hash("Admin@123", 10);

  const admin = await User.create({
    name: "Main Admin",
    email,
    password: hash,
    role: "admin",
    status: "active"
  });

  admin.createdBy = admin._id;
  admin.updatedBy = admin._id;
  await admin.save();

  console.log("seed admin created");
  console.log("email:", email);
  console.log("password:", "Admin@123");
  process.exit(0);
}

runSeedNow().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
