# MJG Portfolio — Setup & Operations Guide

Personal portfolio site for **Menliman Joyfal Gulo**. Pure static site (HTML/CSS/JS) —
no build step, no framework. Deploys to GitHub Pages or Netlify for free.

```
webporto/
├─ index.html                 ← the site (open this)
├─ assets/
│  ├─ styles.css              ← design system
│  ├─ config.js               ← ⚙ settings + DEFAULT content (edit me)
│  ├─ app.js                  ← rendering + map logic
│  └─ admin.js                ← hidden admin editor
├─ uploads/photo-...png       ← profile photo
├─ backend/google-apps-script.gs   ← optional Google Sheets CMS
└─ SETUP.md / README.md
```

---

## 1. Run locally
Any static server works. For example:
```bash
cd webporto
python -m http.server 8123
# open http://localhost:8123
```
> Open with a **server**, not by double-clicking the file — `file://` blocks `fetch`
> and Web Crypto. Local editing still works via the admin panel either way.

---

## 2. Deploy for free

### Option A — GitHub Pages
1. Create a repo (e.g. `webporto`) and push everything in this folder.
2. Repo **Settings ▸ Pages** → *Source*: `Deploy from a branch` → branch `main`, folder `/ (root)`.
3. Your site: `https://<username>.github.io/webporto/`.
   The included `.nojekyll` file stops Jekyll from touching the `assets/` folder.

### Option B — Netlify (drag & drop)
1. Go to app.netlify.com → **Add new site ▸ Deploy manually**.
2. Drag the whole `webporto` folder in. Done — it uses `netlify.toml` (publish root).
   To update later, drag again or connect the GitHub repo for auto-deploys.

Either host serves the site instantly. Content comes from `assets/config.js` unless you
wire up Google Sheets (section 4).

---

## 3. The hidden Admin panel

**How to open it (3 ways):**
- Click the **`MJG_OS`** logo in the top-left taskbar **5 times quickly**, or
- Press **Ctrl + Shift + A**, or
- Add **`#admin`** to the URL (e.g. `.../index.html#admin`).

Then enter the password. **Default password: `mjg-admin-2026`** — change it (below).

**What you can edit:** everything — Profile, Stats, Projects (map pins + coordinates),
Experience, Expertise, Education, Hard skills, Languages, Awards, Publications,
Certifications, Soft skills, Tools. Add / delete / reorder list items inline.

**Buttons:**
| Button | What it does |
|---|---|
| **save & apply** | Saves to *this browser* (localStorage) and re-renders live. |
| **export .json** | Downloads `mjg-portfolio-data.json`. |
| **copy json** | Copies the full data JSON to clipboard. |
| **push to sheets** | Sends data to your Google Sheet (only if configured, section 4). |
| **reset built-in** | Clears local edits, back to `config.js` defaults. |

### Making edits permanent (important)
The site is static, so **`save & apply` only affects the browser you edited in.**
To make a change visible to *everyone*, pick one:
- **Simple:** Admin → *export .json* → paste its contents over `DEFAULT_DATA` in
  `assets/config.js` → commit & redeploy. (Or just edit `config.js` by hand.)
- **Live CMS (no redeploy):** set up Google Sheets (section 4) and use *push to sheets*.
  All visitors then read the latest data automatically.

### Change the admin password
1. Open the site, open the browser **console**, run:
   ```js
   await MJG.hash('your-new-password')
   ```
2. Copy the hash into `assets/config.js` → `admin.passwordHash`.
3. Set `admin.plainFallback: ''` (empty) so only the hashed password works.
4. (Optional) change `admin.triggerClicks` / `#admin` behaviour there too.

> Security note: on a static site the password only gates the *editor UI* in the browser —
> it can't stop a determined person reading the JS. For real protection, keep edits in
> Google Sheets (the Apps Script enforces a server-side `TOKEN`), and rely on the fact that
> your source of truth (the Sheet) is private to your Google account.

---

## 4. Google Sheets as the database (optional)

This makes the Sheet the live source: the website reads it on load, and Admin →
*push to sheets* writes back. Free, uses your Google account.

### 4a. Column schema (the Sheet tabs)
Run `setupSheets` (below) and it creates these tabs with exactly these headers:

| Tab | Columns (header row) | Notes |
|---|---|---|
| **Profile** | `key`, `value` | rows: firstName, lastName, greeting, roleChip, headline, summary, location, coordLabel, email, linkedin, linkedinHandle, photo |
| **Stats** | `num`, `lbl` | e.g. `50+` / `students mentored` |
| **Projects** | `name`, `org`, `period`, `place`, `lng`, `lat`, `blurb` | `lng`,`lat` = decimal WGS84; these place the map pins |
| **Experience** | `role`, `org`, `period`, `loc`, `type`, `desc` | `type` = work \| research \| leadership \| volunteer |
| **Expertise** | `code`, `title`, `desc`, `tags` | `tags` = comma-separated |
| **Education** | `period`, `school`, `degree` | |
| **HardSkills** | `name`, `lvl`, `pct` | `pct` = number 0–100 |
| **Languages** | `name`, `level` | |
| **Awards** | `value` | one per row |
| **Publications** | `value` | one per row |
| **Certifications** | `value` | one per row |
| **SoftSkills** | `value` | one per row |
| **Tools** | `value` | one per row |

### 4b. Deploy the Apps Script
1. Create a new Google Sheet.
2. **Extensions ▸ Apps Script**. Delete the sample, paste `backend/google-apps-script.gs`.
3. Set `var TOKEN = '...'` to a long random secret (keep it private).
4. Run the **`setupSheets`** function once (authorize when prompted). This creates all tabs.
5. **Deploy ▸ New deployment ▸ Web app**:
   - *Execute as:* **Me**
   - *Who has access:* **Anyone**
   - Deploy, copy the **Web app URL** (ends in `/exec`).
6. In `assets/config.js` set:
   ```js
   sheets: {
     enabled: true,
     webAppUrl: 'https://script.google.com/macros/s/AKfy…/exec',
     token: 'the-same-secret-as-TOKEN'
   }
   ```
7. Commit & redeploy the site.

### 4c. Fill the data
Open the site → Admin → **push to sheets**. Your current content lands in the Sheet
with the columns above. From then on, edit either in the Sheet directly or via Admin.

### Notes / troubleshooting
- **Read** (`GET ?action=get`) is a simple request and works cross-origin from Pages/Netlify.
- **Write** uses `Content-Type: text/plain` to avoid a CORS preflight Apps Script can't answer.
  If a browser still blocks reading the response, the write usually *still succeeds*; refresh
  the site to confirm. If in doubt, use **export .json** as a backup.
- Re-deploying the Apps Script may change the `/exec` URL — update `config.js` if so
  (use **Manage deployments ▸ edit ▸ same deployment** to keep the URL stable).
- If Sheets is unreachable, the site automatically falls back to local edits, then to the
  built-in `DEFAULT_DATA`. It never shows a blank page.

---

## 5. Editing the map / coordinates
Each project pin is a real MapLibre GeoJSON feature (so it stays perfectly geo-registered
at every zoom — no drift). Edit a pin in Admin → **Projects**, or in the **Projects** sheet:
set `lng` (longitude, east +) and `lat` (latitude, south −, e.g. Yogyakarta ≈ `-7.77`).
Get coordinates by right-clicking a spot in Google Maps → "copy coordinates" (lat, lng —
remember the site wants lng first in the sheet columns it's separate `lng`/`lat`).
