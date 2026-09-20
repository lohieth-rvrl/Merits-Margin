# Ledger & Route — React + MongoDB app

A full app: React (Vite) frontend styled with Bootstrap, an Express API
backend, and MongoDB storing your articles. The admin dashboard is a real
login-protected part of the app — articles you publish there are saved to
MongoDB and immediately visible to every visitor.

I built and tested this as far as I could without a live database: the
backend starts cleanly, fails gracefully with clear errors when no database
is connected, and every route is wired correctly. The frontend builds with
zero errors and serves correctly. I could not run a real MongoDB connection
in my environment, so **the very first thing to do is connect a real
database and test the full login → publish → view flow yourself.**

## Project layout
```
backend/    Express API + MongoDB models
frontend/   React (Vite) app, including the /admin dashboard
```

## Part 1 — Create a free MongoDB Atlas database
1. Go to https://www.mongodb.com/cloud/atlas/register and sign up (free).
2. Create a free **M0** cluster (no credit card required for M0).
3. Under **Database Access**, create a database user with a username/password.
4. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) —
   fine for a small personal project; tighten later if you want.
5. Click **Connect → Drivers**, copy the connection string. It looks like:
   `mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/`
   Add a database name at the end, e.g. `.../ledgerandroute?retryWrites=true...`

## Part 2 — Configure and seed the backend
1. `cd backend`
2. `cp .env.example .env` and fill in:
   - `MONGODB_URI` — the connection string from Part 1
   - `JWT_SECRET` — any long random string
   - `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` — your admin login
3. `npm install`
4. `node seed.js` — this creates your admin account and loads the 9 starter
   articles into MongoDB. Run this once.
5. `npm start` (or `node server.js`) — starts the API on port 5000 by default.
6. Visit `http://localhost:5000/api/health` — you should see
   `{"status":"ok","dbConnected":true}`. If `dbConnected` is `false`, double
   check your `MONGODB_URI` and Atlas network access setting.

## Part 3 — Run the frontend locally
1. `cd frontend`
2. `cp .env.example .env` (default already points at `http://localhost:5050/api`
   — update the port to match your backend if you changed it)
3. `npm install`
4. `npm run dev` — opens the site at `http://localhost:5173`
5. Go to `http://localhost:5173/admin/login` and sign in with the admin
   email/password you set in Part 2. You should land on the dashboard and
   see your 9 seeded articles.

**Test this fully before deploying anywhere** — log in, edit an article,
create a new one, delete one, and confirm the public pages update.

## Part 4 — Deploy the backend (Render, free tier)
1. Push this project to a GitHub repo.
2. Go to https://render.com → New → Web Service → connect your repo.
3. Root directory: `backend`
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add the same environment variables from your `.env` file under
   Render's **Environment** tab.
7. Deploy. Note the URL Render gives you (e.g. `https://yourapp.onrender.com`).

Free tier note: Render's free web services sleep after inactivity and take
a few seconds to wake up on the next request — normal for free hosting, not
a bug.

## Part 5 — Deploy the frontend (Cloudflare Pages, Vercel, or similar)
1. In `frontend/.env`, set `VITE_API_URL` to your deployed backend URL plus
   `/api`, e.g. `https://yourapp.onrender.com/api`.
2. Push to GitHub (if not already).
3. On Cloudflare Pages (or Vercel): connect the repo, set root directory to
   `frontend`, build command `npm run build`, output directory `dist`.
4. Deploy. Because this is a single-page app, make sure your host redirects
   all unknown paths to `index.html` (Cloudflare Pages and Vercel both do
   this automatically for Vite projects by default).

## The Careers page is a job board, not articles
The `/career` page now shows real job listings instead of articles — each
listing links directly to the hiring company's own careers page, never a
third-party job board. Manage listings from **Admin → Jobs** (a separate tab
from Articles). The seed script adds two listings for `Example Co`, both
saved as **drafts** and clearly labeled `[DEMO LISTING]` — replace or delete
them with real postings (and each posting's own real application link)
before treating this as live. The 3 original career-advice articles (resume
tips, salary negotiation, remote jobs) still exist and are viewable by their
direct article link, they're just no longer listed on the Careers hub page.

## Daily article automation (optional)
A script that picks the next topic from a rotating evergreen list
(`backend/scripts/topics.js`), asks Google's free Gemini API to write a full
article for it, adds a cover image, an in-body image, an optional related
video, and a sources section — then saves it as a **draft**. It never goes
live until you review and publish it yourself from Admin → Articles.

**Cost:** Gemini and Pollinations.ai (the image source) are both genuinely
free with no card. The video step uses the free YouTube Data API, which
needs its own separate key (still free, still no card, see below) — without
it, articles are generated normally, just without the video section.

### What gets added automatically
- **Cover image + one in-body image** — built via Pollinations.ai, a free,
  key-free AI image API. These are just image URLs pointing at Pollinations'
  service (nothing is downloaded or stored), styled as a flat, warm-toned
  editorial illustration matching the site's look.
- **A related video** (optional) — one YouTube search result embedded near
  the end of the article, only if `YOUTUBE_API_KEY` is set.
- **A "Sources & further reading" section** — always added, linking to a
  fixed, hand-picked list of real, stable, authoritative sites per category
  (`backend/scripts/sources.js`). These links are never generated by the
  model, specifically so this section can never cite a fabricated or dead
  link — only general further-reading resources, not a claim about where a
  specific fact came from.

### One-time setup
1. Get a free Gemini key at https://aistudio.google.com/app/apikey and add
   it to `backend/.env` as `GEMINI_API_KEY`.
2. Make sure `API_URL`, `SEED_ADMIN_EMAIL`, and `SEED_ADMIN_PASSWORD` are
   also set in `backend/.env` (same admin login created by `seed.js`).
3. **Optional** — for related videos, get a free YouTube key:
   - Go to https://console.cloud.google.com, create a project (or use an
     existing one)
   - In "APIs & Services" → Library, enable **YouTube Data API v3**
   - In "Credentials", click Create Credentials → API key
   - Add it to `backend/.env` as `YOUTUBE_API_KEY`
   - Free quota is 10,000 units/day; one search costs 100, so this comfortably
     covers one article a day
4. Test it manually first, with your backend already running:
   ```
   cd backend
   npm run generate:article
   ```
   Check Admin → Articles for a new draft. Read it before scheduling
   anything — AI-written drafts should always get a human pass for accuracy
   and tone before publishing.

### Scheduling it on your own machine (macOS/Linux)
Edit your crontab:
```
crontab -e
```
Add a line to run it once a day at 7 AM (adjust the path to match where you
unzipped this project):
```
0 7 * * * cd /full/path/to/backend && /usr/bin/node scripts/generate-daily-article.js >> automation.log 2>&1
```
Your backend (`npm start`) needs to actually be running at that time for
this to work, since the script calls your own API.

### Scheduling it on Windows
Use Task Scheduler → Create Basic Task → set a daily trigger → Action:
"Start a program" → Program: `node`, Arguments:
`scripts/generate-daily-article.js`, "Start in": your `backend` folder.

### Notes
- The rotation position is stored in `backend/scripts/state.json` (created
  automatically, not committed to git) so each run picks the next topic
  rather than repeating one.
- Cover and in-body images point to Pollinations.ai URLs rather than files
  stored in MongoDB — if Pollinations ever has downtime, images on older
  drafts/articles could temporarily fail to load. Nothing else on the site
  depends on it.
- Add, remove, or reorder topics anytime in `backend/scripts/topics.js`.
- Google's free-tier model names occasionally change. If `generate:article`
  ever fails with a "model not found" error, check
  https://aistudio.google.com for the current free model name and update
  `GEMINI_MODEL` in `.env`.

## Before applying for AdSense
- Replace the placeholder Privacy Policy text (`frontend/src/pages/Privacy.jsx`)
  with one generated for your setup (AdSense gives you a free generator once
  you have an account).
- Replace the Formspree form ID in `frontend/src/pages/Contact.jsx`.
- Once approved, add your AdSense script tag to `frontend/index.html` and
  replace the `<AdSlot>` placeholders throughout the pages with your real
  `<ins class="adsbygoogle">` ad units.

## A note on SEO
This is a client-rendered React app, which is generally harder for search
engines to rank as well as static HTML. If organic search traffic is central
to your AdSense income, this is worth knowing going in — it doesn't block
ranking entirely, but it works against it compared to the plain
HTML/Eleventy version built earlier in this project.
