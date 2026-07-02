# Menliman Joyfal Gulo — Portfolio

Personal website for **Menliman Joyfal Gulo** — Geographic Information Science undergraduate
at Universitas Gadjah Mada. GIS · Remote Sensing (LiDAR/radar) · Cartography · Geo-AI.

A single, self-contained static site (no build step) with an interactive field map, a full
experience timeline, a hidden admin editor, and an optional Google Sheets CMS.

## Highlights
- **Zero-backend by default** — content lives in `assets/config.js`; works offline.
- **Interactive map** — project sites are a real MapLibre GeoJSON layer (accurate WGS84 pins).
- **Hidden admin** — click the `MJG_OS` logo 5× (or `Ctrl+Shift+A`, or `#admin`) → password →
  edit every field, reorder lists, export JSON.
- **Optional Google Sheets database** — spreadsheet becomes the live source (see `SETUP.md`).

## Quick start
```bash
python -m http.server 8123      # then open http://localhost:8123
```

## Deploy
GitHub Pages or Netlify (drag & drop). Full instructions, admin usage, password change, and
the Google Sheets column schema are in **[SETUP.md](SETUP.md)**.

## Admin
Default password: `mjg-admin-2026` — **change it** before going public (see SETUP.md §3).

---
Content sourced from the owner's LinkedIn profile. Basemap © CARTO, © OpenStreetMap contributors.
The original Claude design file (`Portfolio.dc.html`, `support.js`) is kept for reference but is
not used by the deployed site — `index.html` is the live site.
