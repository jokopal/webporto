/* ============================================================
   config.js - SITE CONFIG + DEFAULT CONTENT (source of truth)
   ------------------------------------------------------------
   Editable by hand (this file), via the hidden Admin panel, or
   from a Google Sheet (backend/google-apps-script.gs).

   Runtime priority (assets/app.js):
     1. Google Sheets  (if MJG_CONFIG.sheets.enabled) - stale-while-revalidate
     2. localStorage   (admin edits saved in THIS browser)
     3. DEFAULT_DATA   (this file - always the fallback)
   ============================================================ */

window.MJG_CONFIG = {
  admin: {
    // SHA-256 of the admin password. Default password: "mjg-admin-2026".
    // New hash: open site -> console -> await MJG.hash('your-new-pass')
    passwordHash: '4b705bf0ac58a93e3e89942b3ec616c3cded09e1907b4c3af6d3f8812ccf42f7',
    plainFallback: 'mjg-admin-2026',   // set '' to force hashed-only
    triggerClicks: 5,
    triggerWindowMs: 2500
  },

  /* Google Sheets CMS - the LIVE source once the Web App is public ("Anyone"). */
  sheets: {
    enabled: true,
    webAppUrl: 'https://script.google.com/macros/s/AKfycbxBU3HywK3gNrRG0xk0kDK1DqwwUtBp9lk9xb6hz5lPp8im58gozYFBR46aq5ME9ZAr2A/exec',
    token: 'ca46c52855953e629d0950e4d4533185bc813b44217a4099'  // must match `var TOKEN` in the Apps Script
  },

  /* Auto-refresh: pull the live sheet every N seconds (toggle in the taskbar). */
  autoRefresh: { seconds: 5, defaultOn: false },

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
   DEFAULT_DATA - content model (from LinkedIn export + updates)
   ============================================================ */
window.DEFAULT_DATA = {
  profile: {
    firstName: 'Menliman Joyfal',
    lastName: 'Gulo',
    greeting: "hi, i'm",
    roleChip: 'GIS · REMOTE SENSING · GEO-AI',
    headline: 'Independent GIS Developer (Jokopal) | Remote Sensing & GIS at Seacrest Indonesia and WCS | Blue Carbon Research, UGM',
    summary: 'Geographic Information Science undergraduate at the Faculty of Geography, Universitas Gadjah Mada, specialising in GIS, cartography and remote sensing (Sentinel-2, LiDAR, radar) for blue-carbon, seagrass and coastal water-quality mapping. I also build independent GIS products as Jokopal: the web app Shp.Aid and the open-source BlueMap, integrating machine learning with GIS for Geo-AI solutions.',
    location: 'Yogyakarta, Indonesia',
    coordLabel: '7.77°S 110.38°E',
    email: 'menlimanjoyfalgulo@gmail.com',
    linkedin: 'https://www.linkedin.com/in/menlimanjoyfalgulo',
    linkedinHandle: '/in/menlimanjoyfalgulo',
    photo: 'uploads/photo-1782995995213.png'
  },

  stats: [
    { num: '4',   lbl: 'independent products' },
    { num: '50+', lbl: 'students mentored' },
    { num: '7',   lbl: 'publications & releases' },
    { num: '5',   lbl: 'national awards' }
  ],

  /* Independent GIS products (separate from experience). */
  products: [
    { name: 'Shp.Aid', tagline: 'Web GIS toolkit for spatial data', period: '2025 - Present', status: 'Live',
      link: 'https://shpaid.com', tech: ['Web GIS', 'JavaScript', 'AI-assisted'],
      desc: 'Independent, AI-assisted web application for working with shapefiles and geospatial data end to end. Built, shipped and maintained solo as Jokopal.' },
    { name: 'BlueMap', tagline: 'Blue-carbon & coastal mapping', period: '2026', status: 'Open release (Zenodo)',
      link: 'https://zenodo.org/records/20457262', tech: ['Remote Sensing', 'Geospatial', 'AI-assisted'],
      desc: 'Remote-sensing and geospatial application for blue-carbon and coastal habitat mapping, released openly on Zenodo with a citable DOI.' },
    { name: 'L.E.A.D Logbook Automation', tagline: 'Digital logbook & report automation', period: 'Sep 2025 - Nov 2025', status: 'Delivered (team of 3)',
      link: '', tech: ['React.js', 'TailwindCSS', 'UI/UX'],
      desc: 'Frontend for PT Berau Coal\'s Learning, Evaluation & Activity Development app. Engineered the modern, responsive interface for logbook and report-automation features, integrated with backend services.' },
    { name: 'WEB GIS - Spatial Licence Dashboard', tagline: 'Mining-licence spatial dashboard', period: 'Sep 2025 - Nov 2025', status: 'Delivered',
      link: '', tech: ['OpenLayers', 'AlpineJS', 'Supabase/PostGIS', 'RBAC'],
      desc: 'Full-stack web GIS for PT Berau Coal visualising mining-licensing data with interactive maps and real-time analytics. Secure Supabase (PostgreSQL/PostGIS) backend with Role-Based Access Control.' }
  ],

  /* projects on the map - lng/lat are true WGS84 (EPSG:4326). Field footprint. */
  projects: [
    { name: 'GEE Training, Benthic Habitat Mapping', org: 'GGGI Indonesia', period: '2025', place: 'Jakarta', lng: 106.827, lat: -6.175,
      blurb: 'Co-trainer for intermediate Google Earth Engine training (Sentinel-2, Random Forest) supporting national benthic-habitat mapping.' },
    { name: 'COAST TA, Blue-Carbon Rehabilitation', org: 'Seacrest Indonesia', period: '2026', place: 'Central Java coast', lng: 110.64, lat: -6.90,
      blurb: 'Feasibility study for blue-carbon ecosystem rehabilitation: satellite dataset, classification and stratification maps, six deliverables.' },
    { name: 'Coastal Water-Quality (MPAs & Aquaculture)', org: 'Wildlife Conservation Society', period: '2026', place: 'West Nusa Tenggara', lng: 116.35, lat: -8.60,
      blurb: 'Sentinel-2 monitoring across 347 aquaculture zones and 16 Marine Protected Areas (TSS, Chlorophyll-a, Salinity) for marine spatial planning.' },
    { name: 'TSS Monitoring (ZOM 497)', org: 'Wildlife Conservation Society', period: '2026', place: 'South Bolaang Mongondow', lng: 123.98, lat: 0.36,
      blurb: 'Multi-temporal TSS mapping with 17 Sentinel-2 scenes and 7 algorithms; compliance with PP 22/2021 confirmed.' },
    { name: 'EQUITY WCU Benthic & Seagrass Survey', org: 'Blue Carbon Research Group, UGM', period: '2025', place: 'Sanur & Tanjung Benoa, Bali', lng: 115.24, lat: -8.72,
      blurb: 'Field data collection of benthic and seagrass habitats along Bali coasts for the EQUITY World Class University program.' },
    { name: 'National Seagrass Map, Field Survey', org: 'Blue Carbon Research Group, UGM', period: '2024-25', place: 'Madura, East Java', lng: 113.47, lat: -7.02,
      blurb: 'Benthic and seagrass field survey along the north coast of East Java for the Indonesia Seagrass Map.' },
    { name: 'National Seagrass Map, Field Survey', org: 'Blue Carbon Research Group, UGM', period: '2024-25', place: 'Pulau Banyak, Aceh', lng: 97.32, lat: 2.07,
      blurb: 'Benthic and seagrass field survey in the Banyak Islands for the Indonesia Seagrass Map: Framework and Implementation.' },
    { name: 'Seagrass Dynamics Study', org: 'Regional Studies in Marine Science', period: '2024', place: 'Kuta Mandalika, Lombok', lng: 116.28, lat: -8.89,
      blurb: 'Case study mapping seagrass dynamics in a developing coastal area (journal publication).' },
    { name: 'Rapid Flood Mapping (Disaster Charter)', org: 'UGM · Volunteer', period: '2025', place: 'Aceh & Sumatra', lng: 97.50, lat: 3.50,
      blurb: 'Volunteer geospatial analyst: pre and post-disaster interpretation and digitisation of flood and landslide extents to BRIN standards.' },
    { name: 'Urban Portable Agriculture (SOTECH 2024)', org: 'Komunitas Geosains UGM', period: '2024', place: 'Plaju, Palembang', lng: 104.82, lat: -3.00,
      blurb: 'Integrated vertical-farming system; 1st runner-up (technology) at Sotech Pertamina 2024.' },
    { name: 'Spatial Compliance & WEB GIS Licence', org: 'PT Berau Coal', period: '2025', place: 'Berau, Kalimantan Timur', lng: 117.492, lat: 2.161,
      blurb: 'Mining-permit compliance monitoring plus a full-stack spatial-licence dashboard (OpenLayers, Supabase/PostGIS, RBAC).' },
    { name: 'IKN Deforestation & Air-Concentration Study', org: 'Presented at BIG Geomatika VII', period: '2024', place: 'IKN Nusantara', lng: 116.686, lat: -0.999,
      blurb: 'Main author on air-concentration change from deforestation in the new-capital zone; national proceedings.' },
    { name: 'Flood Vulnerability Analysis', org: 'Bengawan Solo Watershed', period: '2024', place: 'Sukoharjo, Central Java', lng: 110.836, lat: -7.681,
      blurb: 'Overlay-method flood-vulnerability mapping integrating mass-media flood reporting.' },
    { name: 'Tsunami Early-Warning System Survey', org: 'CV. Spiro Energy · BPBD', period: '2025', place: 'South Coast, Central Java', lng: 109.015, lat: -7.726,
      blurb: 'EWS field surveyor: siren/transmitter tower inspection and Motorola CPS radio-frequency programming.' },
    { name: 'Blue Carbon Research & Geospatial Labs', org: 'Faculty of Geography, UGM', period: '2024-now', place: 'Yogyakarta', lng: 110.3771, lat: -7.7669,
      blurb: 'Blue-carbon research and lab instruction: remote sensing, land surveying, cartography and spatial databases.' },
    { name: 'Roots, TKJ & First Maps', org: 'SMKN 1 Lolofitu Moi', period: '2019-22', place: 'Nias Barat', lng: 97.750, lat: 1.150,
      blurb: 'Computer & network engineering foundation on Nias island, where the geospatial journey began.' }
  ],

  /* experience timeline - type: work | research | leadership | volunteer */
  experience: [
    { role: 'Co-Trainer & Technical Facilitator, Intermediate GEE Training', org: 'GGGI Indonesia', period: 'Dec 2025', loc: 'Jakarta', type: 'work', link: '',
      desc: 'Facilitated intermediate Google Earth Engine training on live-coding workflows for Sentinel-2 processing, Random Forest classification and accuracy assessment, supporting standardised national benthic-habitat mapping and blue-carbon monitoring.' },
    { role: 'Assistant Specialist, Remote Sensing & GIS (COAST TA)', org: 'Seacrest Indonesia', period: 'Jul 2026 - Present', loc: 'Central Java (coastal)', type: 'work', link: '',
      desc: 'Remote-sensing assistant on a 10-week feasibility study for blue-carbon ecosystem rehabilitation. Delivered a full satellite dataset, land-classification and stratification maps/tables, RS methodology documentation, a multi-layer overlay and village-level recap: six deliverables on schedule under a results-based contract.' },
    { role: 'Remote Sensing Analyst, Coastal Water-Quality (MPAs & Aquaculture)', org: 'Wildlife Conservation Society', period: 'Jul 2026 - Present', loc: 'West Nusa Tenggara', type: 'research', link: '',
      desc: 'Monitored water quality across 347 aquaculture zones and 16 Marine Protected Areas using bi-seasonal Sentinel-2 (2023 to 2026) to estimate TSS, Chlorophyll-a and Salinity. Benchmarked algorithms per parameter, analysed seasonal and spatial trends, and delivered technical reports for marine spatial planning and conservation zoning.' },
    { role: 'Remote Sensing Analyst, TSS Monitoring (ZOM 497)', org: 'Wildlife Conservation Society', period: 'Jun 2026 - Jul 2026', loc: 'South Bolaang Mongondow', type: 'research', link: '',
      desc: 'Led multi-temporal TSS monitoring with 17 Sentinel-2 scenes (2018 to 2026), comparing 7 retrieval algorithms validated against in-situ sampling. Identified Jaelani et al. (2016) as best-performing and confirmed compliance with PP 22/2021, delivering a technical report on coastal water-quality status.' },
    { role: 'Volunteer Geospatial Analyst, Disaster Charter Rapid Flood Mapping', org: 'Universitas Gadjah Mada', period: 'Dec 2025', loc: 'Aceh, West & North Sumatra', type: 'volunteer', link: '',
      desc: 'Rapid flood mapping in Sumatra: pre and post-disaster satellite image interpretation, digitisation of flood and landslide extents (polygon) and affected buildings/infrastructure (point), attributed to BRIN geospatial standards for disaster-impact assessment and emergency response.' },
    { role: 'Field Surveyor, EQUITY WCU Benthic & Seagrass Survey', org: 'Blue Carbon Research Group, UGM', period: '2025', loc: 'Sanur & Tanjung Benoa, Bali', type: 'research', link: '',
      desc: 'Field data collection of benthic and seagrass habitats along Bali coasts for the EQUITY WCU program (Enhancing Quality Education for International University Impacts and Recognition, World Class University).' },
    { role: 'Field Surveyor, National Seagrass Map', org: 'Blue Carbon Research Group, UGM', period: '2024 - 2025', loc: 'Madura (East Java) & Pulau Banyak (Aceh)', type: 'research', link: '',
      desc: 'Field surveys of benthic and seagrass habitats along the north coast of East Java (Madura) and the Banyak Islands (Aceh) for the National Seagrass Map, part of the Indonesia Seagrass Map: Framework and Implementation.' },
    { role: 'Spatial Compliance Analyst, Dept. License', org: 'PT Berau Coal', period: 'Sep 2025 - Dec 2025', loc: 'Berau, Kalimantan Timur', type: 'work', link: '',
      desc: 'GIS and remote monitoring for mining-permit compliance; built spatial dashboards for permit boundaries, violation detection and inventory data, linking GIS with regulatory compliance and risk mitigation.' },
    { role: 'Student Trainee (Talent Development)', org: 'Sinarmas Agribusiness & Food · TDC UGM', period: 'Aug 2025 - Dec 2025', loc: 'Yogyakarta', type: 'work', link: '',
      desc: 'Talent-development program in digital innovation, human-capital strategy and sustainable agribusiness; delivered an AI-driven capstone on ESG challenges with actionable recommendations.' },
    { role: 'Surveyor, Tsunami Early-Warning System', org: 'CV. Spiro Energy', period: 'Aug 2025', loc: 'Central Java', type: 'work', link: '',
      desc: 'EWS surveyor and intern technician: inspected and tested siren/transmitter towers with the BPBD team and applied radio-frequency programming via Motorola CPS for reliable early-warning communication.' },
    { role: 'Research Assistant, Blue Carbon Research Group', org: 'Faculty of Geography, UGM', period: 'Aug 2024 - Present', loc: 'Yogyakarta', type: 'research', link: '',
      desc: 'Blue-carbon research assistant and lab assistant across four practicums: Active-System Remote Sensing (LiDAR & radar; 17 students), Land Surveying & Cartography (16 students), and Spatial Database & SDI (ArcGIS Enterprise, GeoServer, PostgreSQL, GeoNode; 21 students).' },
    { role: 'Project Member, Indonesia Seagrass Map: Framework & Implementation', org: 'Blue Carbon Research Group, UGM', period: 'Mar 2024 - Oct 2025', loc: 'Indonesia', type: 'research', link: '',
      desc: 'National benthic and seagrass habitat mapping in collaboration with UGM, KKP, BRIN, BIG and The University of Queensland (supported by the David & Lucile Packard Foundation): field surveys, spatial data processing and analysis for seagrass conservation.' },
    { role: 'Undergraduate Researcher, Blue Carbon & Seagrass Mapping (ML + Multispectral RS)', org: 'UGM (Fundamental Research Grant 2024)', period: 'Dec 2024', loc: 'Yogyakarta', type: 'research', link: '',
      desc: 'Applied multispectral remote sensing and machine learning to rapid mapping of seagrass carbon stocks and sequestration: feature engineering (deglint bands, DII, PCA, KPCA), regression-model comparison and spatial upscaling for standardised blue-carbon monitoring.' },
    { role: 'Geoscience Team, Urban Portable Agriculture (SOTECH Pertamina 2024)', org: 'Komunitas Geosains UGM', period: 'May 2024 - Jul 2024', loc: 'Plaju, Palembang', type: 'leadership', link: '',
      desc: 'Built the Urban Portable Agriculture (UPA) integrated vertical-farming system for land-limited urban areas in the Mina Padi program with PT Kilang Pertamina RU III Plaju and AntaraDjaya Indonesia. Secured 1st runner-up (technology) at Sotech 2024.' },
    { role: 'Presenter, Geomatika VII National Seminar', org: 'Badan Informasi Geospasial (BIG)', period: 'May 2024', loc: 'Cibinong, West Java', type: 'research', link: '',
      desc: 'Main author and presenter; paper "Changes in Air Concentration Against Deforestation of IKN" selected for the official national proceedings.' },
    { role: 'President', org: 'Komunitas Geosains UGM', period: 'Jan 2024 - Dec 2024', loc: 'Yogyakarta', type: 'leadership', link: '',
      desc: 'Led geoscience education, research and student engagement; secured 6 competition wins and 1 national proceedings publication.' },
    { role: 'Surveyor, PJU Data Collection Phase V', org: 'UPT PJU, Dinas PUPKP Kota Yogyakarta', period: 'Oct 2023 - Nov 2023', loc: 'Yogyakarta', type: 'work', link: '',
      desc: 'Surveyed street-lighting (PJU) kWh meters: measured and recorded meter data, verified installation condition, and supported data analysis for street-lighting infrastructure management.' },
    { role: 'Head of Internal Affairs', org: 'Indonesian Climate Change Initiative UGM', period: 'Aug 2023 - Jan 2024', loc: 'Yogyakarta', type: 'leadership', link: '',
      desc: 'Directed internal communications and operations for climate-change initiatives; drove strategic plans and cross-team collaboration.' }
  ],

  expertise: [
    { code: 'indie.products', title: 'Independent GIS Products', desc: 'Building and shipping GIS web apps and open tools end to end as an indie developer (AI-assisted): Shp.Aid, BlueMap and client dashboards.', tags: ['Shp.Aid', 'BlueMap', 'React · OpenLayers', 'Supabase/PostGIS'] },
    { code: 'remote.sensing', title: 'Remote Sensing', desc: 'Sentinel-2, LiDAR and radar for blue-carbon, seagrass, water-quality and environmental monitoring, with ML-based retrieval.', tags: ['Sentinel-2', 'LiDAR · Radar', 'Random Forest', 'GEE'] },
    { code: 'gis.analysis', title: 'GIS Analysis', desc: 'Spatial modelling, overlay analysis and enterprise geodatabases: from permit compliance to flood vulnerability and marine spatial planning.', tags: ['ArcGIS Enterprise', 'PostGIS', 'GeoServer', 'spatial queries'] },
    { code: 'cartography', title: 'Cartography & Surveying', desc: 'Thematic map design and land surveying: theodolite, robotic total station and waterpass turned into clear visual data.', tags: ['thematic maps', 'total station', 'field survey'] },
    { code: 'geo.ai', title: 'Geo-AI', desc: 'Integrating machine learning with GIS for seagrass and blue-carbon mapping, yield prediction and ESG decision support.', tags: ['ML + GIS', 'Python', 'feature engineering'] }
  ],

  education: [
    { period: 'Jul 2022 - Jun 2026', school: 'Universitas Gadjah Mada', degree: "Bachelor's, Cartography & Remote Sensing (Kartografi & Penginderaan Jauh)" },
    { period: 'Jun 2019 - May 2022', school: 'SMK Negeri 1 Lolofitu Moi', degree: 'Computer & Network Engineering (Teknik Komputer & Jaringan)' }
  ],

  awards: [
    '2nd Place, Business Challenge Track, Astranauts 2024',
    '3rd Place, Scientific Writing Competition, LOGIN 2024',
    '1st Runner-Up, Sotech Competition (Technology)',
    'National Poetry Finalist & author of "No Longer Looking for Cemara"',
    'Finalist, National Essay Competition, IDEA FEST'
  ],

  pubs: [
    'Mapping Seagrass Dynamics in a Developing Coastal Area: A Case Study of Kuta Mandalika, Lombok Island, Indonesia (Regional Studies in Marine Science)',
    'Comparison of PCA, KPCA, and Regression Models for Seagrass Percent Cover Mapping Using Sentinel-2 (SPIE Proceedings, Asia-Pacific Remote Sensing Conference 2024, Kaohsiung, Taiwan)',
    'Air-Concentration Change from Deforestation of the IKN Area (national proceedings)',
    'Flood Vulnerability Analysis of the Bengawan Solo Watershed, Sukoharjo (overlay method)',
    'IoT-Based Urban Portable Agriculture System: Technical Validation of a Low-Cost Hydroponic Monitoring Platform',
    'Fintech Innovation: Enhancing the Sustainability of Micro, Small & Medium Enterprises',
    'BlueMap: blue-carbon & coastal mapping application (open release, Zenodo: zenodo.org/records/20457262)'
  ],

  certifications: [
    'Kelompok Materi Pelatihan Dasar (KMPD)',
    'KMPL Pekerja Kantor dan Dapur'
  ],

  hardSkills: [
    { name: 'ArcGIS / ArcGIS Enterprise', lvl: 'expert', pct: 92 },
    { name: 'Remote Sensing (Sentinel-2, LiDAR, Radar)', lvl: 'advanced', pct: 88 },
    { name: 'Cartography & Land Surveying', lvl: 'advanced', pct: 84 },
    { name: 'Web GIS Dev (React, OpenLayers, Supabase)', lvl: 'advanced', pct: 80 },
    { name: 'PostgreSQL / PostGIS · GeoServer', lvl: 'advanced', pct: 80 },
    { name: 'ML for Remote Sensing (Random Forest, PCA)', lvl: 'proficient', pct: 76 }
  ],

  softSkills: ['Analytical thinking', 'Leadership', 'Project management', 'Public speaking', 'Cross-team collaboration', 'Hazard mitigation'],

  tools: ['ArcGIS Pro', 'ArcGIS Enterprise', 'QGIS', 'GeoServer', 'PostGIS', 'Google Earth Engine', 'SNAP', 'ENVI', 'Sentinel-2', 'Random Forest', 'Python', 'React.js', 'TailwindCSS', 'OpenLayers', 'AlpineJS', 'Supabase', 'Robotic Total Station', 'AI-assisted dev'],

  languages: [
    { name: 'Bahasa Nias', level: 'Native / Bilingual' },
    { name: 'Bahasa Indonesia', level: 'Native / Bilingual' },
    { name: 'English', level: 'Limited Working' }
  ]
};
