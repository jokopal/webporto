/**
 * ============================================================
 *  MJG Portfolio — Google Sheets CMS backend (Apps Script)
 * ------------------------------------------------------------
 *  Turns a Google Spreadsheet into the database for the site.
 *  The website reads it (GET ?action=get) and the hidden Admin
 *  panel writes to it (POST {action:'save'}).
 *
 *  SETUP (see SETUP.md for the full walkthrough):
 *   1. Create a Google Sheet.
 *   2. Extensions ▸ Apps Script → paste this file.
 *   3. Set TOKEN below to a long secret string.
 *   4. Run `setupSheets` once (creates every tab + headers).
 *   5. Deploy ▸ New deployment ▸ Web app:
 *        Execute as: Me   |   Who has access: Anyone
 *   6. Copy the /exec URL → paste into assets/config.js:
 *        sheets.enabled = true
 *        sheets.webAppUrl = '<the /exec url>'
 *        sheets.token     = '<same TOKEN as below>'
 *   7. Run `seedFromDefaults` (optional) to fill starter rows,
 *      OR open the site → Admin → "push to sheets".
 * ============================================================
 */

var TOKEN = 'ca46c52855953e629d0950e4d4533185bc813b44217a4099';

/* Sheet schema. `cols` = header row. `mode`:
   - 'kv'      : two columns key|value  → an object
   - 'rows'    : header columns          → an array of objects
   - 'list'    : single column 'value'   → an array of strings   */
var SCHEMA = {
  profile:        { sheet: 'Profile',        mode: 'kv',
                    keys: ['firstName','lastName','greeting','roleChip','availability','headline','summary',
                           'location','coordLabel','email','phone','whatsapp','linkedin','linkedinHandle','photo'] },
  stats:          { sheet: 'Stats',          mode: 'rows', cols: ['num','lbl'] },
  products:       { sheet: 'Products',       mode: 'rows', cols: ['name','tagline','desc','tech','link','status','period','impact'],
                    arrays: ['tech'] },
  documenter:     { sheet: 'Documenter',     mode: 'rows', cols: ['src','place','caption'] },
  projects:       { sheet: 'Projects',       mode: 'rows', cols: ['name','org','period','place','mode','lng','lat','blurb'],
                    numeric: ['lng','lat'], alias: { loc: 'mode' } },
  experience:     { sheet: 'Experience',     mode: 'rows', cols: ['role','org','period','loc','mode','type','link','desc'] },
  expertise:      { sheet: 'Expertise',      mode: 'rows', cols: ['code','title','desc','tags'], arrays: ['tags'] },
  education:      { sheet: 'Education',       mode: 'rows', cols: ['period','school','degree'] },
  hardSkills:     { sheet: 'HardSkills',     mode: 'rows', cols: ['name','lvl','pct'], numeric: ['pct'] },
  languages:      { sheet: 'Languages',      mode: 'rows', cols: ['name','level'] },
  awards:         { sheet: 'Awards',         mode: 'list' },
  pubs:           { sheet: 'Publications',   mode: 'list' },
  certifications: { sheet: 'Certifications', mode: 'list' },
  softSkills:     { sheet: 'SoftSkills',     mode: 'list' },
  tools:          { sheet: 'Tools',          mode: 'list' }
};

/* Server-side cache: reading all 13 sheets takes ~6s. CacheService serves a
   cached JSON in ~200ms. Direct edits in the Sheet appear after CACHE_SECONDS;
   a save via the site clears the cache immediately. */
var CACHE_SECONDS = 60;
var CACHE_KEY = 'mjg_data_json';

/* ---------------- HTTP handlers ---------------- */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'get';
  if (action === 'get') return json(getDataCached_(e && e.parameter && e.parameter.fresh));
  return json({ ok: false, error: 'unknown action' });
}

function getDataCached_(forceFresh) {
  var cache = CacheService.getScriptCache();
  if (!forceFresh) {
    var hit = cache.get(CACHE_KEY);
    if (hit) return { ok: true, data: JSON.parse(hit), cached: true };
  }
  var data = readAll();
  try { cache.put(CACHE_KEY, JSON.stringify(data), CACHE_SECONDS); } catch (e) { /* >100KB or quota */ }
  return { ok: true, data: data, cached: false };
}

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (body.token !== TOKEN) return json({ ok: false, error: 'bad token' });
    if (body.action === 'save' && body.data) {
      writeAll(body.data);
      try { CacheService.getScriptCache().remove(CACHE_KEY); } catch (e2) {} // reflect the write immediately
      return json({ ok: true, saved: true });
    }
    return json({ ok: false, error: 'unknown action' });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ---------------- read ---------------- */
function readAll() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var out = {};
  Object.keys(SCHEMA).forEach(function (key) {
    var spec = SCHEMA[key];
    var sh = ss.getSheetByName(spec.sheet);
    if (!sh) return;
    var values = sh.getDataRange().getValues();
    if (spec.mode === 'kv') {
      var o = {};
      values.forEach(function (r, i) { if (i === 0) return; if (r[0] !== '') o[r[0]] = r[1]; });
      out[key] = o;
    } else if (spec.mode === 'list') {
      out[key] = values.slice(1).map(function (r) { return r[0]; }).filter(function (v) { return v !== ''; });
    } else { // rows - read by HEADER NAME so column order / extra columns never corrupt data
      var header = (values[0] || spec.cols).map(function (h) { return String(h).trim(); });
      var alias = spec.alias || {};
      out[key] = values.slice(1).filter(function (r) { return String(r[0]) !== ''; }).map(function (r) {
        var obj = {};
        header.forEach(function (h, idx) {
          if (!h) return;
          var k = alias[h] || h;               // e.g. "loc" header -> "mode"
          var v = r[idx];
          if (spec.numeric && spec.numeric.indexOf(k) >= 0) v = (v === '' ? '' : Number(v));
          if (spec.arrays && spec.arrays.indexOf(k) >= 0) v = String(v).split(',').map(function (x){return x.trim();}).filter(Boolean);
          obj[k] = v;
        });
        return obj;
      });
    }
  });
  return out;
}

/* ---------------- write ---------------- */
function writeAll(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(SCHEMA).forEach(function (key) {
    if (data[key] == null) return;
    var spec = SCHEMA[key];
    var sh = ss.getSheetByName(spec.sheet) || ss.insertSheet(spec.sheet);
    sh.clearContents();
    if (spec.mode === 'kv') {
      sh.getRange(1, 1, 1, 2).setValues([['key', 'value']]);
      var rows = (spec.keys || Object.keys(data[key])).map(function (k) { return [k, data[key][k] == null ? '' : data[key][k]]; });
      if (rows.length) sh.getRange(2, 1, rows.length, 2).setValues(rows);
    } else if (spec.mode === 'list') {
      sh.getRange(1, 1).setValue('value');
      var arr = (data[key] || []).map(function (v) { return [v]; });
      if (arr.length) sh.getRange(2, 1, arr.length, 1).setValues(arr);
    } else {
      sh.getRange(1, 1, 1, spec.cols.length).setValues([spec.cols]);
      var body = (data[key] || []).map(function (item) {
        return spec.cols.map(function (c) {
          var v = item[c];
          if (spec.arrays && spec.arrays.indexOf(c) >= 0 && Array.isArray(v)) v = v.join(', ');
          return v == null ? '' : v;
        });
      });
      if (body.length) sh.getRange(2, 1, body.length, spec.cols.length).setValues(body);
    }
    SpreadsheetApp.flush();
  });
}

/* ---------------- one-time helpers (run from the editor) ---------------- */
function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(SCHEMA).forEach(function (key) {
    var spec = SCHEMA[key];
    var sh = ss.getSheetByName(spec.sheet) || ss.insertSheet(spec.sheet);
    if (sh.getLastRow() === 0) {
      if (spec.mode === 'kv') sh.getRange(1, 1, 1, 2).setValues([['key', 'value']]);
      else if (spec.mode === 'list') sh.getRange(1, 1).setValue('value');
      else sh.getRange(1, 1, 1, spec.cols.length).setValues([spec.cols]);
    }
  });
  // seed the profile key column so the sheet is self-documenting
  var p = ss.getSheetByName('Profile');
  if (p && p.getLastRow() < 2) {
    var keys = SCHEMA.profile.keys.map(function (k) { return [k, '']; });
    p.getRange(2, 1, keys.length, 2).setValues(keys);
  }
  SpreadsheetApp.getUi && SpreadsheetApp.getActive().toast('Sheets ready ✓');
}

/** Fill every tab with the site's starter content in one run.
 *  Just open this script, select `seedFromDefaults`, and click Run.
 *  (Also runs setupSheets first so headers/tabs exist.) */
function seedFromDefaults() {
  setupSheets();
  writeAll(SEED_DATA);
  SpreadsheetApp.getActive().toast('Seeded all tabs with starter content ✓');
}

/* ---------------- starter content (mirror of assets/config.js DEFAULT_DATA) ---------------- */
var SEED_DATA = {"profile":{"firstName":"Menliman Joyfal","lastName":"Gulo","greeting":"hi, i'm","roleChip":"GIS · REMOTE SENSING · GEO-AI","availability":"Open to work · Fresh graduate 2026","headline":"Independent GIS Developer (Jokopal) | Remote Sensing & GIS at Seacrest Indonesia and WCS | Blue Carbon Research, UGM","summary":"Final-year Geographic Information Science undergraduate (GPA 3.58/4.00, KIP scholar) at the Faculty of Geography, Universitas Gadjah Mada, specialising in GIS, cartography and remote sensing (Sentinel-2, LiDAR, radar) for blue-carbon, seagrass and coastal water-quality mapping. I build independent GIS products as Jokopal, including the open-source desktop app BlueMap: Coastal AutoMapper, and integrate machine learning with GIS for Geo-AI solutions. Open to full-time roles and collaboration.","location":"Yogyakarta, Indonesia","coordLabel":"7.77°S 110.38°E","email":"menlimanjoyfalgulo@gmail.com","phone":"+62 823-9703-8718","whatsapp":"https://wa.me/6282397038718","linkedin":"https://www.linkedin.com/in/menlimanjoyfalgulo","linkedinHandle":"/in/menlimanjoyfalgulo","photo":"uploads/photo-1782995995213.png"},"stats":[{"num":"3.58","lbl":"GPA / 4.00"},{"num":"7","lbl":"national awards"},{"num":"7","lbl":"publications & releases"},{"num":"54","lbl":"students mentored"}],"products":[{"name":"BlueMap: Coastal AutoMapper","tagline":"Open-source coastal habitat mapping","period":"v2.0 · 2026","status":"MIT · Zenodo DOI","link":"https://zenodo.org/records/20457262","impact":"3,016 impressions on launch","tech":["Python (FastAPI, rasterio, scikit-learn)","React + Vite","Electron","SQLite","Random Forest · SVM"],"desc":"Offline desktop app for shallow-water benthic habitat mapping from satellite imagery. Bundles validated methods (sunglint correction, Lyzenga depth-invariant index, ML classification/regression, accuracy assessment) with multi-temporal change detection. Supports Sentinel-2, Landsat 8/9, PlanetScope and WorldView. Open-source (MIT) with a citable Zenodo DOI."},{"name":"Palm DeepLearning Model (GeoAI)","tagline":"Palm-oil detection & tree-health AI","period":"v1-v4 · 2025","status":"Open-source (GitHub)","link":"https://github.com/jokopal/Palm_DeepLearningModel","impact":"8,342 impressions (V4)","tech":["YOLOv8","U-Net · CNN","TensorFlow","OpenCV · Python"],"desc":"Experimental GeoAI pipeline for oil-palm and coconut monitoring from aerial imagery: YOLOv8 tree detection (2,264 trees, F1 0.79), blank-spot and planting-distance analytics, crown-size estimation, and U-Net/CNN canopy-health diagnosis (healthy vs infected). Built in Python (OpenCV, NumPy, SciPy) on Google Colab."},{"name":"Shp.Aid","tagline":"Web GIS toolkit for spatial data","period":"2025 - Present","status":"Live","link":"https://shpaid.com","impact":"","tech":["Web GIS","JavaScript","AI-assisted"],"desc":"Independent, AI-assisted web application for working with shapefiles and geospatial data end to end. Built, shipped and maintained solo as Jokopal."},{"name":"WEB GIS - Spatial Licence Dashboard","tagline":"Mining-licence spatial dashboard","period":"Sep 2025 - Nov 2025 · Berau Coal","status":"Delivered","link":"","impact":"4,029 impressions · most-viewed post","tech":["OpenLayers","AlpineJS","Supabase/PostGIS","RBAC"],"desc":"Full-stack web GIS visualising mining-licensing data with interactive maps and real-time compliance analytics. Secure Supabase (PostgreSQL/PostGIS) backend with Role-Based Access Control, plus Apps Script, WhatsApp and email notifications."},{"name":"L.E.A.D Logbook Automation","tagline":"Digital logbook & report automation","period":"Sep 2025 - Nov 2025 · Berau Coal","status":"Delivered (team of 3)","link":"","impact":"","tech":["React.js","TailwindCSS","UI/UX"],"desc":"Frontend for the Learning, Evaluation & Activity Development app: a responsive interface for digital logbook and report-automation features, integrated with backend services."}],"projects":[{"name":"GEE Training, Benthic Habitat Mapping","org":"GGGI Indonesia","period":"2025","place":"Jakarta","lng":106.827,"lat":-6.175,"blurb":"Co-trainer for intermediate Google Earth Engine training (Sentinel-2, Random Forest) supporting national benthic-habitat mapping.","mode":"On-site"},{"name":"COAST TA, Blue-Carbon Rehabilitation","org":"Seacrest Indonesia","period":"2026","place":"Central Java coast","lng":110.64,"lat":-6.9,"blurb":"Feasibility study for blue-carbon ecosystem rehabilitation: satellite dataset, classification and stratification maps, six deliverables.","mode":"Remote"},{"name":"Coastal Water-Quality (MPAs & Aquaculture)","org":"Wildlife Conservation Society","period":"2026","place":"West Nusa Tenggara","lng":116.35,"lat":-8.6,"blurb":"Sentinel-2 monitoring across 347 aquaculture zones and 16 Marine Protected Areas (TSS, Chlorophyll-a, Salinity) for marine spatial planning.","mode":"Remote"},{"name":"TSS Monitoring (ZOM 497)","org":"Wildlife Conservation Society","period":"2026","place":"South Bolaang Mongondow","lng":123.98,"lat":0.36,"blurb":"Multi-temporal TSS mapping with 17 Sentinel-2 scenes and 7 algorithms; compliance with PP 22/2021 confirmed.","mode":"Remote"},{"name":"EQUITY WCU Benthic & Seagrass Survey","org":"Blue Carbon Research Group, UGM","period":"2025","place":"Sanur & Tanjung Benoa, Bali","lng":115.24,"lat":-8.72,"blurb":"Snorkelling photo-transect survey of benthic and seagrass habitats along Bali coasts (OM System underwater camera) for the EQUITY World Class University program.","mode":"Field"},{"name":"National Seagrass Map, Field Survey","org":"Blue Carbon Research Group, UGM","period":"2024-25","place":"Madura, East Java","lng":113.47,"lat":-7.02,"blurb":"16 benthic spot-check sites along the north coast of East Java for the Indonesia Seagrass Map: Framework and Implementation.","mode":"Field"},{"name":"National Seagrass Map, Field Survey","org":"Blue Carbon Research Group, UGM","period":"2024-25","place":"Pulau Banyak, Aceh","lng":97.32,"lat":2.07,"blurb":"91 transect samples of benthic and seagrass habitats in the Banyak Islands for the National Seagrass Map.","mode":"Field"},{"name":"Seagrass Dynamics Study","org":"Regional Studies in Marine Science","period":"2024","place":"Kuta Mandalika, Lombok","lng":116.28,"lat":-8.89,"blurb":"Case study mapping seagrass dynamics in a developing coastal area (journal publication).","mode":"Field"},{"name":"Rapid Flood Mapping (Disaster Charter)","org":"UGM · Volunteer","period":"2025","place":"Aceh & Sumatra","lng":97.5,"lat":3.5,"blurb":"Volunteer geospatial analyst: pre and post-disaster interpretation and digitisation of flood and landslide extents to BRIN standards.","mode":"Remote"},{"name":"Urban Portable Agriculture (SOTECH 2024)","org":"Komunitas Geosains UGM","period":"2024","place":"Plaju, Palembang","lng":104.82,"lat":-3,"blurb":"Integrated vertical-farming system; 1st runner-up (technology) at Sotech Pertamina 2024.","mode":"On-site"},{"name":"Spatial Compliance & WEB GIS Licence","org":"PT Berau Coal","period":"2025","place":"Berau, Kalimantan Timur","lng":117.492,"lat":2.161,"blurb":"Mining-permit compliance monitoring plus a full-stack spatial-licence dashboard (OpenLayers, Supabase/PostGIS, RBAC).","mode":"On-site"},{"name":"IKN Deforestation & Air-Concentration Study","org":"Presented at BIG Geomatika VII","period":"2024","place":"IKN Nusantara","lng":116.686,"lat":-0.999,"blurb":"Main author on air-concentration change from deforestation in the new-capital zone; national proceedings.","mode":"Remote"},{"name":"Flood Vulnerability Analysis","org":"Bengawan Solo Watershed","period":"2024","place":"Sukoharjo, Central Java","lng":110.836,"lat":-7.681,"blurb":"Overlay-method flood-vulnerability mapping integrating mass-media flood reporting.","mode":"Remote"},{"name":"Tsunami Early-Warning System Survey","org":"CV. Spiro Energy · BPBD","period":"2025","place":"South Coast, Central Java","lng":109.015,"lat":-7.726,"blurb":"EWS field surveyor: siren/transmitter tower inspection and Motorola CPS radio-frequency programming.","mode":"Field"},{"name":"Blue Carbon Research & Geospatial Labs","org":"Faculty of Geography, UGM","period":"2024-now","place":"Yogyakarta","lng":110.3771,"lat":-7.7669,"blurb":"Blue-carbon research and lab instruction: remote sensing, land surveying, cartography and spatial databases (54 students across four practicums).","mode":"On-site"},{"name":"Roots, TKJ & First Maps","org":"SMKN 1 Lolofitu Moi","period":"2019-22","place":"Nias Barat","lng":97.75,"lat":1.15,"blurb":"Computer & network engineering foundation on Nias island, where the geospatial journey began.","mode":"On-site"}],"experience":[{"role":"Co-Trainer & Technical Facilitator, Intermediate GEE Training","org":"GGGI Indonesia","period":"Dec 2025","loc":"Jakarta","type":"work","link":"","desc":"Facilitated intermediate Google Earth Engine training on live-coding workflows for Sentinel-2 processing, Random Forest classification and accuracy assessment, supporting standardised national benthic-habitat mapping and blue-carbon monitoring.","mode":"On-site"},{"role":"Assistant Specialist, Remote Sensing & GIS (COAST TA)","org":"Seacrest Indonesia","period":"Jul 2026 - Present · Contract","loc":"Sleman, Yogyakarta (Remote)","type":"work","link":"","desc":"Remote-sensing assistant on a 10-week feasibility study for blue-carbon ecosystem rehabilitation. Delivered a full satellite dataset, land-classification and stratification maps/tables, RS methodology documentation, a multi-layer overlay and village-level recap: six analytical deliverables on schedule under a results-based contract.","mode":"Remote"},{"role":"Remote Sensing Analyst, Coastal Water-Quality (MPAs & Aquaculture)","org":"Wildlife Conservation Society","period":"Jul 2026 - Present · Freelance","loc":"West Nusa Tenggara","type":"research","link":"","desc":"Monitored water quality across 347 aquaculture zones and 16 Marine Protected Areas using bi-seasonal Sentinel-2 (2023 to 2026) to estimate TSS, Chlorophyll-a and Salinity. Benchmarked algorithms per parameter, validated against in-situ sampling, and delivered technical reports for marine spatial planning and conservation zoning.","mode":"On-site"},{"role":"Remote Sensing Analyst, TSS Monitoring (ZOM 497)","org":"Wildlife Conservation Society","period":"Jun 2026 - Jul 2026 · Freelance","loc":"South Bolaang Mongondow","type":"research","link":"","desc":"Led multi-temporal TSS monitoring with 17 Sentinel-2 scenes (2018 to 2026), comparing 7 retrieval algorithms validated against in-situ sampling. Identified Jaelani et al. (2016) as best-performing and confirmed compliance with PP 22/2021, delivering a technical report on coastal water-quality status.","mode":"On-site"},{"role":"Volunteer Geospatial Analyst, Disaster Charter Rapid Flood Mapping","org":"Universitas Gadjah Mada","period":"Dec 2025","loc":"Aceh, West & North Sumatra","type":"volunteer","link":"","desc":"Rapid flood mapping in Sumatra: pre and post-disaster satellite image interpretation, digitisation of flood and landslide extents (polygon) and affected buildings/infrastructure (point), attributed to BRIN geospatial standards for disaster-impact assessment and emergency response.","mode":"On-site"},{"role":"Field Surveyor, National Seagrass Map (Nasional)","org":"UGM · KKP · BRIN · BIG · Univ. of Queensland","period":"2024 - 2025","loc":"Madura, Pulau Banyak, Sanur & 7 regions","type":"research","link":"","desc":"National benthic and seagrass mapping (Indonesia Seagrass Map: Framework and Implementation, supported by the David & Lucile Packard Foundation): 16 benthic spot-check sites in Madura, 91 transect samples in Pulau Banyak, snorkelling photo-transects at Sanur (Bali) with an OM System underwater camera, plus field surveys and geospatial processing across 7 Indonesian regions.","mode":"Field"},{"role":"Spatial Compliance Analyst, Dept. License","org":"PT Berau Coal","period":"Sep 2025 - Dec 2025 · Internship","loc":"Berau, Kalimantan Timur","type":"work","link":"","desc":"GIS and remote monitoring for mining-permit compliance; built spatial dashboards for permit boundaries, violation detection and inventory data. Also shipped two internal apps (see Products): a WEB GIS spatial-licence dashboard and the L.E.A.D logbook automation frontend.","mode":"On-site"},{"role":"Geospatial Programming & Analyst (Talent Development)","org":"Sinarmas Agribusiness & Food · TDC UGM","period":"Aug 2025 - Dec 2025 · Student Trainee","loc":"Yogyakarta (Hybrid)","type":"work","link":"","desc":"Talent-development program in digital innovation, human-capital strategy and sustainable agribusiness. Delivered an AI-driven ESG capstone (\"Palm Oil, but Make It Cool\", Group 3, presented 25 Nov 2025) proposing digital-content, smart-village and gamification strategies for Gen-Z recruitment.","mode":"Hybrid"},{"role":"Surveyor, Tsunami Early-Warning System","org":"CV. Spiro Energy","period":"Aug 2025 · Freelance","loc":"Central Java","type":"work","link":"","desc":"EWS surveyor and intern technician: inspected and tested siren/transmitter towers with the BPBD team and applied radio-frequency programming via Motorola CPS for reliable early-warning communication.","mode":"Field"},{"role":"Research Assistant, Blue Carbon Research Group","org":"Faculty of Geography, UGM","period":"Aug 2024 - Present · Part-time","loc":"Yogyakarta (Hybrid)","type":"research","link":"","desc":"Remote-sensing and spatial analysis for blue-carbon stock assessment in coastal ecosystems, plus benthic, seagrass and mangrove field surveys. Lab assistant across four practicums: Active-System Remote Sensing (LiDAR & radar; 17 students), Land Surveying & Cartography (16 students), and Spatial Database & SDI (ArcGIS Enterprise, GeoServer, PostgreSQL, GeoNode; 21 students).","mode":"Hybrid"},{"role":"Undergraduate Researcher, Blue Carbon & Seagrass Mapping (ML + Multispectral RS)","org":"UGM (Fundamental Research Grant 2024)","period":"Dec 2024","loc":"Yogyakarta","type":"research","link":"","desc":"Applied multispectral remote sensing and machine learning to rapid mapping of seagrass carbon stocks: feature engineering (deglint bands, DII, PCA, KPCA), regression-model comparison and spatial upscaling for standardised blue-carbon monitoring.","mode":"On-site"},{"role":"Operational Coordinator, Mine-Eye Aerial Acquisition (Astranauts Finalist)","org":"Mine Eye Gama - Astranauts & Innovlab 2024 (Astra Digital)","period":"Oct 2024 - Jan 2025","loc":"Yogyakarta","mode":"On-site","type":"leadership","link":"","desc":"Finalist team building Mine-Eye, a remote geospatial-processing solution using LiDAR and drones for PT Pama Persada Nusantara mining areas. Coordinated cross-functional teams, shaped the service workflow, and prototyped the Ground Control Station and a drone-LiDAR tracking web app."},{"role":"Geoscience Team, Urban Portable Agriculture (SOTECH Pertamina 2024)","org":"Komunitas Geosains UGM","period":"May 2024 - Jul 2024","loc":"Plaju, Palembang","type":"leadership","link":"","desc":"Built the Urban Portable Agriculture (UPA) integrated vertical-farming system for land-limited urban areas in the Mina Padi program with PT Kilang Pertamina RU III Plaju and AntaraDjaya Indonesia. Secured 1st runner-up (technology) at Sotech 2024.","mode":"On-site"},{"role":"Presenter, Geomatika VII National Seminar","org":"Badan Informasi Geospasial (BIG)","period":"May 2024","loc":"Cibinong, West Java","type":"research","link":"","desc":"Main author and presenter; paper \"Air Concentration Changes Due to Deforestation of the IKN Area\" selected for the official national proceedings.","mode":"On-site"},{"role":"President","org":"Komunitas Geosains UGM","period":"Jan 2024 - Dec 2024","loc":"Yogyakarta","type":"leadership","link":"","desc":"Led geoscience education, research and student engagement; secured 6 competition wins and 1 national proceedings publication.","mode":"On-site"},{"role":"Co-Facilitator (Cofas)","org":"PPSMB UGM","period":"Mar 2023 - Sep 2023 · Contract","loc":"Yogyakarta","type":"volunteer","link":"","desc":"Delivered orientation and creative material to 42 new students, with public-speaking and assessment duties, after a competitive selection and intensive training in the Herman Yohanes cluster.","mode":"On-site"},{"role":"Surveyor, PJU Data Collection Phase V","org":"UPT PJU, Dinas PUPKP Kota Yogyakarta","period":"Oct 2023 - Nov 2023","loc":"Yogyakarta","type":"work","link":"","desc":"Surveyed street-lighting (PJU) kWh meters: measured and recorded meter data, verified installation condition, and supported data analysis for street-lighting infrastructure management.","mode":"Field"},{"role":"Head of Internal Affairs","org":"Indonesian Climate Change Initiative UGM","period":"Aug 2023 - Jan 2024","loc":"Yogyakarta","type":"leadership","link":"","desc":"Directed internal communications and operations for climate-change initiatives; drove strategic plans and cross-team collaboration.","mode":"On-site"}],"expertise":[{"code":"indie.products","title":"Independent GIS Products","desc":"Building and shipping GIS apps and open tools end to end as an indie developer (AI-assisted): the open-source BlueMap desktop app, Shp.Aid, and client dashboards.","tags":["BlueMap","Shp.Aid","React · OpenLayers","Supabase/PostGIS"]},{"code":"remote.sensing","title":"Remote Sensing","desc":"Sentinel-2, LiDAR, radar and UAV for blue-carbon, seagrass, water-quality and environmental monitoring, with ML-based retrieval.","tags":["Sentinel-2","LiDAR · Radar","UAV/Drone","Random Forest · SVM"]},{"code":"gis.analysis","title":"GIS Analysis","desc":"Spatial modelling, overlay analysis and enterprise geodatabases: from permit compliance to flood vulnerability and marine spatial planning.","tags":["ArcGIS Enterprise","PostGIS","GeoServer","spatial queries"]},{"code":"cartography","title":"Cartography & Surveying","desc":"Thematic map design and land surveying: theodolite, robotic total station, waterpass and GNSS turned into clear visual data.","tags":["thematic maps","total station","GNSS","field survey"]},{"code":"geo.ai","title":"Geo-AI","desc":"Integrating machine learning with GIS for seagrass and blue-carbon mapping, water-quality retrieval and ESG decision support.","tags":["ML + GIS","Python","feature engineering"]}],"education":[{"period":"Jul 2022 - May 2026 (expected)","school":"Universitas Gadjah Mada","degree":"Bachelor of Science, Cartography & Remote Sensing. GPA 3.58/4.00, KIP scholar. Focus: Geo-AI, Active Remote Sensing, Spatial Analysis & Modelling, Spatial Programming, Analytical & Thematic Cartography."},{"period":"Jun 2019 - Apr 2022","school":"SMK Negeri 1 Lolofitu Moi","degree":"Computer & Network Engineering (Teknik Komputer & Jaringan). Final grade 92.00/100; computer maintenance & wireless networking."}],"awards":["PKM-GFT Funding (Futuristic Ideas), Kemendikbudristek 2025 (national)","Gold Medal & 2nd Place, Diponegoro Science Competition 2024 (national)","1st Runner-Up, Sotech Competition (Technology, Pertamina) 2024","2nd Place, Business Challenge Track, Astranauts 2024","3rd Place, Scientific Writing Competition, LOGIN 2024","National Poetry Finalist & author of \"No Longer Looking for Cemara\"","Finalist, National Essay Competition, IDEA FEST"],"pubs":["Mapping Seagrass Dynamics in a Developing Coastal Area: A Case Study of Kuta Mandalika, Lombok Island, Indonesia (Regional Studies in Marine Science)","Comparison of PCA, KPCA, and Regression Models for Seagrass Percent Cover Mapping Using Sentinel-2 (SPIE Proceedings, Asia-Pacific Remote Sensing Conference 2024, Kaohsiung, Taiwan)","Air Concentration Changes Due to Deforestation of the IKN Area (Proceedings of the VII Geomatics National Seminar, BIG 2024)","IoT-Based Urban Portable Agriculture System: Technical Validation of a Low-Cost Hydroponic Monitoring Platform (lead author, 2024)","Flood Vulnerability Analysis of the Bengawan Solo Watershed, Sukoharjo, Central Java (overlay method, 2024)","Fintech Innovation: Enhancing the Sustainability of Micro, Small & Medium Enterprises (2025)","BlueMap: Coastal AutoMapper, open-source software release (MIT, Zenodo DOI)"],"certifications":["Thematic Google Earth Engine Training: Deforestation & Air Pollution (Geoacces, 2024)","Basic Geotechnical Engineering Investigation Using Resistivity (Geotama Multi Resources, 2023)","Tsunami Inundation Modeling & Evacuation Route Design (Langen Teknik Satria, 2023)","Kelompok Materi Pelatihan Dasar (KMPD)","KMPL Pekerja Kantor dan Dapur"],"hardSkills":[{"name":"ArcGIS / ArcGIS Enterprise · QGIS","lvl":"expert","pct":92},{"name":"Remote Sensing (Sentinel-2, LiDAR, Radar, UAV)","lvl":"advanced","pct":88},{"name":"Cartography & Land Surveying (Total Station, GNSS)","lvl":"advanced","pct":84},{"name":"Web GIS Dev (React, OpenLayers, Supabase)","lvl":"advanced","pct":82},{"name":"PostgreSQL / PostGIS · GeoServer · GeoNode","lvl":"advanced","pct":80},{"name":"ML for Remote Sensing (Random Forest, SVM, PCA)","lvl":"proficient","pct":78}],"softSkills":["Analytical thinking","Leadership","Project management","Public speaking","Scientific writing","Cross-team collaboration"],"tools":["ArcGIS Pro","ArcGIS Enterprise","QGIS","ENVI","SNAP","FUSION","Agisoft","Google Earth Engine","OpenLayers","Sentinel-2","PostgreSQL","PostGIS","GeoServer","GeoNode","Python","FastAPI","scikit-learn","React + Vite","Electron","TailwindCSS","Supabase","Robotic Total Station","GNSS/GPS","UAV/Drone"],"languages":[{"name":"Bahasa Indonesia","level":"Native / Bilingual"},{"name":"Bahasa Nias","level":"Native / Bilingual"},{"name":"English","level":"Limited Working"}],"documenter":[{"src":"uploads/docs/cjsbusbfwqjfweiq.jpg","place":"UAV / Drone survey","caption":"Field acquisition team"},{"src":"uploads/docs/1.jpg","place":"Komunitas Geosains UGM","caption":"Student-organization leadership"},{"src":"uploads/docs/de.jpg","place":"Fieldwork","caption":"Field documentation"},{"src":"uploads/docs/66.jpg","place":"Survey","caption":"Field survey"},{"src":"uploads/docs/565.jpg","place":"Fieldwork","caption":"Field documentation"},{"src":"uploads/docs/22.jpg","place":"Survey team","caption":"Fieldwork"},{"src":"uploads/docs/dasda.jpg","place":"Fieldwork","caption":"Field documentation"},{"src":"uploads/docs/2.jpg","place":"Survey","caption":"Field survey"},{"src":"uploads/docs/4.jpg","place":"Fieldwork","caption":"Field documentation"},{"src":"uploads/docs/csdsds.jpg","place":"Survey team","caption":"Fieldwork"},{"src":"uploads/docs/ds.jpg","place":"Fieldwork","caption":"Field documentation"},{"src":"uploads/docs/33.jpg","place":"Survey","caption":"Field survey"},{"src":"uploads/docs/3.jpg","place":"Fieldwork","caption":"Field documentation"},{"src":"uploads/docs/42432.jpg","place":"Survey team","caption":"Fieldwork"}]};
