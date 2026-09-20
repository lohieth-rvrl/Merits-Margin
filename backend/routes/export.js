const express = require("express");
const Article = require("../models/Article");
const Job = require("../models/Job");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

// GET /api/export -> a full JSON dump of all articles and jobs (all
// statuses, drafts included). Meant as a manual backup safety net since
// MongoDB Atlas's free tier has no automatic backups.
router.get("/", requireAdmin, async (req, res) => {
  try {
    const [articles, jobs] = await Promise.all([
      Article.find({}).lean(),
      Job.find({}).lean(),
    ]);

    res.setHeader("Content-Disposition", `attachment; filename="ledger-and-route-backup-${Date.now()}.json"`);
    res.setHeader("Content-Type", "application/json");
    res.json({
      exportedAt: new Date().toISOString(),
      articleCount: articles.length,
      jobCount: jobs.length,
      articles,
      jobs,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Export failed." });
  }
});

module.exports = router;
