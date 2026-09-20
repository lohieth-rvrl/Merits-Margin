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
