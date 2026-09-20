#!/usr/bin/env node
/**
 * Daily article automation.
 *
 * What this does, in order:
 *   1. Picks the next topic from scripts/topics.js (cycling through the list,
 *      remembering position in scripts/state.json).
 *   2. Calls the free Gemini API (Google AI Studio) to write a full article
 *      for that topic.
 *   3. Builds a cover image and one in-body image via Pollinations.ai (free,
 *      no key needed -- these are just constructed image URLs, not files).
 *   4. Optionally finds one related YouTube video via the YouTube Data API
 *      (free, but needs its own separate API key -- skipped automatically
 *      if you haven't set one up).
 *   5. Appends a "Sources & further reading" section linking to a fixed,
 *      hand-picked list of real, stable authoritative sites (never
 *      model-generated, so it can never cite a fabricated or dead link).
 *   6. Saves it as a DRAFT through the backend's normal API -- it never
 *      appears on the public site until you open the admin dashboard and
 *      publish it yourself.
 *
 * Run manually with:   node scripts/generate-daily-article.js
 * Schedule it with cron/Task Scheduler -- see README.md for exact steps.
 *
 * Required environment variables (put these in backend/.env):
 *   GEMINI_API_KEY      Free key from https://aistudio.google.com/app/apikey
 *                        -- no credit card required.
 *   API_URL             Your backend's API base, e.g. http://localhost:5000/api
 *   SEED_ADMIN_EMAIL    Same admin login used by seed.js
 *   SEED_ADMIN_PASSWORD Same admin login used by seed.js
 *   GEMINI_MODEL        Optional. Defaults to a current free-tier model.
 *   YOUTUBE_API_KEY     Optional. Free key from Google Cloud Console --
 *                        see README for setup. Without it, the "Related
 *                        video" section is simply skipped.
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const topics = require("./topics");
const sources = require("./sources");

const STATE_PATH = path.join(__dirname, "state.json");
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || "";
const API_URL = process.env.API_URL || "http://localhost:5000/api";
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

function fail(message) {
  console.error(`\n❌ ${message}\n`);
  process.exit(1);
}

if (!GEMINI_API_KEY) fail("GEMINI_API_KEY is not set in backend/.env — get a free one at https://aistudio.google.com/app/apikey");
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) fail("SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD are not set in backend/.env");

// ---------------------------------------------------------------- state
function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_PATH, "utf8"));
  } catch {
    return { lastIndex: -1 };
  }
}
function saveState(state) {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

function getNextTopic() {
  const state = loadState();
  const nextIndex = (state.lastIndex + 1) % topics.length;
  saveState({ lastIndex: nextIndex });
  return topics[nextIndex];
}

// ---------------------------------------------------------------- helpers
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

function extractToc(body) {
  const matches = [...body.matchAll(/^##\s+(.+)$/gm)];
  return matches.map((m) => m[1].trim());
}

function estimateReadTime(body) {
  const words = body.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

function parseModelReply(text) {
  const titleMatch = text.match(/^TITLE:\s*(.+)$/m);
  const dekMatch = text.match(/^DEK:\s*(.+)$/m);
  const bodyMarker = text.indexOf("===BODY===");

  if (!titleMatch || !dekMatch || bodyMarker === -1) {
    throw new Error("Model reply didn't match the expected TITLE/DEK/===BODY=== format.");
  }

  const title = titleMatch[1].trim();
  const dek = dekMatch[1].trim();
  const body = text.slice(bodyMarker + "===BODY===".length).trim();

  if (!title || !dek || !body) {
    throw new Error("Model reply was missing a title, dek, or body.");
  }

  return { title, dek, body };
}

// ---------------------------------------------------------------- images (Pollinations.ai, free, no key)
// These are just constructed URLs -- nothing is downloaded here. A visitor's
// own browser fetches the image when they load the page.
function buildImageUrl(promptText, width, height) {
  const stylized = `${promptText}, flat editorial illustration, warm color palette, minimalist, no text, no watermark`;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(stylized)}?width=${width}&height=${height}&nologo=true`;
}

// Places one in-body image right after the first "## heading" line, using
// that heading's own text as the image prompt so it's actually relevant.
function insertInlineImage(body) {
  const match = body.match(/^##\s+(.+)$/m);
  if (!match) return body;
  const headingText = match[1].trim();
  const insertAt = match.index + match[0].length;
  const imageUrl = buildImageUrl(headingText, 900, 550);
  const imageMd = `\n\n![${headingText}](${imageUrl})\n`;
  return body.slice(0, insertAt) + imageMd + body.slice(insertAt);
}

// ---------------------------------------------------------------- related video (YouTube Data API, free, own key)
async function findRelatedVideo(topic) {
  if (!YOUTUBE_API_KEY) return null;
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(topic)}&key=${YOUTUBE_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.log(`   (Skipping video — YouTube API returned ${res.status})`);
      return null;
    }
    const data = await res.json();
    const item = data.items?.[0];
    if (!item?.id?.videoId) return null;
    return { videoId: item.id.videoId, title: item.snippet.title };
  } catch (err) {
    console.log(`   (Skipping video — ${err.message})`);
    return null;
  }
}

// ---------------------------------------------------------------- Gemini call
async function generateArticle(topicEntry) {
  const prompt = `Write an article for a plain-spoken, no-jargon personal finance and career website.

Topic: "${topicEntry.topic}"
Category: ${topicEntry.category}

Requirements:
- Practical and specific -- real numbers, real scripts, real steps where relevant. No vague encouragement.
- 900 to 1400 words in the body.
- Use Markdown. Structure the body into 4 to 6 sections, each starting with "## " followed by a short, specific heading (not "Introduction" or "Conclusion").
- Use **bold** for key terms and at least one bulleted list where it genuinely helps.
- Do not invent fake statistics, studies, or quotes. General, well-established knowledge is fine; specific numbers that could be wrong (current interest rates, current prices) should be described qualitatively instead ("rates have been rising" rather than a specific invented percentage).
- Write a one-sentence "dek" (subtitle/summary) capturing the practical hook of the piece.
- Write a clear, specific title (not clickbait, not generic).

Respond in EXACTLY this format and nothing else -- no preamble, no closing remarks, no markdown code fences around the whole thing:

TITLE: <the title, one line>
DEK: <the one-sentence dek, one line>
===BODY===
<the full markdown body, starting directly with the first ## heading>`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts?.map((p) => p.text).join("");

  if (!text) {
    const reason = candidate?.finishReason ? ` (finishReason: ${candidate.finishReason})` : "";
    throw new Error(`No text content in Gemini response${reason}.`);
  }

  return parseModelReply(text);
}

// ---------------------------------------------------------------- backend calls
async function login() {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!res.ok) throw new Error(`Login failed (${res.status}): ${await res.text()}`);
  const data = await res.json();
  return data.token;
}

async function getRelatedSlugs(category) {
  try {
    const res = await fetch(`${API_URL}/articles?category=${category}`);
    if (!res.ok) return [];
    const articles = await res.json();
    return articles.slice(0, 2).map((a) => a.slug);
  } catch {
    return [];
  }
}

async function createDraft(token, payload) {
  const res = await fetch(`${API_URL}/articles`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Create article failed (${res.status}): ${await res.text()}`);
  return res.json();
}

// ---------------------------------------------------------------- main
async function main() {
  const topicEntry = getNextTopic();
  console.log(`📝 Topic: "${topicEntry.topic}" (${topicEntry.category})`);

  console.log("🤖 Asking Gemini to write the article...");
  const generated = await generateArticle(topicEntry);

  // Extract the TOC from the model's own headings before we add our own
  // extra sections below, so it never mismatches.
  const toc = extractToc(generated.body);

  console.log("🖼️  Building cover + in-body images (Pollinations.ai)...");
  const coverImage = buildImageUrl(topicEntry.topic, 1200, 800);
  let body = insertInlineImage(generated.body);

  console.log("🎬 Looking for a related video...");
  const video = await findRelatedVideo(topicEntry.topic);
  if (video) {
    body += `\n\n## Related video\n\n<div class="lr-embed-wrapper"><iframe src="https://www.youtube.com/embed/${video.videoId}" allowfullscreen title="${video.title.replace(/"/g, "'")}"></iframe></div>\n`;
    toc.push("Related video");
    console.log(`   Found: "${video.title}"`);
  } else if (!YOUTUBE_API_KEY) {
    console.log("   (No YOUTUBE_API_KEY set — skipping. See README to add one, it's free.)");
  }

  const sourceList = sources[topicEntry.category] || [];
  if (sourceList.length > 0) {
    body += `\n\n## Sources & further reading\n\n${sourceList.map((s) => `- [${s.name}](${s.url})`).join("\n")}\n`;
    toc.push("Sources & further reading");
  }

  const readTime = estimateReadTime(body);
  const dateSuffix = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const slug = `${slugify(generated.title)}-${dateSuffix}`;

  console.log("🔗 Finding related articles in the same category...");
  const related = await getRelatedSlugs(topicEntry.category);

  console.log("🔑 Logging in as admin...");
  const token = await login();

  console.log("💾 Saving as a draft...");
  const payload = {
    title: generated.title,
    slug,
    category: topicEntry.category,
    dek: generated.dek,
    readTime,
    date: new Date().toISOString().slice(0, 10),
    toc,
    related,
    body,
    coverImage,
    status: "draft",
  };

  const created = await createDraft(token, payload);
  console.log(`\n✅ Draft created: "${created.title}"`);
  console.log(`   Review and publish it from Admin → Articles.\n`);
}

main().catch((err) => {
  console.error("\n❌ Automation run failed:", err.message);
  process.exit(1);
});
