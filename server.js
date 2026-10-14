require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./src/routes/auth");
const storyRoutes = require("./src/routes/stories");
const commentRoutes = require("./src/routes/comments");
const historyRoutes = require("./src/routes/history");
const { notFound, errorHandler } = require("./src/middleware/errors");

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json({ limit: "1mb" }));
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));

app.use(express.static(path.join(__dirname, "public")));
app.get("/api/health", (req, res) => res.json({ ok: true, service: "TRUYEN H API" }));

app.use("/api/auth", authRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/history", historyRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/truyen_h")
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`TRUYEN H running at http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
