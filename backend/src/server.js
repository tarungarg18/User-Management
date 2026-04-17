import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDb } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ message: "server ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "route not found" });
});

app.use((err, req, res, next) => {
  const code = err?.statusCode || 500;
  const msg = err?.message || "server error";
  res.status(code).json({ message: msg });
});

const port = process.env.PORT || 5000;

connectDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`backend running on ${port}`);
    });
  })
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
