const mongoose = require("mongoose");

const ArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    category: {
      type: String,
      required: true,
      enum: ["finance", "career", "news"],
    },
    dek: { type: String, required: true },
    readTime: { type: String, default: "5 min read" },
    date: { type: Date, required: true, default: Date.now },
    toc: { type: [String], default: [] },
    body: { type: String, required: true }, // markdown/HTML content
    related: { type: [String], default: [] }, // slugs of other articles
    coverImage: { type: String, default: "" }, // data URL or hosted image URL
    status: { type: String, enum: ["draft", "published"], default: "published" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Article", ArticleSchema);
