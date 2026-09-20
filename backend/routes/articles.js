const express = require("express");
const Article = require("../models/Article");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

// ---------- PUBLIC ROUTES ----------

// GET /api/articles              -> published articles only, newest first
// GET /api/articles?category=finance -> filtered by category
router.get("/", async (req, res) => {
  try {
    const filter = { status: "published" };
    if (req.query.category) filter.category = req.query.category;
    const articles = await Article.find(filter).sort({ date: -1 });
    res.json(articles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch articles." });
  }
});

// GET /api/articles/all          -> ALL articles including drafts (admin dashboard)
router.get("/all", requireAdmin, async (req, res) => {
  try {
    const articles = await Article.find({}).sort({ date: -1 });
    res.json(articles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch articles." });
  }
});

// GET /api/articles/slug/:slug   -> single published article by slug
router.get("/slug/:slug", async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug, status: "published" });
    if (!article) return res.status(404).json({ error: "Article not found." });
    res.json(article);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch article." });
  }
});

// ---------- ADMIN-ONLY ROUTES ----------

// GET /api/articles/admin/:id    -> fetch by Mongo ID, for editing in the dashboard
router.get("/admin/:id", requireAdmin, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ error: "Article not found." });
    res.json(article);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch article." });
  }
});

// POST /api/articles             -> create a new article
router.post("/", requireAdmin, async (req, res) => {
  try {
    const { title, slug, category, dek, readTime, date, toc, body, related, coverImage, status } = req.body;

    if (!title || !slug || !category || !dek || !body) {
      return res.status(400).json({ error: "Title, slug, category, dek, and body are required." });
    }

    const existing = await Article.findOne({ slug });
    if (existing) {
      return res.status(409).json({ error: "An article with this slug already exists." });
    }

    const article = await Article.create({
      title,
      slug: slug.toLowerCase().trim(),
      category,
      dek,
      readTime,
      date: date || Date.now(),
      toc: Array.isArray(toc) ? toc : [],
      body,
      related: Array.isArray(related) ? related : [],
      coverImage: coverImage || "",
      status: status === "draft" ? "draft" : "published",
    });

    res.status(201).json(article);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create article." });
  }
});

// PUT /api/articles/:id          -> update an existing article
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const { title, slug, category, dek, readTime, date, toc, body, related, coverImage, status } = req.body;

    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ error: "Article not found." });

    if (slug && slug !== article.slug) {
      const existing = await Article.findOne({ slug });
      if (existing) {
        return res.status(409).json({ error: "Another article already uses this slug." });
      }
      article.slug = slug.toLowerCase().trim();
    }

    if (title !== undefined) article.title = title;
    if (category !== undefined) article.category = category;
    if (dek !== undefined) article.dek = dek;
    if (readTime !== undefined) article.readTime = readTime;
    if (date !== undefined) article.date = date;
    if (toc !== undefined) article.toc = Array.isArray(toc) ? toc : [];
    if (body !== undefined) article.body = body;
    if (related !== undefined) article.related = Array.isArray(related) ? related : [];
    if (coverImage !== undefined) article.coverImage = coverImage;
    if (status !== undefined) article.status = status === "draft" ? "draft" : "published";

    await article.save();
    res.json(article);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update article." });
  }
});

// DELETE /api/articles/:id       -> delete an article
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ error: "Article not found." });
    res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete article." });
  }
});

module.exports = router;
