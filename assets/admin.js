/* ============================================================
   admin.js — hidden admin: secret trigger, login, full editor
   ------------------------------------------------------------
   Open it by: clicking the "MJG_OS" taskbar logo 5x quickly,
   or visiting the site with #admin in the URL.
   Password + trigger are configured in assets/config.js.
   ============================================================ */
(function () {
  'use strict';
  var CFG = window.MJG_CONFIG;

  var A = window.MJGAdmin = { open: false, draft: null };

  /* ---- schema: how each data key is edited ---- */
  var SECTIONS = [
    { key: 'profile', label: 'Profile', kind: 'object', fields: [
      { k: 'firstName', t: 'text' }, { k: 'lastName', t: 'text' }, { k: 'greeting', t: 'text' },
      { k: 'roleChip', t: 'text' }, { k: 'availability', t: 'text' }, { k: 'headline', t: 'text' }, { k: 'summary', t: 'area' },
      { k: 'location', t: 'text' }, { k: 'coordLabel', t: 'text' },
      { k: 'email', t: 'text' }, { k: 'phone', t: 'text' }, { k: 'whatsapp', t: 'text' },
      { k: 'linkedin', t: 'text' }, { k: 'linkedinHandle', t: 'text' },
      { k: 'photo', t: 'text' }
    ]},
    { key: 'stats', label: 'Stats', kind: 'objectList', fields: [{ k: 'num', t: 'text' }, { k: 'lbl', t: 'text' }] },
    { key: 'projects', label: 'Projects (map)', kind: 'objectList', fields: [
      { k: 'name', t: 'text' }, { k: 'org', t: 'text' }, { k: 'period', t: 'text' }, { k: 'place', t: 'text' },
      { k: 'lng', t: 'num' }, { k: 'lat', t: 'num' }, { k: 'blurb', t: 'area' }
    ]},
    { key: 'products', label: 'Products', kind: 'objectList', fields: [
      { k: 'name', t: 'text' }, { k: 'tagline', t: 'text' }, { k: 'status', t: 'text' }, { k: 'impact', t: 'text' },
      { k: 'period', t: 'text' }, { k: 'link', t: 'text' }, { k: 'tech', t: 'lines' }, { k: 'desc', t: 'area' }
    ]},
    { key: 'experience', label: 'Experience', kind: 'objectList', fields: [
      { k: 'role', t: 'text' }, { k: 'org', t: 'text' }, { k: 'period', t: 'text' }, { k: 'loc', t: 'text' },
      { k: 'type', t: 'text' }, { k: 'link', t: 'text' }, { k: 'desc', t: 'area' }
    ]},
    { key: 'expertise', label: 'Expertise', kind: 'objectList', fields: [
      { k: 'code', t: 'text' }, { k: 'title', t: 'text' }, { k: 'desc', t: 'area' }, { k: 'tags', t: 'lines' }
    ]},
    { key: 'education', label: 'Education', kind: 'objectList', fields: [
      { k: 'period', t: 'text' }, { k: 'school', t: 'text' }, { k: 'degree', t: 'text' }
    ]},
    { key: 'hardSkills', label: 'Hard skills', kind: 'objectList', fields: [
      { k: 'name', t: 'text' }, { k: 'lvl', t: 'text' }, { k: 'pct', t: 'num' }
    ]},
    { key: 'languages', label: 'Languages', kind: 'objectList', fields: [{ k: 'name', t: 'text' }, { k: 'level', t: 'text' }] },
    { key: 'awards', label: 'Awards', kind: 'stringList' },
    { key: 'pubs', label: 'Publications', kind: 'stringList' },
    { key: 'certifications', label: 'Certifications', kind: 'stringList' },
    { key: 'softSkills', label: 'Soft skills', kind: 'stringList' },
    { key: 'tools', label: 'Tools', kind: 'stringList' }
  ];

  /* ---- styles (self-contained) ---- */
  function injectStyles() {
    if (document.getElementById('mjg-admin-css')) return;
    var s = document.createElement('style'); s.id = 'mjg-admin-css';
    s.textContent = [
      '.adm-back{position:fixed;inset:0;background:rgba(33,30,25,0.55);z-index:9998;display:none;}',
      '.adm-back.on{display:block;}',
      '.adm{position:fixed;top:0;right:0;height:100vh;width:min(560px,100vw);background:var(--cream);',
      'border-left:1.5px solid var(--ink);box-shadow:-6px 0 0 rgba(33,30,25,0.12);z-index:9999;',
      'transform:translateX(100%);transition:transform .25s ease;display:flex;flex-direction:column;font-family:var(--sans);}',
      '.adm.on{transform:translateX(0);}',
      '.adm .bar{background:var(--ink);color:var(--cream);padding:11px 14px;display:flex;align-items:center;gap:10px;font-family:var(--mono);font-size:13px;}',
      '.adm .bar .x{margin-left:auto;cursor:pointer;border:1.5px solid rgba(255,255,255,.4);border-radius:5px;padding:3px 9px;font-size:12px;}',
      '.adm .tabs{display:flex;flex-wrap:wrap;gap:5px;padding:9px 12px;border-bottom:1.5px solid var(--ink);background:var(--panel);}',
      '.adm .tab{font-family:var(--mono);font-size:11px;border:1.5px solid var(--ink);border-radius:5px;padding:4px 9px;cursor:pointer;background:var(--cream);}',
      '.adm .tab.on{background:var(--ink);color:var(--cream);}',
      '.adm .body{flex:1;overflow-y:auto;padding:14px 16px;}',
      '.adm .foot{border-top:1.5px solid var(--ink);background:var(--panel);padding:11px 14px;display:flex;flex-wrap:wrap;gap:8px;}',
      '.adm label{display:block;font-family:var(--mono);font-size:11px;color:var(--soft);margin:10px 0 3px;text-transform:lowercase;}',
      '.adm input,.adm textarea{width:100%;font-family:var(--sans);font-size:13px;border:1.5px solid var(--ink);border-radius:5px;padding:7px 9px;background:#fff;color:var(--ink);}',
      '.adm textarea{min-height:64px;resize:vertical;font-family:var(--mono);font-size:12px;}',
      '.adm .item{border:1.5px solid var(--ink);border-radius:7px;padding:10px 12px;margin-bottom:12px;background:var(--panel);}',
      '.adm .item .ih{display:flex;align-items:center;gap:8px;font-family:var(--mono);font-size:11px;color:var(--soft);}',
      '.adm .item .ih .sp{margin-left:auto;display:flex;gap:5px;}',
      '.adm .btn{font-family:var(--mono);font-size:12px;border:1.5px solid var(--ink);border-radius:5px;padding:6px 11px;cursor:pointer;background:var(--cream);color:var(--ink);text-decoration:none;display:inline-block;}',
      '.adm .btn.mini{padding:2px 7px;font-size:11px;}',
      '.adm .btn.primary{background:var(--accent);color:#fff;border-color:var(--accent);}',
      '.adm .btn.ghost{background:transparent;}',
      '.adm .hint{font-family:var(--mono);font-size:10.5px;color:var(--soft);line-height:1.5;margin:2px 0 8px;}',
      '.adm-login{position:fixed;inset:0;z-index:10000;display:none;align-items:center;justify-content:center;background:rgba(33,30,25,0.6);}',
      '.adm-login.on{display:flex;}',
      '.adm-login .box{background:var(--cream);border:1.5px solid var(--ink);border-radius:8px;box-shadow:5px 5px 0 rgba(33,30,25,.2);width:min(340px,92vw);overflow:hidden;}',
      '.adm-login .box .bar{background:var(--ink);color:var(--cream);padding:10px 13px;font-family:var(--mono);font-size:12.5px;}',
      '.adm-login .box .in{padding:16px;}',
      '.adm-login .box .err{color:var(--accent);font-family:var(--mono);font-size:11px;min-height:15px;margin-top:6px;}',
      '.adm .toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);background:var(--ink);color:var(--cream);font-family:var(--mono);font-size:12px;padding:9px 15px;border-radius:6px;z-index:10001;opacity:0;transition:.2s;}',
      '.adm .toast.on{opacity:1;}'
    ].join('');
    document.head.appendChild(s);
  }

  /* ---- login ---- */
  async function checkPassword(input) {
    var a = CFG.admin;
    if (a.plainFallback && input === a.plainFallback) return true;
    if (a.passwordHash && window.MJG && MJG.hash) {
      var h = await MJG.hash(input);
      if (h && h === a.passwordHash) return true;
    }
    return false;
  }

  function showLogin() {
    var wrap = document.createElement('div');
    wrap.className = 'adm-login on';
    wrap.innerHTML =
      '<div class="box"><div class="bar">🔒 admin login — C:\\MJG\\admin.exe</div>' +
      '<div class="in"><input id="adm-pass" type="password" placeholder="password" autocomplete="off">' +
      '<div class="err" id="adm-err"></div>' +
      '<div style="display:flex;gap:8px;margin-top:10px;">' +
      '<button class="btn primary" id="adm-go">unlock</button>' +
      '<button class="btn ghost" id="adm-cancel">cancel</button></div></div></div>';
    document.body.appendChild(wrap);
    var pass = wrap.querySelector('#adm-pass');
    pass.focus();
    function close() { wrap.remove(); }
    wrap.querySelector('#adm-cancel').onclick = close;
    wrap.addEventListener('click', function (e) { if (e.target === wrap) close(); });
    async function attempt() {
      if (await checkPassword(pass.value)) { close(); openEditor(); }
      else { wrap.querySelector('#adm-err').textContent = 'wrong password'; pass.select(); }
    }
    wrap.querySelector('#adm-go').onclick = attempt;
    pass.addEventListener('keydown', function (e) { if (e.key === 'Enter') attempt(); });
  }

  /* ---- editor ---- */
  var current = SECTIONS[0].key;

  function openEditor() {
    A.draft = JSON.parse(JSON.stringify(MJG.data));
    if (!document.getElementById('adm-panel')) buildShell();
    document.getElementById('adm-back').classList.add('on');
    document.getElementById('adm-panel').classList.add('on');
    A.open = true;
    renderTabs(); renderBody();
  }
  function closeEditor() {
    document.getElementById('adm-back').classList.remove('on');
    document.getElementById('adm-panel').classList.remove('on');
    A.open = false;
    if (location.hash === '#admin') history.replaceState(null, '', location.pathname + location.search);
  }

  function buildShell() {
    var back = document.createElement('div'); back.className = 'adm-back'; back.id = 'adm-back';
    back.onclick = closeEditor;
    var panel = document.createElement('div'); panel.className = 'adm'; panel.id = 'adm-panel';
    panel.innerHTML =
      '<div class="bar">⚙ admin — edit portfolio<span class="x" id="adm-close">close</span></div>' +
      '<div class="tabs" id="adm-tabs"></div>' +
      '<div class="body" id="adm-body"></div>' +
      '<div class="foot">' +
        '<button class="btn primary" id="adm-save">save &amp; apply</button>' +
        '<button class="btn" id="adm-export">export .json</button>' +
        '<button class="btn" id="adm-copy">copy json</button>' +
        '<button class="btn ghost" id="adm-sheets">push to sheets</button>' +
        '<button class="btn ghost" id="adm-reset">reset built-in</button>' +
      '</div>';
    document.body.appendChild(back);
    document.body.appendChild(panel);
    panel.querySelector('#adm-close').onclick = closeEditor;
    panel.querySelector('#adm-save').onclick = doSave;
    panel.querySelector('#adm-export').onclick = doExport;
    panel.querySelector('#adm-copy').onclick = doCopy;
    panel.querySelector('#adm-sheets').onclick = doPushSheets;
    panel.querySelector('#adm-reset').onclick = doReset;
  }

  function renderTabs() {
    document.getElementById('adm-tabs').innerHTML = SECTIONS.map(function (s) {
      return '<button class="tab' + (s.key === current ? ' on' : '') + '" data-k="' + s.key + '">' + s.label + '</button>';
    }).join('');
    Array.prototype.forEach.call(document.querySelectorAll('#adm-tabs .tab'), function (b) {
      b.onclick = function () { current = b.getAttribute('data-k'); renderTabs(); renderBody(); };
    });
  }

  function fieldInput(path, val, type) {
    var v = (val == null ? '' : String(val)).replace(/"/g, '&quot;');
    if (type === 'area' || type === 'lines') {
      var text = (type === 'lines' && Array.isArray(val)) ? val.join('\n') : v;
      return '<textarea data-path="' + path + '" data-t="' + type + '">' + text.replace(/</g, '&lt;') + '</textarea>';
    }
    return '<input data-path="' + path + '" data-t="' + type + '" type="' + (type === 'num' ? 'number' : 'text') + '" step="any" value="' + v + '">';
  }

  function renderBody() {
    var sec = SECTIONS.filter(function (s) { return s.key === current; })[0];
    var d = A.draft; var host = document.getElementById('adm-body');
    var html = '';

    if (sec.kind === 'object') {
      var obj = d[sec.key] || {};
      sec.fields.forEach(function (f) {
        html += '<label>' + f.k + '</label>' + fieldInput(sec.key + '.' + f.k, obj[f.k], f.t);
      });
    }

    if (sec.kind === 'stringList') {
      html += '<div class="hint">One entry per line. Blank lines are ignored.</div>';
      html += '<textarea data-path="' + sec.key + '" data-t="lines" style="min-height:220px">' +
              (d[sec.key] || []).join('\n').replace(/</g, '&lt;') + '</textarea>';
    }

    if (sec.kind === 'objectList') {
      var arr = d[sec.key] || [];
      html += '<button class="btn mini" id="adm-add" style="margin-bottom:10px">+ add ' + sec.label.toLowerCase() + '</button>';
      arr.forEach(function (item, idx) {
        html += '<div class="item"><div class="ih">#' + (idx + 1) +
          '<span class="sp">' +
          '<button class="btn mini" data-mv="up" data-i="' + idx + '">↑</button>' +
          '<button class="btn mini" data-mv="down" data-i="' + idx + '">↓</button>' +
          '<button class="btn mini" data-del="' + idx + '">✕</button></span></div>';
        sec.fields.forEach(function (f) {
          html += '<label>' + f.k + '</label>' + fieldInput(sec.key + '.' + idx + '.' + f.k, item[f.k], f.t);
        });
        html += '</div>';
      });
    }

    host.innerHTML = html;
    // bind add/del/move for objectList & keep drafts in sync on input
    if (sec.kind === 'objectList') {
      var addBtn = document.getElementById('adm-add');
      if (addBtn) addBtn.onclick = function () { syncFromInputs(); d[sec.key].push(blank(sec)); renderBody(); };
      Array.prototype.forEach.call(host.querySelectorAll('[data-del]'), function (b) {
        b.onclick = function () { syncFromInputs(); d[sec.key].splice(+b.getAttribute('data-del'), 1); renderBody(); };
      });
      Array.prototype.forEach.call(host.querySelectorAll('[data-mv]'), function (b) {
        b.onclick = function () {
          syncFromInputs();
          var i = +b.getAttribute('data-i'), dir = b.getAttribute('data-mv') === 'up' ? -1 : 1, j = i + dir;
          if (j < 0 || j >= d[sec.key].length) return;
          var tmp = d[sec.key][i]; d[sec.key][i] = d[sec.key][j]; d[sec.key][j] = tmp; renderBody();
        };
      });
    }
  }

  function blank(sec) {
    var o = {}; sec.fields.forEach(function (f) { o[f.k] = f.t === 'num' ? 0 : (f.t === 'lines' ? [] : ''); }); return o;
  }

  // pull current input values back into A.draft
  function syncFromInputs() {
    Array.prototype.forEach.call(document.querySelectorAll('#adm-body [data-path]'), function (inp) {
      var path = inp.getAttribute('data-path'), t = inp.getAttribute('data-t');
      var val;
      if (t === 'lines') val = inp.value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
      else if (t === 'num') val = inp.value === '' ? '' : parseFloat(inp.value);
      else val = inp.value;
      setPath(A.draft, path, val);
    });
  }
  function setPath(obj, path, val) {
    var parts = path.split('.'), o = obj;
    for (var i = 0; i < parts.length - 1; i++) {
      var k = parts[i]; var nk = parts[i + 1];
      if (o[k] == null) o[k] = /^\d+$/.test(nk) ? [] : {};
      o = o[k];
    }
    o[parts[parts.length - 1]] = val;
  }

  /* ---- actions ---- */
  function commit() { syncFromInputs(); MJG.data = JSON.parse(JSON.stringify(A.draft)); }

  function doSave() {
    commit();
    MJG.saveLocal(MJG.data);
    MJG.source = 'local-edits';
    MJG.renderAll();
    toast('saved to this browser ✓');
  }
  function doExport() {
    commit();
    var blob = new Blob([JSON.stringify(MJG.data, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'mjg-portfolio-data.json'; a.click();
    toast('exported mjg-portfolio-data.json');
  }
  async function doCopy() {
    commit();
    var txt = JSON.stringify(MJG.data, null, 2);
    try { await navigator.clipboard.writeText(txt); toast('json copied to clipboard'); }
    catch (e) { window.prompt('Copy JSON:', txt); }
  }
  function doReset() {
    if (!confirm('Reset to built-in data and discard local edits?')) return;
    MJG.clearLocal();
    MJG.data = JSON.parse(JSON.stringify(window.DEFAULT_DATA));
    MJG.source = 'default';
    A.draft = JSON.parse(JSON.stringify(MJG.data));
    MJG.renderAll(); renderBody();
    toast('reset to built-in data');
  }
  async function doPushSheets() {
    commit();
    if (!(CFG.sheets && CFG.sheets.enabled && CFG.sheets.webAppUrl)) {
      toast('Sheets not configured (see SETUP.md)'); return;
    }
    toast('pushing to Google Sheets…');
    try {
      var res = await fetch(CFG.sheets.webAppUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // avoids CORS preflight
        body: JSON.stringify({ token: CFG.sheets.token, action: 'save', data: MJG.data })
      });
      var ok = true;
      try { var j = await res.json(); ok = j && j.ok; } catch (e) { /* opaque = assume ok */ }
      if (ok) {
        // Update client cache with the data we just pushed
        try { localStorage.setItem('mjg_sheets_cache_v1', JSON.stringify({ data: MJG.data, timestamp: Date.now() })); } catch (e) {}
      }
      toast(ok ? 'pushed to Google Sheets ✓' : 'sheet rejected the request');
    } catch (e) {
      MJG.saveLocal(MJG.data);
      toast('push blocked by browser — saved locally instead');
    }
  }

  var _tt, _toastNode;
  function toast(msg) {
    if (!_toastNode) {
      var host = document.createElement('div'); host.className = 'adm';
      _toastNode = document.createElement('div'); _toastNode.className = 'toast';
      host.appendChild(_toastNode); document.body.appendChild(host);
    }
    _toastNode.textContent = msg; _toastNode.classList.add('on');
    clearTimeout(_tt); _tt = setTimeout(function () { _toastNode.classList.remove('on'); }, 2200);
  }

  /* ---- secret trigger ---- */
  var clicks = 0, timer = null;
  function armTrigger() {
    var logo = document.getElementById('tb-logo');
    if (logo) logo.addEventListener('click', function () {
      clicks++;
      clearTimeout(timer);
      timer = setTimeout(function () { clicks = 0; }, CFG.admin.triggerWindowMs);
      if (clicks >= CFG.admin.triggerClicks) { clicks = 0; showLogin(); }
    });
    // keyboard backdoor: Ctrl+Shift+A
    document.addEventListener('keydown', function (e) {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) { e.preventDefault(); showLogin(); }
    });
    if (location.hash === '#admin') setTimeout(showLogin, 300);
  }

  A.init = function () { injectStyles(); armTrigger(); };
})();
