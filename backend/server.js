require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth");
const articleRoutes = require("./routes/articles");
const jobRoutes = require("./routes/jobs");
const exportRoutes = require("./routes/export");
const searchRoutes = require("./routes/search");
const sitemapRoutes = require("./routes/sitemap");

const app = express();

app.use(helmet());

// In production, set FRONTEND_URL to your real site so only it can call
// this API from a browser. Falls back to allowing any origin locally so
// development isn't broken, with a console warning so it's not silently
// left open in production by accident.
const FRONTEND_URL = process.env.FRONTEND_URL;
if (FRONTEND_URL) {
  app.use(cors({ origin: FRONTEND_URL, credentials: true }));
} else {
  console.warn(
    "⚠️  FRONTEND_URL is not set — CORS is allowing all origins. Set FRONTEND_URL in .env before deploying to production."
  );
  app.use(cors());
}

app.use(express.json({ limit: "8mb" }));

// Sitemap lives at the conventional root path, not under /api
app.use("/", sitemapRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    dbConnected: mongoose.connection.readyState === 1,
  });
});

// Rate limit login attempts specifically -- a brute-force guess script
// otherwise has no obstacle at all.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: "Too many login attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth/login", loginLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/search", searchRoutes);

// Fallback for unknown API routes
app.use("/api", (req, res) => {
  res.status(404).json({ error: "API route not found." });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

async function start() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not set. Add it to your .env file.");
  } else {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log("Connected to MongoDB.");
    } catch (err) {
      console.error("MongoDB connection failed:", err.message);
    }
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();
