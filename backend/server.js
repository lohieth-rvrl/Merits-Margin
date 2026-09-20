require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const articleRoutes = require("./routes/articles");

const app = express();

app.use(cors());
app.use(express.json({ limit: "8mb" }));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    dbConnected: mongoose.connection.readyState === 1,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);

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
