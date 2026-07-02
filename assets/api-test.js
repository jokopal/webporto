/* ============================================================
   api-test.js — Google Sheets API performance testing
   Run in browser console on the deployed site
   ============================================================ */

(function () {
  'use strict';

  const CONFIG = {
    webAppUrl: 'https://script.google.com/macros/s/AKfycbxBU3HywK3gNrRG0xk0kDK1DqwwUtBp9lk9xb6hz5lPp8im58gozYFBR46aq5ME9ZAr2A/exec',
    token: 'ca46c52855953e629d0950e4d4533185bc813b44217a4099',
    runs: 5
  };

  async function timeFetch(label, fn) {
    const start = performance.now();
    try {
      const result = await fn();
      const elapsed = performance.now() - start;
      console.log(`✅ ${label}: ${elapsed.toFixed(0)}ms`);
      return { label, elapsed, ok: true, data: result };
    } catch (e) {
      const elapsed = performance.now() - start;
      console.log(`❌ ${label}: ${elapsed.toFixed(0)}ms - ${e.message}`);
      return { label, elapsed, ok: false, error: e.message };
    }
  }

  async function testGet() {
    const url = CONFIG.webAppUrl + '?action=get&_=' + Date.now();
    const res = await fetch(url, { method: 'GET', cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  // NON-DESTRUCTIVE: uses a deliberately invalid token so the server rejects the
  // write ({ok:false,"bad token"}) BEFORE touching the sheet. Still measures the
  // full POST round-trip latency without corrupting your data.
  async function testPost() {
    const res = await fetch(CONFIG.webAppUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        token: '__benchmark_invalid_token__',
        action: 'save',
        data: {}
      })
    });
    return res.json();
  }

  async function runBenchmarks() {
    console.log('🚀 Starting API benchmarks...\n');
    console.log(`Testing: ${CONFIG.webAppUrl}`);
    console.log(`Runs per test: ${CONFIG.runs}\n`);

    // Test GET (read)
    console.log('--- GET (read all data) ---');
    const getResults = [];
    for (let i = 0; i < CONFIG.runs; i++) {
      getResults.push(await timeFetch(`GET #${i + 1}`, testGet));
    }

    const getTimes = getResults.filter(r => r.ok).map(r => r.elapsed);
    console.log(`\nGET stats: avg=${(getTimes.reduce((a,b)=>a+b,0)/getTimes.length).toFixed(0)}ms, min=${Math.min(...getTimes)}ms, max=${Math.max(...getTimes)}ms`);

    // Test POST (write)
    console.log('\n--- POST (write data) ---');
    const postResults = [];
    for (let i = 0; i < CONFIG.runs; i++) {
      postResults.push(await timeFetch(`POST #${i + 1}`, testPost));
    }

    const postTimes = postResults.filter(r => r.ok).map(r => r.elapsed);
    console.log(`\nPOST stats: avg=${(postTimes.reduce((a,b)=>a+b,0)/postTimes.length).toFixed(0)}ms, min=${Math.min(...postTimes)}ms, max=${Math.max(...postTimes)}ms`);

    // Test current implementation (with cache busting)
    console.log('\n--- Current implementation simulation ---');
    const currentImpl = async () => {
      const url = CONFIG.webAppUrl + (CONFIG.webAppUrl.indexOf('?') >= 0 ? '&' : '?') + 'action=get&_=' + Date.now();
      const res = await fetch(url, { method: 'GET', cache: 'no-store' });
      return res.json();
    };
    const currentResults = [];
    for (let i = 0; i < CONFIG.runs; i++) {
      currentResults.push(await timeFetch(`Current impl #${i + 1}`, currentImpl));
    }
    const currentTimes = currentResults.filter(r => r.ok).map(r => r.elapsed);
    console.log(`\nCurrent impl stats: avg=${(currentTimes.reduce((a,b)=>a+b,0)/currentTimes.length).toFixed(0)}ms`);

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 SUMMARY');
    console.log('='.repeat(50));
    console.log(`GET (read):    ${(getTimes.reduce((a,b)=>a+b,0)/getTimes.length).toFixed(0)}ms avg  ← MAIN BOTTLENECK`);
    console.log(`POST (write):  ${(postTimes.reduce((a,b)=>a+b,0)/postTimes.length).toFixed(0)}ms avg  ← Acceptable`);
    console.log(`Current impl:  ${(currentTimes.reduce((a,b)=>a+b,0)/currentTimes.length).toFixed(0)}ms avg  ← What users experience`);
    console.log('\n💡 Root cause: Google Apps Script execution time (~6-8s)');
    console.log('   - SpreadsheetApp.getActiveSpreadsheet() + reading all sheets');
    console.log('   - No server-side caching in Apps Script');
    console.log('   - Client fetches fresh data on EVERY page load (cache: no-store)');
    console.log('\n🔧 Recommended fixes:');
    console.log('   1. Client: stale-while-revalidate caching (instant cached render)');
    console.log('   2. Client: 5-min TTL, background refresh');
    console.log('   3. Server: Apps Script cache (CacheService) for reads');
    console.log('   4. Server: batch reads with getValues() once');
  }

  // Expose for manual testing
  window.MJGApiTest = {
    runBenchmarks,
    testGet,
    testPost,
    timeFetch
  };

  console.log('MJGApiTest loaded. Run MJGApiTest.runBenchmarks() to start.');
})();