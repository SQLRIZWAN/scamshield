# 🛡️ ScamShield — Scam Report Builder

**Built by [© @sql.ssl](https://instagram.com/sql.ssl)** · Scam awareness & reporting tool for Pakistan.

Turn a scam encounter into a clean, professional complaint report in seconds.
ScamShield uses Google Gemini to write the report, exports it as TXT/PDF, and
puts the official reporting channels one click away.

## ✨ Features

- **AI-written report** — Gemini writes a formal, ready-to-file English report + Urdu summary.
- **Offline fallback** — if the AI is unreachable, a built-in template still produces a full report.
- **One-click export** — copy, download `.txt`, or print/save as PDF.
- **Official channels** — NCCIA (1799), PTA (0800-55055), bank fraud desk, platform report tool; your report is auto-copied to the clipboard.
- **Red-flag checklist** — feeding the report with what the victim observed.
- **`© @sql.ssl` watermark** on every generated report.
- Clean, responsive, dark cyber UI. No sign-up, no backend.

## 🚀 Run locally

Just open `index.html` in a browser. No build step.

## 🌐 Deploy

Hosted on **GitHub Pages** — push to the repo and it goes live.

## 🔑 API key

The Gemini API key is embedded in `app.js` for zero-setup use. Anyone can override it
in their own browser without touching the file:

```js
localStorage.setItem('ss_gemini_key', 'YOUR_KEY')
```

> Recommended: restrict the key in Google Cloud Console (HTTP referrer + API restrictions)
> so it only works from this site's domain.

## ⚖️ What this is / isn't

- ✅ A **report builder** — it helps a victim document a scam and find the right authority.
- ❌ It does **not** scrape or aggregate anyone's personal data.
- ❌ It does **not** auto-submit or mass-report accounts. You review and submit yourself.

Awareness & reporting tool. Not legal advice.

---

© @sql.ssl
