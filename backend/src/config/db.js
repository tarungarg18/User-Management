import mongoose from "mongoose";

export async function connectDb() {
  const url = process.env.MONGO_URI;
  if (!url) {
    throw new Error("MONGO_URI missing in env");
  }

  await mongoose.connect(url);
  console.log("mongodb connected");
}
