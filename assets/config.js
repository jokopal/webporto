/* ============================================================
   config.js — SITE CONFIG + DEFAULT CONTENT (source of truth)
   ------------------------------------------------------------
   Editable by hand (this file), via the hidden Admin panel, or
   from a Google Sheet (backend/google-apps-script.gs).

   Runtime priority (assets/app.js):
     1. Google Sheets  (if MJG_CONFIG.sheets.enabled)
     2. localStorage   (admin edits saved in THIS browser)
     3. DEFAULT_DATA   (this file — always the fallback)
   ============================================================ */

window.MJG_CONFIG = {
  admin: {
    // SHA-256 of the admin password. Default password: "mjg-admin-2026".
    // New hash: open site → console → await MJG.hash('your-new-pass')
    passwordHash: '4b705bf0ac58a93e3e89942b3ec616c3cded09e1907b4c3af6d3f8812ccf42f7',
    plainFallback: 'mjg-admin-2026',   // set '' to force hashed-only
    triggerClicks: 5,
    triggerWindowMs: 2500
  },

  /* Google Sheets CMS — the LIVE source once the Web App is public ("Anyone"). */
  sheets: {
    enabled: true,
    webAppUrl: 'https://script.google.com/macros/s/AKfycbxBU3HywK3gNrRG0xk0kDK1DqwwUtBp9lk9xb6hz5lPp8im58gozYFBR46aq5ME9ZAr2A/exec',
    token: 'ca46c52855953e629d0950e4d4533185bc813b44217a4099'  // must match `var TOKEN` in the Apps Script
  },

  map: {
    style: 'Positron',
    styles: {
      Positron: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      Voyager:  'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
      Dark:     'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
    },
    bounds: [[95, -11], [141, 6]]
  },

  theme: { accent: '#E0533B', showGrid: true }
};

/* ============================================================
   DEFAULT_DATA — content model (from LinkedIn export + updates)
   ============================================================ */
window.DEFAULT_DATA = {
  profile: {
    firstName: 'Menliman Joyfal',
    lastName: 'Gulo',
    greeting: "hi, i'm",
    roleChip: 'GIS · REMOTE SENSING · GEO-AI',
    headline: 'Independent GIS Developer (Jokopal) · Remote Sensing & GIS @ Seacrest Indonesia · Research Assistant, Blue Carbon UGM',
    summary: 'Geographic Information Science undergraduate at the Faculty of Geography, Universitas Gadjah Mada — specialising in GIS, cartography and remote sensing (LiDAR, radar, satellite imagery) for coastal, agricultural and environmental mapping, with a focus on blue-carbon and marine water-quality monitoring. I also build independent GIS products as "Jokopal" — the web app shpaid.com and the open-source Bluemap — integrating machine learning with GIS for Geo-AI solutions.',
    location: 'Yogyakarta, Indonesia',
    coordLabel: '7.77°S 110.38°E',
    email: 'menlimanjoyfalgulo@gmail.com',
    linkedin: 'https://www.linkedin.com/in/menlimanjoyfalgulo',
    linkedinHandle: '/in/menlimanjoyfalgulo',
    photo: 'uploads/photo-1782995995213.png'
  },

  stats: [
    { num: '2',   lbl: 'independent GIS products' },
    { num: '50+', lbl: 'students mentored' },
    { num: '5',   lbl: 'publications & releases' },
    { num: '5',   lbl: 'national awards' }
  ],

  /* projects on the map — lng/lat are true WGS84 (EPSG:4326).
     Newest / independent work first. Edit coords in Admin ▸ Projects. */
  projects: [
    { name: 'Bluemap — Blue-Carbon & Coastal Mapping', org: 'Independent · Jokopal · Zenodo', period: '2026', place: 'Pulau Banyak, Aceh', lng: 97.32, lat: 2.07,
      blurb: 'Independent GIS tool/dataset for blue-carbon & coastal mapping, released openly on Zenodo. Study area: the Banyak Islands. → zenodo.org/records/20457262' },
    { name: 'shpaid.com — Independent GIS Web App', org: 'Independent · Jokopal', period: '2025–now', place: 'Bali (validation site)', lng: 115.14, lat: -8.40,
      blurb: 'Self-built, AI-assisted GIS web application shipped end-to-end as an indie product. Location-based validation across Bali. → shpaid.com' },
    { name: 'COAST TA — Blue-Carbon Rehabilitation Study', org: 'Seacrest Indonesia', period: '2026', place: 'Central Java coast', lng: 110.64, lat: -6.90,
      blurb: 'Remote-sensing assistant on a feasibility study for blue-carbon ecosystem rehabilitation: satellite dataset, land-classification & stratification maps, multi-layer overlays and village-level recap — six deliverables under a results-based contract.' },
    { name: 'Coastal Water-Quality Monitoring', org: 'Wildlife Conservation Society', period: '2026', place: 'West Nusa Tenggara', lng: 116.35, lat: -8.60,
      blurb: 'Satellite (Sentinel-2, bi-seasonal 2018–2026) estimation of TSS, Chlorophyll-a and Salinity across NTB aquaculture zones & Marine Protected Areas; algorithm benchmarking vs in-situ, compliant with PP 22/2021.' },
    { name: 'Coastal Water-Quality Monitoring', org: 'Wildlife Conservation Society', period: '2026', place: 'Bolaang Mongondow Selatan', lng: 123.98, lat: 0.36,
      blurb: 'Second WCS cluster — bi-seasonal Sentinel-2 water-quality mapping and marine spatial-planning support for South Bolaang Mongondow, North Sulawesi.' },
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

  /* experience timeline — type: product | work | research | leadership | volunteer
     `link` is optional; when present it renders a clickable chip. */
  experience: [
    { role: 'Independent GIS Developer — shpaid.com', org: 'Jokopal (self-initiated)', period: '2025 – Present', loc: 'Independent', type: 'product', link: 'https://shpaid.com',
      desc: 'Founder & developer of shpaid.com — an independent, AI-assisted GIS web application built and shipped end-to-end as an indie product under the handle Jokopal.' },
    { role: 'Independent GIS Developer — Bluemap', org: 'Jokopal · Zenodo', period: '2026', loc: 'Independent', type: 'product', link: 'https://zenodo.org/records/20457262',
      desc: 'Bluemap — an independent GIS tool/dataset for blue-carbon & coastal mapping, released openly on Zenodo (DOI record) under the handle Jokopal. Recent study areas include the Banyak Islands and Bali.' },
    { role: 'Assistant Specialist, Remote Sensing & GIS — COAST TA Project', org: 'Seacrest Indonesia', period: 'Jul 2026 – Present', loc: 'Central Java (coastal)', type: 'work',
      desc: 'Remote-sensing assistant on a 10-week feasibility study for blue-carbon ecosystem rehabilitation in Central Java. Delivered a full satellite imagery dataset, land-classification and stratification maps/tables, RS methodology documentation, a multi-layer spatial overlay, and village-level recap — all six analytical deliverables on schedule under a results-based contract.' },
    { role: 'Remote Sensing — Coastal Water-Quality Monitoring', org: 'Wildlife Conservation Society', period: 'Jun 2026 – Jul 2026', loc: 'NTB & Bolaang Mongondow Selatan', type: 'research',
      desc: 'Satellite water-quality monitoring across West Nusa Tenggara (aquaculture zones & MPAs) and South Bolaang Mongondow using bi-seasonal Sentinel-2 (2018–2026) to estimate TSS, Chlorophyll-a and Salinity. Benchmarked RS algorithms, validated against in-situ sampling, and confirmed compliance with PP 22/2021; compiled technical reports for marine spatial planning.' },
    { role: 'Research Assistant', org: 'Faculty of Geography, UGM (Blue Carbon Research Group)', period: 'Aug 2024 – Present', loc: 'Yogyakarta', type: 'research',
      desc: 'Blue-carbon research assistant. Also lab assistant across four practicums — Active-System Remote Sensing (LiDAR & radar via SNAP, ENVI, FUSION; 17 students), Land Surveying & Cartography (theodolite, robotic total station, waterpass; 16 students), and Spatial Database & SDI (ArcGIS Enterprise, GeoServer, PostgreSQL, GeoNode; 21 students).' },
    { role: 'Spatial Compliance Analyst — Dept. License', org: 'Berau Coal', period: 'Sep 2025 – Dec 2025', loc: 'Berau, Kalimantan Timur', type: 'work',
      desc: 'Used GIS and remote monitoring to ensure operational and regulatory compliance with mining permits and concessions. Built spatial analytical dashboards for real-time monitoring of permit boundaries, potential violations and inventory data — linking GIS with regulatory compliance and risk mitigation.' },
    { role: 'Student Trainee (Talent Development)', org: 'Sinarmas Agribusiness & Food · TDC UGM', period: 'Aug 2025 – Dec 2025', loc: 'Yogyakarta', type: 'work',
      desc: 'Talent-development program in digital innovation, human-capital strategy and sustainable agribusiness. Delivered an AI-driven capstone addressing ESG challenges in agribusiness, with actionable recommendations for sustainable and digital transformation.' },
    { role: 'Surveyor — Early Warning System', org: 'CV. Spiro Energy', period: 'Aug 2025', loc: 'Central Java', type: 'work',
      desc: 'EWS surveyor & intern technician supporting disaster mitigation. Inspected and tested tsunami-EWS towers (sirens, transmitters) with the BPBD team and applied radio-frequency programming via Motorola CPS to ensure early-warning communication reliability.' },
    { role: 'Presenter — Geomatika VII Seminar', org: 'Badan Informasi Geospasial (BIG)', period: 'May 2024', loc: 'Cibinong, West Java', type: 'research',
      desc: 'Main author & presenter at the VII National Geomatics Seminar. Paper "Changes in Air Concentration Against Deforestation of IKN" was selected for the official national proceedings.' },
    { role: 'President', org: 'Komunitas Geosains UGM', period: 'Jan 2024 – Dec 2024', loc: 'Yogyakarta', type: 'leadership',
      desc: 'Led geoscience education, research and student engagement. Secured 6 competition wins and 1 national proceedings publication; organised academic events and geoscience campaigns.' },
    { role: 'Head of Internal Affairs', org: 'Indonesian Climate Change Initiative UGM', period: 'Aug 2023 – Jan 2024', loc: 'Yogyakarta', type: 'leadership',
      desc: 'Directed internal communications and operations for climate-change initiatives; drove strategic plans and cross-team collaboration.' },
    { role: 'Freelance Video Editor', org: 'ExcellencIA Learning Center & Consultant', period: 'Nov 2023 – Jan 2024', loc: 'Remote', type: 'work',
      desc: 'Edited video courses and consulting content remotely using CapCut and DaVinci Resolve.' }
  ],

  expertise: [
    { code: 'indie.dev', title: 'Independent GIS Products', desc: 'Building & shipping GIS web apps and open tools end-to-end as an indie developer (AI-assisted) — e.g. shpaid.com and the open-source Bluemap.', tags: ['shpaid.com', 'Bluemap', 'Web GIS', 'AI-assisted dev'] },
    { code: 'remote.sensing', title: 'Remote Sensing', desc: 'Active & passive sensing — LiDAR, radar/SAR and satellite imagery (Sentinel-2) for coastal, blue-carbon, water-quality and environmental monitoring.', tags: ['LiDAR', 'Radar/SAR', 'Sentinel-2', 'SNAP · ENVI'] },
    { code: 'gis.analysis', title: 'GIS Analysis', desc: 'Spatial modelling, overlay analysis and enterprise geodatabases — from mining-permit compliance to flood-vulnerability and marine spatial planning.', tags: ['ArcGIS Enterprise', 'PostGIS', 'GeoServer', 'GEE'] },
    { code: 'cartography', title: 'Cartography & Surveying', desc: 'Thematic map design and land surveying — theodolite, robotic total station and waterpass translated into clear visual data.', tags: ['thematic maps', 'total station', 'waterpass'] },
    { code: 'geo.ai', title: 'Geo-AI', desc: 'Integrating machine learning with GIS for yield prediction, land conservation, water-quality retrieval and ESG decision support.', tags: ['ML + GIS', 'Python', 'yield prediction'] }
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
    'Bluemap — blue-carbon & coastal mapping tool/dataset (open release, Zenodo: zenodo.org/records/20457262)',
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
    { name: 'Remote Sensing (LiDAR, Radar, Sentinel-2)', lvl: 'advanced', pct: 87 },
    { name: 'Cartography & Land Surveying', lvl: 'advanced', pct: 84 },
    { name: 'PostgreSQL / PostGIS · GeoServer', lvl: 'advanced', pct: 80 },
    { name: 'Web GIS / App Dev (AI-assisted)', lvl: 'proficient', pct: 78 },
    { name: 'Python (GeoPandas, rasterio) · Geo-AI', lvl: 'proficient', pct: 74 }
  ],

  softSkills: ['Analytical thinking', 'Leadership', 'Project management', 'Public speaking', 'Cross-team collaboration', 'Hazard mitigation'],

  tools: ['ArcGIS Pro', 'ArcGIS Enterprise', 'QGIS', 'GeoServer', 'GeoNode', 'PostgreSQL', 'PostGIS', 'SNAP', 'ENVI', 'FUSION', 'Sentinel-2', 'Google Earth Engine', 'Python', 'JavaScript / Web', 'Robotic Total Station', 'AI-assisted dev'],

  languages: [
    { name: 'Bahasa Nias', level: 'Native / Bilingual' },
    { name: 'Bahasa Indonesia', level: 'Native / Bilingual' },
    { name: 'English', level: 'Limited Working' }
  ]
};
