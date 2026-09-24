const express = require("express");
const Article = require("../models/Article");
const { visibleStatusOr } = require("../utils/queryHelpers");

const router = express.Router();

// GET /sitemap.xml -> built live from whatever's actually published.
// Mounted at the site root (not under /api) since that's the conventional
// location search engines and robots.txt expect a sitemap to live.
router.get("/sitemap.xml", async (req, res) => {
  const siteUrl = (process.env.FRONTEND_URL || "https://yourdomain.com").replace(/\/$/, "");

  try {
    const articles = await Article.find(visibleStatusOr()).select("category slug updatedAt");

    const staticUrls = ["", "/finance", "/career", "/news", "/about", "/contact", "/privacy", "/terms"];

    const urlEntries = [
      ...staticUrls.map((path) => `  <url><loc>${siteUrl}${path}</loc></url>`),
      ...articles.map(
        (a) =>
          `  <url><loc>${siteUrl}/${a.category}/${a.slug}</loc><lastmod>${new Date(
            a.updatedAt
          ).toISOString()}</lastmod></url>`
      ),
    ];

    res.set("Content-Type", "application/xml");
    res.send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries.join(
        "\n"
      )}\n</urlset>`
    );
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to build sitemap.");
  }
});

module.exports = router;
