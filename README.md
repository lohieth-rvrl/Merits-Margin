# Merit & Margin — React + MongoDB app

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
   Add a database name at the end, e.g. `.../meritandmargin?retryWrites=true...`

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

## Security hardening
Already active, no setup needed:
- **Helmet** sets standard security headers on every response.
- **Rate limiting** on `/api/auth/login` — max 10 attempts per 15 minutes per IP.
- **Input validation** (`express-validator`) on login, articles, and jobs — rejects malformed data with a clear error instead of relying on scattered manual checks.

One thing to actually set before deploying:
- **`FRONTEND_URL`** in `backend/.env` — your real deployed frontend URL (e.g. `https://yourdomain.com`). Without it, the API accepts requests from any origin, with a console warning reminding you. Set this before going live.

## SEO
- Every public page now sets its own `<title>` and meta description (via `react-helmet-async`), and article pages include real Open Graph tags with the cover image — link previews on social/Slack/etc. now show the actual article, not a generic site card.
- `robots.txt` and `ads.txt` are in `frontend/public/` — update `ads.txt` with your real AdSense publisher ID once approved.
- **The sitemap is dynamic** (built live from your database) since content changes constantly — it's served by the *backend* at `/sitemap.xml`, not the frontend. Because your frontend and backend are hosted separately, `frontend/public/_redirects` proxies `yourdomain.com/sitemap.xml` through to your backend automatically (Cloudflare Pages supports this natively) — just update the backend URL inside that file to match your real deployment, and update `robots.txt`'s sitemap line and `FRONTEND_URL` in the backend to your real domain too.

## Newsletter (now actually works)
Wired to Buttondown's free tier:
1. Create a free account at https://buttondown.com
2. Set `VITE_BUTTONDOWN_USERNAME` in `frontend/.env` to your username
3. Done — the signup form on the homepage now creates real subscribers

Until you set this, the newsletter section shows a plain setup notice instead of pretending to work.

## Cookie consent + AdSense
A banner appears on first visit (bottom of the screen) with "Accept" or
"Necessary only." Google's AdSense script is **only ever loaded after a
visitor explicitly accepts** — never before, regardless of whether you've
set `VITE_ADSENSE_CLIENT_ID`.

Once you're AdSense-approved:
1. Set `VITE_ADSENSE_CLIENT_ID` in `frontend/.env` (looks like `ca-pub-XXXXXXXXXXXXXXXX`)
2. For each ad placement, once you've created real ad units in your AdSense
   dashboard, pass their slot ID into that `<AdSlot>` component, e.g.
   `<AdSlot slotId="1234567890" />`. Without a `slotId`, `AdSlot` keeps
   showing the dashed placeholder even if consent is accepted — it never
   fabricates a fake ad unit.

## Scheduled publishing
Articles now have three states: draft, scheduled, and published. In the
editor's Publish flow, set an optional "Schedule for later" date/time — the
button changes from "Publish now" to "Schedule for [date]". A scheduled
article automatically becomes publicly visible the moment its scheduled
time passes — no separate cron job needed, this is checked live on each
request.

## Get notified when the daily automation creates a draft
Optional, and either or both work independently:
- **Slack**: in your Slack workspace, create a free Incoming Webhook
  (Slack → Apps → search "Incoming Webhooks" → Add to Slack → choose a
  channel), copy the webhook URL into `backend/.env` as `SLACK_WEBHOOK_URL`.
- **Email (via Gmail)**: turn on 2-Step Verification on your Google account
  (free), then generate an "App Password" at
  https://myaccount.google.com/apppasswords. Set `EMAIL_FROM` (your Gmail
  address), `EMAIL_APP_PASSWORD` (the generated app password), and `EMAIL_TO`
  (where to send the notification — can be the same address) in
  `backend/.env`.

If neither is set, the automation just skips this step silently.

## Site-wide search
A search box in the navbar searches across all published articles and job
listings at once (title, summary, company, role), unlike the per-category
filter bars which only search within one section. Results land on `/search`.

## Daily article automation (optional)
A script that rotates evenly through Finance → Career → News (for balanced
content), asks Gemini fresh each run to suggest a specific topic within
that category (no static topic list — genuinely new each time, while
avoiding recently-covered topics), then writes a full article for it, adds
a cover image, an in-body image, an optional related video, and a sources
section — then saves it as a **draft**. It never goes live until you
review and publish it yourself from Admin → Articles.

**Cost:** Gemini and Pexels (the image source) are both genuinely free with
no card. The video step uses the free YouTube Data API, which needs its own
separate key (still free, still no card, see below) — without it, articles
are generated normally, just without the video section. (Note: an earlier
version of this used Pollinations.ai for images, which changed its business
model to a paid credit system after this was originally built — a good
reminder that "free" API status can shift over time. Pexels has been a
stable, established, unacquired free stock photo service for over a decade.)

### What gets added automatically
- **A fresh topic every run** — the category (Finance/Career/News) rotates
  in a fixed, predictable cycle so the site stays balanced, but the
  specific topic within that category is generated by Gemini on the spot
  each time, avoiding the last 20 topics already covered (tracked in
  `backend/scripts/state.json`).
- **Cover image + one in-body image** — real stock photography via the
  Pexels API, matched to the topic and the article's first section heading.
  Nothing is downloaded or stored — these are stable Pexels CDN URLs.
  Without a `PEXELS_API_KEY`, this step is skipped entirely and the site's
  own generated category illustration shows instead — never broken, never
  a fake placeholder pretending to be a real photo.
- **A related video** (optional) — one YouTube search result embedded near
  the end of the article, only if `YOUTUBE_API_KEY` is set.
- **A "Sources & further reading" section** — Gemini suggests 2-3 real,
  well-known organizations relevant to the topic each run, for source
  variety. **Important trade-off to know:** unlike everything else in this
  pipeline, this one carries a real risk of hallucination — an AI model can
  suggest a source that sounds plausible but doesn't actually exist. The
  prompt pushes toward well-known homepages rather than specific article
  URLs (a homepage can't go dead the way a specific article link can), and
  if the call fails entirely, it automatically falls back to a small fixed,
  hand-verified list (`backend/scripts/sources.js`) so the section is never
  empty — but neither of these fully eliminates the risk. Worth spot-checking
  the sources on drafts before publishing, more so than any other part of
  this pipeline.

### One-time setup
1. Get a free Gemini key at https://aistudio.google.com/app/apikey and add
   it to `backend/.env` as `GEMINI_API_KEY`.
2. Make sure `API_URL`, `SEED_ADMIN_EMAIL`, and `SEED_ADMIN_PASSWORD` are
   also set in `backend/.env` (same admin login created by `seed.js`).
3. **Optional** — for real cover/in-body photos, get a free Pexels key:
   - Sign up at https://www.pexels.com/api/ (just an email, no card)
   - Copy your API key into `backend/.env` as `PEXELS_API_KEY`
4. **Optional** — for related videos, get a free YouTube key:
   - Go to https://console.cloud.google.com, create a project (or use an
     existing one)
   - In "APIs & Services" → Library, enable **YouTube Data API v3**
   - In "Credentials", click Create Credentials → API key
   - Add it to `backend/.env` as `YOUTUBE_API_KEY`
   - Free quota is 10,000 units/day; one search costs 100, so this comfortably
     covers one article a day
5. Test it manually first, with your backend already running:
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
Add a line to run it once a day at 4:00 PM (adjust the path to match where
you unzipped this project):
```
0 16 * * * cd /full/path/to/backend && /usr/bin/node scripts/generate-daily-article.js >> automation.log 2>&1
```
Your backend (`npm start`, or your deployed Render service) needs to
actually be running at that time for this to work, since the script calls
your own API.

### Scheduling it on Windows
Use Task Scheduler → Create Basic Task → set a daily trigger at 4:00 PM →
Action: "Start a program" → Program: `node`, Arguments:
`scripts/generate-daily-article.js`, "Start in": your `backend` folder.

### Keeping Render's free tier awake (optional, but fixes slow first loads)
Render's free tier puts your backend to sleep after 15 minutes of no
traffic, so the first request after a while can take 30-60+ seconds — this
is what causes the site to feel slow to load sometimes. A free external
ping service fixes this by keeping it awake:
1. Sign up free at https://cron-job.org or https://uptimerobot.com
2. Create a job that pings `https://yourapp.onrender.com/api/health` every
   10 minutes
3. That's it — as long as something pings it more often than the 15-minute
   sleep window, it never goes idle

This is optional (the app still works without it, just with an occasional
slow first load), and free either way.

### Notes
- The category cycle position and recent-topics history are stored in
  `backend/scripts/state.json` (created automatically, not committed to
  git), so each run picks the next category in order and avoids repeating
  a topic from the last 20 runs.
- Cover and in-body images point to stable Pexels CDN URLs rather than
  files stored in MongoDB — if Pexels ever has downtime, images on
  older drafts/articles could temporarily fail to load. Nothing else on
  the site depends on it.
- `backend/scripts/sources.js` still exists as the fallback list used only
  if dynamic source generation fails for a given run — you can still edit
  it, it's just not the primary source anymore.
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
