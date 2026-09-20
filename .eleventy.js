const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const baseSlugify = require("slugify");

// Single shared slugify function -- used both for heading IDs (via markdown-it-anchor)
// and for the TOC filter in templates, so the two always match exactly.
function slug(input) {
  return baseSlugify(String(input), { lower: true, strict: true });
}

module.exports = function (eleventyConfig) {
  const md = markdownIt({ html: true }).use(markdownItAnchor, {
    slugify: slug,
  });
  eleventyConfig.setLibrary("md", md);
  eleventyConfig.addFilter("slugify", slug);

  // Copy static assets straight through to the output folder
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/ads.txt": "ads.txt" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });
  eleventyConfig.addPassthroughCopy({ "admin": "admin" });

  // Articles collection, sorted newest first
  eleventyConfig.addCollection("articles", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/articles/*.md").sort((a, b) => {
      return new Date(b.data.date) - new Date(a.data.date);
    });
  });

  // Per-category collections: finance, career, news
  ["finance", "career", "news"].forEach(function (cat) {
    eleventyConfig.addCollection(cat, function (collectionApi) {
      return collectionApi
        .getFilteredByGlob("src/articles/*.md")
        .filter((item) => item.data.category === cat)
        .sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
    });
  });

  eleventyConfig.addFilter("dateDisplay", function (dateObj) {
    const d = new Date(dateObj);
    return d.toISOString().split("T")[0];
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
