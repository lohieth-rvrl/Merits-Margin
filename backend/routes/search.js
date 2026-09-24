const express = require("express");
const Article = require("../models/Article");
const Job = require("../models/Job");
const { visibleStatusOr } = require("../utils/queryHelpers");

const router = express.Router();

// GET /api/search?q=budget -> combined article + job results, public only
router.get("/", async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.json({ articles: [], jobs: [] });

  try {
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"); // escape regex special chars

    const articles = await Article.find({
      $and: [
        visibleStatusOr(),
        { $or: [{ title: regex }, { dek: regex }] },
      ],
    })
      .select("title slug category dek coverImage readTime date")
      .limit(10);

    const jobs = await Job.find({
      status: "published",
      $or: [{ title: regex }, { company: regex }, { role: regex }],
    })
      .select("title company location level type")
      .limit(10);

    res.json({ articles, jobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search failed." });
  }
});

module.exports = router;
