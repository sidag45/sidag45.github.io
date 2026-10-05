# Pagelift website

A static site with no build step and no dependencies. Upload this folder as it is to any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages, or your own server).

## Files
- `index.html`: the page
- `privacy.html`: the privacy policy (linked in the footer; needed for the Chrome Web Store listing)
- `styles.css`: all styles, with light and dark themes that follow the visitor's system setting
- `script.js`: shows a confirmation when someone downloads, and copies the email address when clicked
- `assets/pagelift.zip`: the Chrome extension and Figma plugin that the Download buttons serve
- `assets/logo.svg`, `favicon-32.png`, `apple-touch-icon.png`, `icon-512.png`: the logo and icons
- `assets/social-card.png`: the 1200×630 image shown when the link is shared
- `sitemap.xml`: tells search engines which page to index

## Updating
- When you release a new version of Pagelift, replace `assets/pagelift.zip`, update the "44 KB" size in the hero and `softwareVersion` in the JSON-LD, and change `lastmod` in `sitemap.xml` and "Last updated" in the footer.
- The comparison table was checked against each tool's public docs on 5 October 2026. Re-check it before major announcements.

## Search setup (already in the files)
- Search-friendly title and description, canonical URL, Open Graph and Twitter tags, and `assets/social-card.png` for link previews.
- JSON-LD structured data describing Pagelift as a free SoftwareApplication made by Enclave Studios.
- `sitemap.xml`. Submit it in Google Search Console and Bing Webmaster Tools.
- If you move to a custom domain, replace every `https://sidag45.github.io/pagelift/` in `index.html` and `sitemap.xml`.

## Preview locally
Run `python3 -m http.server` in this folder and open http://localhost:8000.
