/* ============================================================
   app.js — runtime: data loading, rendering, map, clock, theme
   ============================================================ */
(function () {
  'use strict';

  var CFG = window.MJG_CONFIG;
  var LS_KEY = 'mjg_portfolio_data_v1';
  var CACHE_KEY = 'mjg_sheets_cache_v1';
  var CACHE_TTL = 5 * 60 * 1000;

  var MJG = window.MJG = {
    cfg: CFG,
    data: null,
    source: 'default',
    active: -1,
    map: null,
    _popup: null,
    _cache: null,
    _cacheTimestamp: 0,
    _isRefreshing: false
  };

  /* ---------- utils ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function el(id) { return document.getElementById(id); }
  function deepClone(o) { return JSON.parse(JSON.stringify(o)); }

  // SHA-256 -> hex (used by admin login). Exposed so you can generate a hash.
  MJG.hash = async function (str) {
    if (!(window.crypto && crypto.subtle)) return null;
    var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(function (b) {
      return b.toString(16).padStart(2, '0');
    }).join('');
  };

  function coordLabel(lng, lat) {
    return Math.abs(lat).toFixed(2) + '°' + (lat < 0 ? 'S' : 'N') + ', ' +
           Math.abs(lng).toFixed(2) + '°' + (lng < 0 ? 'W' : 'E');
  }

  /* ---------- cache helpers ---------- */
  function readCache() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed.data && parsed.timestamp) {
          MJG._cache = parsed.data;
          MJG._cacheTimestamp = parsed.timestamp;
          return true;
        }
      }
    } catch (e) { /* ignore */ }
    return false;
  }

  function writeCache(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: data,
        timestamp: Date.now()
      }));
    } catch (e) { console.warn('[MJG] Cache write failed', e); }
  }

  function isCacheFresh() {
    return MJG._cache && (Date.now() - MJG._cacheTimestamp) < CACHE_TTL;
  }

  function getCacheAge() {
    if (!MJG._cacheTimestamp) return null;
    return Date.now() - MJG._cacheTimestamp;
  }

  /* ---------- data loading: Cache -> Sheets -> localStorage -> default ---------- */
  MJG.loadData = async function () {
    // 0) Read cache first (sync, instant)
    var hasCache = readCache();

    // 1) If cache is fresh, use it immediately and refresh in background
    if (hasCache && isCacheFresh()) {
      MJG.data = mergeDefaults(MJG._cache);
      MJG.source = 'google-sheets (cached)';
      MJG._refreshInBackground();
      return;
    }

    // 2) If cache exists but stale, use it immediately AND fetch fresh
    if (hasCache) {
      MJG.data = mergeDefaults(MJG._cache);
      MJG.source = 'google-sheets (stale)';
      MJG._refreshInBackground();
      return;
    }

    // 3) No cache — render INSTANTLY from local edits or built-in data, then
    //    fetch from Sheets in the BACKGROUND. Never block first paint on the
    //    slow Apps Script call (~1–8s: 302 redirect + server-side exec).
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (raw) {
        MJG.data = mergeDefaults(JSON.parse(raw));
        MJG.source = 'local-edits';
        return; // admin's own edits win — don't overwrite with the sheet
      }
    } catch (e) { /* ignore */ }
    MJG.data = deepClone(window.DEFAULT_DATA);
    MJG.source = 'default';
    MJG._refreshInBackground(); // pull the live sheet in, swap in when it arrives
  };

  MJG._fetchFreshData = async function () {
    if (!CFG.sheets || !CFG.sheets.enabled || !CFG.sheets.webAppUrl) return false;

    try {
      // Apps Script 302-redirects to a unique googleusercontent URL per request,
      // so HTTP caching never applies anyway. Cache-bust to guarantee freshness;
      // speed comes from the localStorage stale-while-revalidate layer, not HTTP.
      var url = CFG.sheets.webAppUrl + (CFG.sheets.webAppUrl.indexOf('?') >= 0 ? '&' : '?') + 'action=get&_=' + Date.now();
      var res = await fetch(url, { method: 'GET', cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      var json = await res.json();
      if (json && json.ok && json.data) {
        MJG.data = mergeDefaults(json.data);
        MJG.source = 'google-sheets';
        writeCache(json.data);
        MJG._cache = json.data;
        MJG._cacheTimestamp = Date.now();
        return true;
      }
    } catch (e) {
      console.warn('[MJG] Sheets fetch failed.', e);
    }
    return false;
  };

  MJG._refreshInBackground = function () {
    if (MJG._isRefreshing) return;
    MJG._isRefreshing = true;
    // Small delay to not block initial render
    setTimeout(async function () {
      var success = await MJG._fetchFreshData();
      if (success && MJG.data) {
        // Re-render with fresh data
        MJG.renderAll();
        MJG.source = 'google-sheets';
        updateSourceBadge();
      }
      MJG._isRefreshing = false;
    }, 100);
  };

  MJG.forceRefresh = async function () {
    MJG._isRefreshing = true;
    var success = await MJG._fetchFreshData();
    if (success) {
      MJG.renderAll();
      MJG.source = 'google-sheets';
      updateSourceBadge();
    }
    MJG._isRefreshing = false;
    return success;
  };

  function updateSourceBadge() {
    var badge = document.getElementById('src-badge');
    if (!badge) return;
    var labels = {
      'google-sheets': 'Google Sheets',
      'google-sheets (cached)': 'Google Sheets (cached)',
      'google-sheets (stale)': 'Google Sheets (updating…)',
      'local-edits': 'local edits',
      'default': 'built-in data'
    };
    var age = getCacheAge();
    var ageStr = age ? ' · ' + (age < 60000 ? 'just now' : age < 3600000 ? Math.round(age/60000) + 'm ago' : Math.round(age/3600000) + 'h ago') : '';
    badge.innerHTML = 'data: <b>' + (labels[MJG.source] || MJG.source) + '</b>' + ageStr;
  }

  MJG.saveLocal = function (data) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch (e) { console.warn(e); }
    // Clear sheets cache when local edits are made
    try { localStorage.removeItem(CACHE_KEY); } catch (e) {}
  };
  MJG.clearLocal = function () { try { localStorage.removeItem(LS_KEY); } catch (e) {} };

  // Ensure every top-level key exists even if a partial object is loaded from
  // the sheet or localStorage. (Restored: the caching refactor had dropped it,
  // which made every Sheets fetch throw ReferenceError and silently fall back.)
  function mergeDefaults(d) {
    var base = deepClone(window.DEFAULT_DATA);
    if (!d || typeof d !== 'object') return base;
    Object.keys(d).forEach(function (k) { base[k] = d[k]; });
    base.profile = Object.assign({}, window.DEFAULT_DATA.profile, d.profile || {});
    return base;
  }

  /* ============================================================
     RENDERERS
     ============================================================ */
  MJG.renderAll = function () {
    var d = MJG.data;
    renderProfile(d);
    renderStats(d);
    renderProjectsList(d);
    renderProducts(d);
    renderDocumenter(d);
    renderExperience(d);
    renderExpertise(d);
    renderEducation(d);
    renderAwards(d);
    renderSkills(d);
    renderFooter(d);
    renderMeta(d);
    applyTheme();
    refreshMapData();
  };

  function renderProfile(d) {
    var p = d.profile;
    el('mjg-year').textContent = new Date().getFullYear();
    el('hero-mount').innerHTML =
      '<div class="ghost">PORTFOLIO</div>' +
      folderCol('left', [['#profile', 'profile'], ['#map', 'works']]) +
      folderCol('right', [['#skills', 'contact'], ['#education', 'resume']]) +
      '<div class="window profile-window">' +
        titlebar('C:\\MJG\\profile.exe', null, '· ▢ ✕') +
        '<div class="profile-body">' +
          '<div class="profile-photo"><div class="frame">' +
            '<img src="' + esc(p.photo) + '" alt="' + esc(p.firstName + ' ' + p.lastName) + '"></div></div>' +
          '<div class="profile-info">' +
            '<div class="greet">' + esc(p.greeting) + '</div>' +
            '<h1>' + esc(p.firstName) + ' <span class="accent">' + esc(p.lastName) + '</span></h1>' +
            '<div class="chip-row">' +
              '<span class="role-chip">' + esc(p.roleChip) + '</span>' +
              (p.availability ? '<span class="avail-chip"><span class="avail-dot"></span>' + esc(p.availability) + '</span>' : '') +
            '</div>' +
            '<p class="summary">' + esc(p.summary) + '</p>' +
            '<div class="contact-row">' +
              '<a class="pill link" href="mailto:' + esc(p.email) + '"><span class="sq"></span>email</a>' +
              (p.whatsapp ? '<a class="pill link" href="' + esc(p.whatsapp) + '" target="_blank" rel="noopener"><span class="sq"></span>whatsapp</a>' : '') +
              '<a class="pill link" href="' + esc(p.linkedin) + '" target="_blank" rel="noopener"><span class="sq"></span>linkedin</a>' +
              '<span class="pill static"><span class="sq"></span>' + esc(p.location) + '</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        statsRow(d) +
      '</div>';
    // taskbar coord + headline title
    el('tb-coord').textContent = p.coordLabel;
    document.title = p.firstName + ' ' + p.lastName + ' | GIS, Remote Sensing & Geo-AI';
  }

  function folderCol(side, items) {
    var inner = items.map(function (it) {
      return '<a class="folder" href="' + it[0] + '">' +
        '<div class="icon"><div class="tab"></div><div class="body"></div></div>' +
        '<div class="label">' + esc(it[1]) + '</div></a>';
    }).join('');
    return '<div class="folder-col ' + side + '">' + inner + '</div>';
  }

  function statsRow(d) {
    return '<div class="stats">' + (d.stats || []).map(function (s) {
      return '<div class="stat"><div class="num">' + esc(s.num) + '</div><div class="lbl">' + esc(s.lbl) + '</div></div>';
    }).join('') + '</div>';
  }
  function renderStats() { /* rendered inside profile window */ }

  function titlebar(path, rightTag, right) {
    return '<div class="titlebar">' +
      '<span class="lights"><span style="background:var(--accent)"></span>' +
      '<span style="background:var(--gold)"></span><span style="background:var(--olive)"></span></span>' +
      '<span class="path">' + esc(path) + '</span>' +
      (right ? '<span class="right">' + esc(right) + '</span>' : (rightTag ? '<span class="right">' + esc(rightTag) + '</span>' : '')) +
      '</div>';
  }

  function renderProjectsList(d) {
    var list = el('proj-list');
    el('proj-count').textContent = (d.projects || []).length;
    list.innerHTML = (d.projects || []).map(function (p, i) {
      return '<button class="proj-item" data-i="' + i + '">' +
        '<div class="top"><span class="num">' + (i + 1) + '</span>' +
        '<span class="name">' + esc(p.name) + '</span>' +
        '<span class="mode-tag ' + modeClass(modeOfProject(p)) + '">' + esc(modeOfProject(p)) + '</span></div>' +
        '<div class="org">' + esc(p.org) + ' · ' + esc(p.period) + '</div>' +
        '<div class="blurb">' + esc(p.blurb) + '</div>' +
        '<div class="coord">' + coordLabel(p.lng, p.lat) + ' · ' + esc(p.place) + '</div>' +
        '</button>';
    }).join('');
    Array.prototype.forEach.call(list.querySelectorAll('.proj-item'), function (btn) {
      btn.addEventListener('click', function () { MJG.selectProject(+btn.getAttribute('data-i')); });
    });
  }

  function renderProducts(d) {
    var host = el('products-grid');
    if (!host) return;
    host.innerHTML = (d.products || []).map(function (p) {
      var tech = (p.tech || []).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('');
      var link = p.link ? '<a class="prod-link" href="' + esc(p.link) + '" target="_blank" rel="noopener">↗ ' + esc(linkHost(p.link)) + '</a>' : '';
      return '<div class="exp-card prod-card">' +
        '<div class="titlebar simple"><span class="tag" style="background:var(--accent)"></span>' + esc(p.name) +
          (p.status ? '<span class="prod-status">' + esc(p.status) + '</span>' : '') + '</div>' +
        '<div class="body">' +
          '<div class="prod-tagline">' + esc(p.tagline || '') + '</div>' +
          (p.period ? '<div class="prod-period">' + esc(p.period) + '</div>' : '') +
          '<p>' + esc(p.desc || '') + '</p>' +
          '<div class="tags">' + tech + '</div>' +
          (p.impact ? '<div class="prod-impact">' + esc(p.impact) + '</div>' : '') +
          link +
        '</div></div>';
    }).join('');
  }

  function renderExperience(d) {
    var mount = el('exp-mount');
    var exps = d.experience || [];
    var types = ['all'].concat(unique(exps.map(function (e) { return e.type; })));
    var filters = '<div class="exp-filters">' + types.map(function (t, i) {
      return '<button class="exp-filter' + (i === 0 ? ' active' : '') + '" data-type="' + esc(t) + '">' +
        (t === 'all' ? 'all' : esc(t)) + '</button>';
    }).join('') + '</div>';
    var timeline = '<div class="timeline"><div class="rail"></div>' + exps.map(function (e) {
      return '<div class="exp" data-type="' + esc(e.type) + '"><span class="node"></span>' +
        '<div class="card"><div class="head">' +
          '<div><div class="role">' + esc(e.role) + '</div>' +
          '<div class="org">' + esc(e.org) + '</div></div>' +
          '<div class="meta">' + esc(e.period) + '<br>' + esc(e.loc || '') +
          '<br><span class="type">' + esc(e.type) + '</span> ' +
          '<span class="mode-tag ' + modeClass(modeOfExp(e)) + '">' + esc(modeOfExp(e)) + '</span></div>' +
        '</div><div class="desc">' + esc(e.desc) +
          (e.link ? ' <a class="exp-link" href="' + esc(e.link) + '" target="_blank" rel="noopener">↗ ' + esc(linkHost(e.link)) + '</a>' : '') +
        '</div></div></div>';
    }).join('') + '</div>';
    mount.innerHTML = filters + timeline;
    Array.prototype.forEach.call(mount.querySelectorAll('.exp-filter'), function (b) {
      b.addEventListener('click', function () {
        mount.querySelectorAll('.exp-filter').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        var t = b.getAttribute('data-type');
        mount.querySelectorAll('.exp').forEach(function (card) {
          card.style.display = (t === 'all' || card.getAttribute('data-type') === t) ? '' : 'none';
        });
      });
    });
  }

  function renderExpertise(d) {
    el('expertise-grid').innerHTML = (d.expertise || []).map(function (e) {
      return '<div class="exp-card">' +
        '<div class="titlebar simple"><span class="tag" style="background:var(--accent)"></span>' + esc(e.code) + '</div>' +
        '<div class="body"><h3>' + esc(e.title) + '</h3><p>' + esc(e.desc) + '</p>' +
        '<div class="tags">' + (e.tags || []).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div>' +
        '</div></div>';
    }).join('');
  }

  function renderEducation(d) {
    el('edu-mount').innerHTML = (d.education || []).map(function (ed) {
      return '<div class="edu-item"><span class="node"></span>' +
        '<div class="period">' + esc(ed.period) + '</div>' +
        '<div class="school">' + esc(ed.school) + '</div>' +
        '<div class="degree">' + esc(ed.degree) + '</div></div>';
    }).join('');
  }

  function renderAwards(d) {
    var html = '<div class="log-label">// awards</div>';
    html += (d.awards || []).map(function (a) {
      return '<div class="log-row"><span class="mk a">◆</span><span>' + esc(a) + '</span></div>';
    }).join('');
    html += '<div class="log-label mt">// selected publications</div>';
    html += (d.pubs || []).map(function (p) {
      return '<div class="log-row"><span class="mk p">›</span><span>' + esc(p) + '</span></div>';
    }).join('');
    if (d.certifications && d.certifications.length) {
      html += '<div class="log-label mt">// certifications</div>';
      html += d.certifications.map(function (c) {
        return '<div class="log-row"><span class="mk p">›</span><span>' + esc(c) + '</span></div>';
      }).join('');
    }
    el('log-mount').innerHTML = html;
  }

  function renderSkills(d) {
    el('hard-mount').innerHTML = (d.hardSkills || []).map(function (h) {
      var pct = (typeof h.pct === 'number') ? h.pct + '%' : String(h.pct);
      return '<div class="skill-row"><div class="top"><span class="name">' + esc(h.name) + '</span>' +
        '<span class="lvl">' + esc(h.lvl) + '</span></div>' +
        '<div class="bar"><div class="fill" style="width:' + esc(pct) + '"></div></div></div>';
    }).join('');
    el('soft-mount').innerHTML = (d.softSkills || []).map(function (s) {
      return '<div class="soft-item"><span class="chk">✓</span>' + esc(s) + '</div>';
    }).join('');
    el('tools-mount').innerHTML = (d.tools || []).map(function (t) {
      return '<span class="tag">' + esc(t) + '</span>';
    }).join('');
    el('lang-mount').innerHTML = (d.languages || []).map(function (l) {
      return '<div class="lang-row"><span class="name">' + esc(l.name) + '</span>' +
        '<span class="lvl">' + esc(l.level) + '</span></div>';
    }).join('');
  }

  function renderFooter(d) {
    var p = d.profile;
    el('footer-mount').innerHTML =
      '<div class="footer-links">' +
        '<a class="primary" href="mailto:' + esc(p.email) + '">' + esc(p.email) + '</a>' +
        '<a class="ghost" href="' + esc(p.linkedin) + '" target="_blank" rel="noopener">' + esc(p.linkedinHandle) + '</a>' +
      '</div>';
    el('footer-name').innerHTML = esc(p.firstName + ' ' + p.lastName) + '<span class="accent">_</span>';
  }

  function renderMeta(d) {
    updateSourceBadge();
  }

  function unique(a) { return a.filter(function (v, i) { return a.indexOf(v) === i; }); }
  function linkHost(u) { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return 'open'; } }

  /* ---------- placement mode (remote / onsite / hybrid / field) ---------- */
  function modeClass(m) { return 'mode-' + String(m || '').toLowerCase().replace(/[^a-z]/g, ''); }
  // Look up the explicit mode from built-in data (survives even when the sheet strips the column).
  function builtinMode(listKey, field, val) {
    var arr = (window.DEFAULT_DATA && window.DEFAULT_DATA[listKey]) || [];
    for (var i = 0; i < arr.length; i++) { if (arr[i][field] === val && arr[i].mode) return arr[i].mode; }
    return null;
  }
  function modeOfProject(p) {
    if (p.mode) return p.mode;
    if (p.loc) return p.loc;   // sheet alias: a "loc" column = remote/onsite
    var b = builtinMode('projects', 'name', p.name); if (b) return b;
    var t = ((p.place || '') + ' ' + (p.org || '') + ' ' + (p.blurb || '')).toLowerCase();
    if (/remote|desk|interpretation|monitoring|analysis/.test(t)) return 'Remote';
    if (/survey|transect|field|snorkel|inspect|tower/.test(t)) return 'Field';
    return 'On-site';
  }
  function modeOfExp(e) {
    if (e.mode) return e.mode;
    var b = builtinMode('experience', 'role', e.role); if (b) return b;
    var l = (e.loc || '').toLowerCase(), r = (e.role || '').toLowerCase();
    if (l.indexOf('remote') >= 0) return 'Remote';
    if (l.indexOf('hybrid') >= 0) return 'Hybrid';
    if (/surveyor|field|ews/.test(r)) return 'Field';
    return 'On-site';
  }

  /* ---------- documenter (vertical auto-scroll field evidence) ---------- */
  function renderDocumenter(d) {
    var host = el('documenter-mount');
    if (!host) return;
    var items = (d.documenter || []).filter(function (x) { return x && x.src; });
    if (!items.length) { host.innerHTML = '<div class="doc-empty">Add field photos via Admin &#9656; Documenter, or a Google Drive image link.</div>'; return; }
    function card(x) {
      return '<figure class="doc-card"><img src="' + esc(x.src) + '" alt="' + esc(x.place || 'field') +
        '" onerror="this.parentNode.style.display=\'none\'">' +
        '<figcaption class="cap"><b>' + esc(x.place || '') + '</b>' + (x.caption ? '<br>' + esc(x.caption) : '') + '</figcaption></figure>';
    }
    var a = items.filter(function (_, i) { return i % 2 === 0; });
    var b = items.filter(function (_, i) { return i % 2 === 1; });
    if (!b.length) b = a;
    function track(list, cls) { var inner = list.map(card).join(''); return '<div class="doc-col"><div class="doc-track' + cls + '">' + inner + inner + '</div></div>'; }
    host.innerHTML = track(a, '') + track(b, ' rev');
  }

  /* ============================================================
     MAP — pins are a REAL MapLibre GeoJSON layer (geo-registered)
     ============================================================ */
  function projectsGeoJSON() {
    return {
      type: 'FeatureCollection',
      features: (MJG.data.projects || []).map(function (p, i) {
        return {
          type: 'Feature',
          id: i,
          geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
          properties: { i: i, num: String(i + 1), name: p.name, org: p.org, period: p.period, place: p.place, blurb: p.blurb }
        };
      })
    };
  }

  MJG.initMap = function () {
    if (!window.maplibregl || MJG.map) return;
    var container = el('mjg-map');
    if (!container) return;
    MJG.map = new maplibregl.Map({
      container: container,
      style: CFG.map.styles[CFG.map.style] || CFG.map.styles.Positron,
      center: [117, -2], zoom: 3.6, attributionControl: false
    });
    MJG.map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    MJG.map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
    // Add layers as soon as the style is ready. 'load' can be deferred when the
    // tab is backgrounded, so also retry on 'styledata' and via a timed fallback.
    MJG.map.on('load', tryLayers);
    MJG.map.on('styledata', tryLayers);
    var tries = 0;
    (function poll() {
      if (MJG.map && MJG.map.getLayer && MJG.map.getLayer('proj-circles')) return;
      tryLayers();
      if (tries++ < 40) setTimeout(poll, 400);
    })();
  };

  function tryLayers() {
    var m = MJG.map;
    if (!m || !m.isStyleLoaded || !m.isStyleLoaded()) return;
    if (m.getSource('projects')) return;
    try { setupLayers(); } catch (e) { /* style not ready yet; poll will retry */ }
  }

  function accent() { return (MJG.data && MJG.data.profile && CFG.theme.accent) || '#E0533B'; }

  function setupLayers() {
    var m = MJG.map;
    if (m.getSource('projects')) return;
    m.addSource('projects', { type: 'geojson', data: projectsGeoJSON() });

    // active highlight ring (drawn under the pins)
    m.addLayer({
      id: 'proj-halo', type: 'circle', source: 'projects',
      paint: {
        'circle-radius': 20, 'circle-color': accent(), 'circle-opacity': 0.18,
        'circle-stroke-color': accent(), 'circle-stroke-width': 1.5, 'circle-stroke-opacity': 0.6
      },
      filter: ['==', ['get', 'i'], -1]
    });
    // shadow
    m.addLayer({
      id: 'proj-shadow', type: 'circle', source: 'projects',
      paint: { 'circle-radius': 11, 'circle-color': 'rgba(33,30,25,0.25)', 'circle-translate': [1.5, 2] }
    });
    // pin base
    m.addLayer({
      id: 'proj-circles', type: 'circle', source: 'projects',
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 3, 9, 8, 13],
        'circle-color': accent(),
        'circle-stroke-color': '#211E19', 'circle-stroke-width': 2
      }
    });
    // number label
    m.addLayer({
      id: 'proj-nums', type: 'symbol', source: 'projects',
      layout: {
        'text-field': ['get', 'num'],
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold', 'Noto Sans Bold'],
        'text-size': 12, 'text-allow-overlap': true, 'text-ignore-placement': true
      },
      paint: { 'text-color': '#ffffff' }
    });

    // interactions
    m.on('click', 'proj-circles', function (e) {
      if (e.features && e.features.length) MJG.selectProject(e.features[0].properties.i * 1);
    });
    m.on('mouseenter', 'proj-circles', function () { m.getCanvas().style.cursor = 'pointer'; });
    m.on('mouseleave', 'proj-circles', function () { m.getCanvas().style.cursor = ''; });

    fitAll();
  }

  function fitAll() {
    if (MJG.map && CFG.map.bounds) MJG.map.fitBounds(CFG.map.bounds, { padding: 46, duration: 0 });
  }

  function refreshMapData() {
    if (MJG.map && MJG.map.getSource('projects')) {
      MJG.map.getSource('projects').setData(projectsGeoJSON());
    }
  }

  MJG.selectProject = function (i) {
    MJG.active = i;
    var p = MJG.data.projects[i];
    if (!p) return;
    // highlight in list
    Array.prototype.forEach.call(document.querySelectorAll('.proj-item'), function (b) {
      b.classList.toggle('active', +b.getAttribute('data-i') === i);
    });
    if (!MJG.map) return;
    if (MJG.map.getLayer('proj-halo')) MJG.map.setFilter('proj-halo', ['==', ['get', 'i'], i]);
    MJG.map.flyTo({ center: [p.lng, p.lat], zoom: 6.4, speed: 1.1 });
    if (MJG._popup) MJG._popup.remove();
    MJG._popup = new maplibregl.Popup({ offset: 16, closeButton: false, maxWidth: '260px' })
      .setLngLat([p.lng, p.lat])
      .setHTML('<div class="mjg-pop"><div class="place">' + esc(p.place) + '</div>' +
        '<div class="t">' + esc(p.name) + '</div>' +
        '<div class="m">' + esc(p.org) + ' · ' + esc(p.period) + '</div></div>')
      .addTo(MJG.map);
    // scroll map into view on mobile
    var mapEl = el('map'); if (mapEl && window.innerWidth < 720) mapEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  MJG.setMapStyle = function (name) {
    if (!MJG.map || !CFG.map.styles[name]) return;
    CFG.map.style = name;
    MJG.map.setStyle(CFG.map.styles[name]);
    MJG.map.once('styledata', function () { setTimeout(setupLayers, 60); });
  };

  MJG.recolorMap = function () {
    if (!MJG.map) return;
    ['proj-circles'].forEach(function (id) { if (MJG.map.getLayer(id)) MJG.map.setPaintProperty(id, 'circle-color', accent()); });
    ['proj-halo'].forEach(function (id) {
      if (MJG.map.getLayer(id)) {
        MJG.map.setPaintProperty(id, 'circle-color', accent());
        MJG.map.setPaintProperty(id, 'circle-stroke-color', accent());
      }
    });
  };

  /* ---------- theme + clock ---------- */
  function applyTheme() {
    document.documentElement.style.setProperty('--accent', CFG.theme.accent || '#E0533B');
    document.body.classList.toggle('no-grid', CFG.theme.showGrid === false);
    MJG.recolorMap();
  }
  MJG.applyTheme = applyTheme;

  function tick() {
    var d = new Date();
    var c = el('tb-clock');
    if (c) c.textContent = String(d.getHours()).padStart(2, '0') + ':' +
      String(d.getMinutes()).padStart(2, '0') + ':' + String(d.getSeconds()).padStart(2, '0');
  }

  /* ---------- auto-refresh (pull live sheet every N seconds) ---------- */
  MJG._autoOn = false;
  MJG._autoTimer = null;
  MJG.setAuto = function (on) {
    MJG._autoOn = on;
    var btn = el('tb-auto');
    if (btn) { btn.classList.toggle('on', on); btn.innerHTML = '<span class="auto-dot"></span>auto: ' + (on ? 'on' : 'off'); }
    if (MJG._autoTimer) { clearInterval(MJG._autoTimer); MJG._autoTimer = null; }
    if (on) {
      var sec = (CFG.autoRefresh && CFG.autoRefresh.seconds) || 5;
      var pull = function () { if (!MJG._isRefreshing && CFG.sheets && CFG.sheets.enabled && CFG.sheets.webAppUrl) MJG.forceRefresh(); };
      pull(); // refresh immediately on enable
      MJG._autoTimer = setInterval(pull, sec * 1000);
    }
  };
  function initAuto() {
    var btn = el('tb-auto');
    if (btn) btn.addEventListener('click', function () { MJG.setAuto(!MJG._autoOn); });
    if (CFG.autoRefresh && CFG.autoRefresh.defaultOn) MJG.setAuto(true);
  }

  function waitMap(tries) {
    tries = tries || 0;
    if (window.maplibregl) { MJG.initMap(); }
    else if (tries < 60) { setTimeout(function () { waitMap(tries + 1); }, 120); }
  }

  /* ---------- boot ---------- */
  MJG.boot = async function () {
    await MJG.loadData();
    MJG.renderAll();
    tick(); setInterval(tick, 1000);
    initAuto();
    waitMap();
    if (window.MJGAdmin) window.MJGAdmin.init();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', MJG.boot);
  else MJG.boot();
})();
