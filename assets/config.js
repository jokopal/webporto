/* ============================================================
   config.js — SITE CONFIG + DEFAULT CONTENT (source of truth)
   ------------------------------------------------------------
   Everything below is editable:
     • by hand (edit this file, commit, redeploy), OR
     • live in the browser via the hidden Admin panel, OR
     • from a Google Sheet (see backend/google-apps-script.gs).

   Data-loading priority at runtime (assets/app.js):
     1. Google Sheets  (if MJG_CONFIG.sheets.enabled)
     2. localStorage   (admin edits saved in THIS browser)
     3. DEFAULT_DATA   (this file — always the fallback)
   ============================================================ */

window.MJG_CONFIG = {
  /* ---- Hidden Admin ----
     The site is static, so this password only gates the editing UI in the
     browser. For real multi-device persistence use Google Sheets (which can
     enforce a server-side token). CHANGE THIS before you deploy.        */
  admin: {
    // SHA-256 hash of your password. Default password below is "mjg-admin-2026".
    // Generate a new hash: open the site, open console, run:  await MJG.hash('your-new-pass')
    passwordHash: '4b705bf0ac58a93e3e89942b3ec616c3cded09e1907b4c3af6d3f8812ccf42f7',
    // Fallback plain password (used only if Web Crypto is unavailable / file://).
    // Leave empty to force hashed check. Kept for convenience on first setup:
    plainFallback: 'mjg-admin-2026',
    // Secret trigger: click the "MJG_OS" logo in the taskbar this many times
    // quickly to open the login. You can also visit the site with #admin.
    triggerClicks: 5,
    triggerWindowMs: 2500
  },

  /* ---- Google Sheets CMS (optional) ----
     Deploy backend/google-apps-script.gs as a Web App, paste its /exec URL
     here, set enabled:true, and set the same token in the Apps Script.     */
  sheets: {
    enabled: true,
    webAppUrl: 'https://script.google.com/macros/s/AKfycbxBU3HywK3gNrRG0xk0kDK1DqwwUtBp9lk9xb6hz5lPp8im58gozYFBR46aq5ME9ZAr2A/exec',
    token: ''           // ⚠ paste the SAME string as `var TOKEN` in your Apps Script (needed for admin "push to sheets")
  },

  map: {
    style: 'Positron',  // Positron | Voyager | Dark
    styles: {
      Positron: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      Voyager:  'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
      Dark:     'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
    },
    // Indonesia bounds [ [W,S],[E,N] ]
    bounds: [[95, -11], [141, 6]]
  },

  theme: { accent: '#E0533B', showGrid: true }
};

/* ============================================================
   DEFAULT_DATA — content model (from LinkedIn profile export)
   ============================================================ */
window.DEFAULT_DATA = {
  profile: {
    firstName: 'Menliman Joyfal',
    lastName: 'Gulo',
    greeting: "hi, i'm",
    roleChip: 'GIS · REMOTE SENSING · CARTOGRAPHY',
    headline: 'Research Assistant (Blue Carbon, UGM) · ex-Spatial Compliance Analyst @ Berau Coal · Geo-AI Enthusiast',
    summary: 'Geographic Information Science undergraduate at the Faculty of Geography, Universitas Gadjah Mada — specialising in GIS, cartography and remote sensing (LiDAR, aerial photography, radar) for coastal, agricultural and environmental mapping. Currently integrating machine learning with GIS to build Geo-AI solutions for agricultural yield prediction and land conservation.',
    location: 'Yogyakarta, Indonesia',
    coordLabel: '7.77°S 110.38°E',
    email: 'menlimanjoyfalgulo@gmail.com',
    linkedin: 'https://www.linkedin.com/in/menlimanjoyfalgulo',
    linkedinHandle: '/in/menlimanjoyfalgulo',
    photo: 'uploads/photo-1782995995213.png'
  },

  stats: [
    { num: '50+', lbl: 'students mentored' },
    { num: '4',   lbl: 'publications' },
    { num: '5',   lbl: 'national awards' }
  ],

  /* --- projects on the map. lng/lat are true WGS84 (EPSG:4326). --- */
  projects: [
    { name: 'Blue Carbon Research & Geospatial Labs', org: 'Faculty of Geography, UGM', period: '2024–now', place: 'Yogyakarta', lng: 110.3771, lat: -7.7669,
      blurb: 'Research assistant on blue-carbon mapping; lab instructor for LiDAR/radar remote sensing, land surveying, cartography and spatial-database practicums.' },
    { name: 'Spatial Compliance Analyst', org: 'Berau Coal — Dept. License', period: '2025', place: 'Berau, Kalimantan Timur', lng: 117.492, lat: 2.161,
      blurb: 'GIS & remote monitoring for mining-permit compliance; built spatial dashboards for permit boundaries, violation detection and inventory data.' },
    { name: 'IKN Deforestation & Air-Concentration Study', org: 'Presented at BIG Geomatika VII', period: '2024', place: 'IKN Nusantara, Kaltim', lng: 116.686, lat: -0.999,
      blurb: 'Main author on air-concentration change from deforestation in the new-capital (IKN) development zone; published in national proceedings.' },
    { name: 'Flood Vulnerability Analysis', org: 'Bengawan Solo Watershed', period: '2024', place: 'Sukoharjo, Central Java', lng: 110.836, lat: -7.681,
      blurb: 'Overlay-method flood-vulnerability mapping integrating mass-media flood reporting.' },
    { name: 'Tsunami Early-Warning System Survey', org: 'CV. Spiro Energy · BPBD', period: '2025', place: 'South Coast, Central Java', lng: 109.015, lat: -7.726,
      blurb: 'EWS field surveyor: inspected siren/transmitter towers and programmed radio frequencies with Motorola CPS for hazard mitigation.' },
    { name: 'Geomatics Seminar VII — Presenter', org: 'Badan Informasi Geospasial', period: '2024', place: 'Cibinong, West Java', lng: 106.854, lat: -6.482,
      blurb: 'Main author & presenter at the VII National Geomatics Seminar on geospatial information for the archipelago capital.' },
    { name: 'Roots — TKJ & First Maps', org: 'SMKN 1 Lolofitu Moi', period: '2019–22', place: 'Nias Barat', lng: 97.750, lat: 1.150,
      blurb: 'Computer & network engineering foundation on Nias island — where the geospatial journey began.' }
  ],

  /* --- full experience timeline (type: work | research | leadership | volunteer) --- */
  experience: [
    { role: 'Research Assistant', org: 'Faculty of Geography, UGM', period: 'Aug 2024 – Present', loc: 'Yogyakarta', type: 'research',
      desc: 'Blue-carbon research assistant. Also served as lab assistant across four practicums — Active-System Remote Sensing (LiDAR & radar via SNAP, ENVI, FUSION; 17 students), Land Surveying & Cartography (theodolite, robotic total station, waterpass; 16 students), and Spatial Database & SDI (ArcGIS Enterprise, GeoServer, PostgreSQL, GeoNode; 21 students).' },
    { role: 'Spatial Compliance Analyst — Dept. License', org: 'Berau Coal', period: 'Sep 2025 – Dec 2025', loc: 'Berau, Kalimantan Timur', type: 'work',
      desc: 'Used GIS and remote monitoring to ensure operational and regulatory compliance with mining permits and concessions. Built and maintained spatial analytical dashboards for real-time monitoring of permit boundaries, potential violations and inventory data — linking GIS with regulatory compliance and risk mitigation.' },
    { role: 'Student Trainee (Talent Development)', org: 'Sinarmas Agribusiness & Food · TDC UGM', period: 'Aug 2025 – Dec 2025', loc: 'Yogyakarta', type: 'work',
      desc: 'Talent-development program in digital innovation, human-capital strategy and sustainable agribusiness. Delivered an AI-driven capstone addressing ESG challenges in agribusiness, with actionable recommendations for sustainable and digital transformation.' },
    { role: 'Surveyor — Early Warning System', org: 'CV. Spiro Energy', period: 'Aug 2025', loc: 'Central Java', type: 'work',
      desc: 'EWS surveyor & intern technician supporting disaster mitigation. Inspected and tested tsunami-EWS towers (sirens, transmitters) with the BPBD team and applied radio-frequency programming via Motorola CPS to ensure early-warning communication reliability.' },
    { role: 'Presenter — Geomatika VII Seminar', org: 'Badan Informasi Geospasial (BIG)', period: 'May 2024', loc: 'Cibinong, West Java', type: 'research',
      desc: 'Main author & presenter at the VII National Geomatics Seminar. Paper "Changes in Air Concentration Against Deforestation of IKN" was selected for the official national proceedings.' },
    { role: 'President', org: 'Komunitas Geosains UGM', period: 'Jan 2024 – Dec 2024', loc: 'Yogyakarta', type: 'leadership',
      desc: 'Led geoscience education, research and student engagement. Secured 6 competition wins and 1 national proceedings publication; organised academic events and geoscience campaigns.' },
    { role: 'General Coordinator — UKK CUP 2024', org: 'UKK UGM', period: 'Apr 2024 – Nov 2024', loc: 'Yogyakarta', type: 'leadership',
      desc: 'Led planning and execution of a large inter-campus event, managing cross-functional teams, budget and logistics end-to-end.' },
    { role: 'Head of Division 4 (Logistics & PR)', org: 'MAPALA GEGAMA', period: 'Oct 2023 – Oct 2024', loc: 'Yogyakarta', type: 'leadership',
      desc: 'Led logistics and public-relations sub-divisions; also active as survivor & rock-climber (navigation, camping, SOP for field activities).' },
    { role: 'Head of Internal Affairs', org: 'Indonesian Climate Change Initiative UGM', period: 'Aug 2023 – Jan 2024', loc: 'Yogyakarta', type: 'leadership',
      desc: 'Directed internal communications and operations for climate-change initiatives; drove strategic plans and cross-team collaboration.' },
    { role: 'Ministry of Social Affairs Staff', org: 'BEM Fakultas Geografi UGM', period: 'Aug 2022 – Apr 2024', loc: 'Yogyakarta', type: 'volunteer',
      desc: 'Designed and delivered community-service programs (training, counselling, field activities) with multiple stakeholders; coordinated volunteers and evaluated impact.' },
    { role: 'Co-Facilitator (Cofas)', org: 'PPSMB UGM', period: 'Mar 2023 – Sep 2023', loc: 'Yogyakarta', type: 'volunteer',
      desc: 'Selected through a competitive process to mentor new students — public speaking, ice-breakers and creative material delivery in the Herman Yohanes cluster.' },
    { role: 'Freelance Video Editor', org: 'ExcellencIA Learning Center & Consultant', period: 'Nov 2023 – Jan 2024', loc: 'Remote', type: 'work',
      desc: 'Edited video courses and consulting content remotely using CapCut and DaVinci Resolve.' }
  ],

  expertise: [
    { code: 'gis.analysis', title: 'GIS Analysis', desc: 'Spatial modelling, overlay analysis and enterprise geodatabases — from mining-permit compliance to flood-vulnerability mapping.', tags: ['ArcGIS Enterprise','PostGIS','GeoServer','spatial queries'] },
    { code: 'remote.sensing', title: 'Remote Sensing', desc: 'Active & passive sensing — LiDAR, radar/SAR and aerial/satellite imagery for coastal, agricultural and environmental monitoring.', tags: ['LiDAR','Radar/SAR','SNAP','ENVI'] },
    { code: 'cartography', title: 'Cartography & Surveying', desc: 'Thematic map design and land surveying — theodolite, robotic total station and waterpass translated into clear visual data.', tags: ['thematic maps','total station','waterpass'] },
    { code: 'geo.ai', title: 'Geo-AI', desc: 'Integrating machine learning with GIS for agricultural yield prediction, land conservation and ESG decision support.', tags: ['ML + GIS','Python','yield prediction'] }
  ],

  education: [
    { period: 'Jul 2022 – Jun 2026', school: 'Universitas Gadjah Mada', degree: "Bachelor's — Cartography & Remote Sensing (Kartografi & Penginderaan Jauh)" },
    { period: 'Jun 2019 – May 2022', school: 'SMK Negeri 1 Lolofitu Moi', degree: 'Computer & Network Engineering (Teknik Komputer & Jaringan)' }
  ],

  awards: [
    '2nd Place — Business Challenge Track, Astranauts 2024',
    '3rd Place — Scientific Writing Competition, LOGIN 2024',
    '1st Runner-Up — Sotech Competition (Technology)',
    'National Poetry Finalist & author of "No Longer Looking for Cemara"',
    'Finalist — National Essay Competition, IDEA FEST'
  ],

  pubs: [
    'Air-Concentration Change from Deforestation of the IKN Area (national proceedings)',
    'Flood Vulnerability Analysis of the Bengawan Solo Watershed, Sukoharjo (overlay method)',
    'IoT-Based Urban Portable Agriculture System: Technical Validation of a Low-Cost Hydroponic Monitoring Platform',
    'Fintech Innovation: Enhancing the Sustainability of Micro, Small & Medium Enterprises'
  ],

  certifications: [
    'Kelompok Materi Pelatihan Dasar (KMPD)',
    'KMPL Pekerja Kantor dan Dapur'
  ],

  hardSkills: [
    { name: 'ArcGIS / ArcGIS Enterprise', lvl: 'expert', pct: 92 },
    { name: 'Remote Sensing (LiDAR & Radar)', lvl: 'advanced', pct: 86 },
    { name: 'Cartography & Land Surveying', lvl: 'advanced', pct: 84 },
    { name: 'PostgreSQL / PostGIS · GeoServer', lvl: 'advanced', pct: 80 },
    { name: 'Python (GeoPandas, rasterio)', lvl: 'proficient', pct: 74 },
    { name: 'Geo-AI / Machine Learning', lvl: 'proficient', pct: 70 }
  ],

  softSkills: ['Analytical thinking','Leadership','Project management','Public speaking','Cross-team collaboration','Hazard mitigation'],

  tools: ['ArcGIS Pro','ArcGIS Enterprise','QGIS','GeoServer','GeoNode','PostgreSQL','PostGIS','SNAP','ENVI','FUSION','Google Earth Engine','Python','Robotic Total Station','AI-assisted dev'],

  languages: [
    { name: 'Bahasa Nias', level: 'Native / Bilingual' },
    { name: 'Bahasa Indonesia', level: 'Native / Bilingual' },
    { name: 'English', level: 'Limited Working' }
  ]
};
