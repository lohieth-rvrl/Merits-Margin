# Ledger & Route — setup guide

This is an Eleventy (11ty) site with a Decap CMS dashboard at `/admin` for
writing new articles without touching any code.

## What's inside
- `src/articles/*.md` — your 9 starter articles (edit or delete these anytime)
- `src/_includes/` — page templates (base layout, article layout, category layout)
- `admin/` — the CMS dashboard and its configuration
- `netlify.toml` — tells Netlify how to build the site

## 1. Push this to GitHub
```
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

## 2. Deploy on Netlify (free)
1. Go to https://app.netlify.com and sign up/log in with your GitHub account.
2. "Add new site" → "Import an existing project" → pick your repo.
3. Build settings should auto-detect from `netlify.toml`:
   - Build command: `npx @11ty/eleventy`
   - Publish directory: `_site`
4. Click Deploy. You'll get a free `yoursite.netlify.app` URL immediately.
5. Once you own a domain, add it under Site settings → Domain management.
   Delete the placeholder `src/CNAME` file if you're not using GitHub Pages —
   it's not needed on Netlify.

## 3. Turn on the CMS login (one-time setup)
Decap CMS needs a login system. Netlify provides this for free:
1. In your Netlify site dashboard: **Site configuration → Identity → Enable Identity**.
2. Under Identity settings, set registration to **Invite only**.
3. Scroll to **Services → Git Gateway → Enable Git Gateway**.
4. Go to **Identity → Invite users**, and invite your own email.
5. Check your email, accept the invite, and set a password.

## 4. Start writing articles
Visit `yoursite.netlify.app/admin` (or `yourdomain.com/admin` once your domain
is connected), log in with the account from step 3, and you'll see a form:
title, category, dek, table of contents, body, etc. Fill it in and click
**Publish** — Netlify rebuilds the live site automatically within about a
minute, no code required.

## 5. Before applying for AdSense
- Replace the placeholder Privacy Policy text (`src/privacy/index.md`) with
  one generated for your setup (AdSense gives you a free generator once
  you have an account).
- Replace the Formspree form ID in `src/contact/index.md` with your own
  (free tier at formspree.io).
- Once approved, replace `pub-0000000000000000` in `src/ads.txt` with your
  real AdSense publisher ID, and drop your ad unit code into the elements
  marked `<!-- AdSense slot -->` across the templates.

## Local preview (optional)
If you have Node.js installed on your own computer:
```
npm install
npm start
```
This runs the site at `http://localhost:8080` and rebuilds live as you edit.
