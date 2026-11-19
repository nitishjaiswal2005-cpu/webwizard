# Technika 6.0 · The Wizard's Grimoire (Web Wizard entry)

Plain HTML/CSS/JS site + two Vercel serverless functions.

- `index.html`, `style.css`, `app.js` – frontend (mobile + laptop responsive)
- `events.json` – all content, taken from the official Technika 6.0 site
- `api/events.js` – GET /api/events (serves the data; frontend falls back to events.json)
- `api/enquiry.js` – POST /api/enquiry (validation + optional Google Sheet via `SHEET_WEBHOOK` env var)

Run locally: `python3 -m http.server 8000` (open http://localhost:8000). API routes work on Vercel (or `npx vercel dev`).
Deploy: push to GitHub, import repo in Vercel, Deploy.
Register/brochure links point to the official ARKA JAIN University Technika links.
