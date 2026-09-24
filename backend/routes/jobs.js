const express = require("express");
const { body, validationResult } = require("express-validator");
const Job = require("../models/Job");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

function checkValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
}

const jobValidation = [
  body("title").isString().trim().isLength({ min: 1, max: 200 }).withMessage("Title must be 1-200 characters."),
  body("company").isString().trim().isLength({ min: 1, max: 150 }).withMessage("Company must be 1-150 characters."),
  body("applyUrl").isURL({ require_protocol: true }).withMessage("Apply link must be a valid URL (including https://)."),
  body("companyWebsite").optional({ checkFalsy: true }).isURL({ require_protocol: true }).withMessage("Company website must be a valid URL."),
  body("location").isString().trim().isLength({ min: 1, max: 150 }).withMessage("Location is required."),
  body("role").isString().trim().isLength({ min: 1, max: 100 }).withMessage("Role is required."),
  body("locationType").optional().isIn(["Remote", "Hybrid", "On-site"]),
  body("type").optional().isIn(["Full-time", "Part-time", "Contract", "Internship"]),
  body("level").optional().isIn(["Entry-level", "Mid-level", "Senior", "Lead / Manager"]),
  body("status").optional().isIn(["draft", "published"]),
];

const jobUpdateValidation = [
  body("title").optional().isString().trim().isLength({ min: 1, max: 200 }),
  body("company").optional().isString().trim().isLength({ min: 1, max: 150 }),
  body("applyUrl").optional().isURL({ require_protocol: true }).withMessage("Apply link must be a valid URL (including https://)."),
  body("companyWebsite").optional({ checkFalsy: true }).isURL({ require_protocol: true }),
  body("location").optional().isString().trim().isLength({ min: 1, max: 150 }),
  body("role").optional().isString().trim().isLength({ min: 1, max: 100 }),
  body("locationType").optional().isIn(["Remote", "Hybrid", "On-site"]),
  body("type").optional().isIn(["Full-time", "Part-time", "Contract", "Internship"]),
  body("level").optional().isIn(["Entry-level", "Mid-level", "Senior", "Lead / Manager"]),
  body("status").optional().isIn(["draft", "published"]),
];

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

// POST /api/jobs/:id/click -> increments the apply-click counter (public,
// fired when a visitor clicks "Apply" -- fire-and-forget, no auth needed)
router.post("/:id/click", async (req, res) => {
  try {
    await Job.findByIdAndUpdate(req.params.id, { $inc: { clicks: 1 } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to record click." });
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

router.post("/", requireAdmin, jobValidation, checkValidation, async (req, res) => {
  try {
    const {
      title, company, companyWebsite, applyUrl,
      location, locationType, type, level, role,
      description, postedDate, status,
    } = req.body;

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

router.put("/:id", requireAdmin, jobUpdateValidation, checkValidation, async (req, res) => {
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
