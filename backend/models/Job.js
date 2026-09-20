const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    companyWebsite: { type: String, trim: true, default: "" },

    // This must always be the hiring company's own site (their careers page
    // or ATS like Greenhouse/Lever configured under their domain) --
    // never a third-party job board or aggregator link.
    applyUrl: { type: String, required: true, trim: true },

    location: { type: String, required: true, trim: true },
    locationType: {
      type: String,
      enum: ["Remote", "Hybrid", "On-site"],
      default: "On-site",
    },
    type: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship"],
      default: "Full-time",
    },
    level: {
      type: String,
      enum: ["Entry-level", "Mid-level", "Senior", "Lead / Manager"],
      default: "Entry-level",
    },
    role: { type: String, required: true, trim: true }, // e.g. Engineering, Design, Sales

    description: { type: String, default: "" },
    postedDate: { type: Date, required: true, default: Date.now },
    status: { type: String, enum: ["draft", "published"], default: "published" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", JobSchema);
