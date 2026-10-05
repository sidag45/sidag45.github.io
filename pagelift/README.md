# Pagelift website

A static site with no build step and no dependencies. Upload this folder as it is to any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages, or your own server).

## Files
- `index.html`: the page
- `styles.css`: all styles, with light and dark themes that follow the visitor's system setting
- `script.js`: shows a confirmation when someone downloads, and copies the email address when clicked
- `assets/pagelift.zip`: the Chrome extension and Figma plugin that the Download buttons serve
- `assets/logo.svg`, `favicon-32.png`, `apple-touch-icon.png`, `icon-512.png`: the logo and icons

## Before going live
1. In `index.html`, change `og:image` to the full URL once you know your domain, e.g. `https://pagelift.example.com/assets/icon-512.png`. Link previews in Slack, iMessage and so on need a full URL.
2. When you release a new version of Pagelift, replace `assets/pagelift.zip` and update the "44 KB" size shown in the hero.
3. The comparison table was checked against each tool's public docs on 5 October 2026. Re-check it before major announcements.

## Preview locally
Run `python3 -m http.server` in this folder and open http://localhost:8000.
