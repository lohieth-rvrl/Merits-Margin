const express = require("express");
const { body, validationResult } = require("express-validator");
const Article = require("../models/Article");
const { requireAdmin } = require("../middleware/auth");
const { visibleStatusOr } = require("../utils/queryHelpers");

const router = express.Router();

function normalizeStatus(status, scheduledFor) {
  if (status === "draft") return "draft";
  if (status === "scheduled" && scheduledFor) return "scheduled";
  return "published";
}

function checkValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
}

const articleValidation = [
  body("title").isString().trim().isLength({ min: 1, max: 200 }).withMessage("Title must be 1-200 characters."),
  body("slug")
    .isString()
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage("Slug can only contain lowercase letters, numbers, and hyphens."),
  body("category").isIn(["finance", "career", "news"]).withMessage("Category must be finance, career, or news."),
  body("dek").isString().trim().isLength({ min: 1, max: 400 }).withMessage("Dek must be 1-400 characters."),
  body("body").isString().trim().isLength({ min: 1 }).withMessage("Body is required."),
  body("status").optional().isIn(["draft", "scheduled", "published"]).withMessage("Invalid status."),
  body("scheduledFor").optional({ nullable: true }).isISO8601().withMessage("scheduledFor must be a valid date."),
];

const articleUpdateValidation = [
  body("title").optional().isString().trim().isLength({ min: 1, max: 200 }).withMessage("Title must be 1-200 characters."),
  body("slug").optional().isString().trim().matches(/^[a-z0-9-]+$/).withMessage("Slug can only contain lowercase letters, numbers, and hyphens."),
  body("category").optional().isIn(["finance", "career", "news"]).withMessage("Category must be finance, career, or news."),
  body("dek").optional().isString().trim().isLength({ min: 1, max: 400 }).withMessage("Dek must be 1-400 characters."),
  body("body").optional().isString().trim().isLength({ min: 1 }).withMessage("Body cannot be empty."),
  body("status").optional().isIn(["draft", "scheduled", "published"]).withMessage("Invalid status."),
  body("scheduledFor").optional({ nullable: true }).isISO8601().withMessage("scheduledFor must be a valid date."),
];

// ---------- PUBLIC ROUTES ----------

// GET /api/articles              -> published (or due-scheduled) articles, newest first
// GET /api/articles?category=finance -> filtered by category
router.get("/", async (req, res) => {
  try {
    const filter = { ...visibleStatusOr() };
    if (req.query.category) filter.category = req.query.category;
    const articles = await Article.find(filter).sort({ date: -1 });
    res.json(articles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch articles." });
  }
});

// GET /api/articles/all          -> ALL articles including drafts/scheduled (admin dashboard)
router.get("/all", requireAdmin, async (req, res) => {
  try {
    const articles = await Article.find({}).sort({ date: -1 });
    res.json(articles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch articles." });
  }
});

// GET /api/articles/slug/:slug   -> single publicly-visible article by slug
router.get("/slug/:slug", async (req, res) => {
  try {
    const article = await Article.findOneAndUpdate(
      { slug: req.params.slug, ...visibleStatusOr() },
      { $inc: { views: 1 } },
      { new: true }
    );
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
router.post("/", requireAdmin, articleValidation, checkValidation, async (req, res) => {
  try {
    const { title, slug, category, dek, readTime, date, toc, body, related, coverImage, status, scheduledFor } = req.body;

    if (status === "scheduled" && !scheduledFor) {
      return res.status(400).json({ error: "A scheduled article needs a scheduledFor date." });
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
      status: normalizeStatus(status, scheduledFor),
      scheduledFor: status === "scheduled" ? scheduledFor : null,
    });

    res.status(201).json(article);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create article." });
  }
});

// PUT /api/articles/:id          -> update an existing article
router.put("/:id", requireAdmin, articleUpdateValidation, checkValidation, async (req, res) => {
  try {
    const { title, slug, category, dek, readTime, date, toc, body, related, coverImage, status, scheduledFor } = req.body;

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
    if (status !== undefined) {
      if (status === "scheduled" && !scheduledFor && !article.scheduledFor) {
        return res.status(400).json({ error: "A scheduled article needs a scheduledFor date." });
      }
      article.status = normalizeStatus(status, scheduledFor || article.scheduledFor);
      article.scheduledFor = status === "scheduled" ? (scheduledFor || article.scheduledFor) : null;
    }

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
