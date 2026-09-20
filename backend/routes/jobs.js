const express = require("express");
const Job = require("../models/Job");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

// ---------- PUBLIC ROUTES ----------

// GET /api/jobs?level=&type=&role=&location=&company=
// All filters are optional and combine with AND. Only published listings.
router.get("/", async (req, res) => {
  try {
    const filter = { status: "published" };
    const { level, type, role, location, company } = req.query;
    if (level) filter.level = level;
    if (type) filter.type = type;
    if (role) filter.role = role;
    if (location) filter.location = new RegExp(location, "i");
    if (company) filter.company = new RegExp(company, "i");

    const jobs = await Job.find(filter).sort({ postedDate: -1 });
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch jobs." });
  }
});

// ---------- ADMIN-ONLY ROUTES ----------

// GET /api/jobs/all -> every listing including drafts, for the dashboard
router.get("/all", requireAdmin, async (req, res) => {
  try {
    const jobs = await Job.find({}).sort({ postedDate: -1 });
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch jobs." });
  }
});

router.get("/admin/:id", requireAdmin, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found." });
    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch job." });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    const {
      title, company, companyWebsite, applyUrl,
      location, locationType, type, level, role,
      description, postedDate, status,
    } = req.body;

    if (!title || !company || !applyUrl || !location || !role) {
      return res.status(400).json({
        error: "Title, company, apply link, location, and role are required.",
      });
    }

    const job = await Job.create({
      title, company, companyWebsite, applyUrl,
      location,
      locationType: locationType || "On-site",
      type: type || "Full-time",
      level: level || "Entry-level",
      role,
      description,
      postedDate: postedDate || Date.now(),
      status: status === "draft" ? "draft" : "published",
    });

    res.status(201).json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create job." });
  }
});

router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found." });

    const fields = [
      "title", "company", "companyWebsite", "applyUrl",
      "location", "locationType", "type", "level", "role",
      "description", "postedDate",
    ];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) job[f] = req.body[f];
    });
    if (req.body.status !== undefined) {
      job.status = req.body.status === "draft" ? "draft" : "published";
    }

    await job.save();
    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update job." });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found." });
    res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete job." });
  }
});

module.exports = router;
