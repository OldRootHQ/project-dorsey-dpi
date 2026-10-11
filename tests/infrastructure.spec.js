const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const BASE = 'https://oldroothq.github.io/project-dorsey-dpi/';
const SOCIAL = BASE + 'assets/branding/oldroot-primary.png';

const indexable = [
  'index.html','characters.html',
  'characters/gila-monster/index.html','characters/commotion/index.html','characters/aftermark/index.html',
  'characters/kincast/index.html','characters/anchorage/index.html','characters/agent-emerald/index.html','characters/latch/index.html','characters/kokio/index.html','characters/amari-razman/index.html','characters/ballestera/index.html','characters/remedie/index.html','characters/deuce/index.html',
  'locations.html','locations/tucson/index.html','locations/chicago/index.html','locations/san-juan/index.html',
  'locations/st-dorsey/index.html','locations/baltimore/index.html','locations/seattle/index.html','locations/hilo/index.html',
  'events.html','organizations.html','organizations/los-moralistas/index.html','organizations/dunamis-dynamics/index.html',
  'start-here.html','lore.html','lore/abyron/index.html','lore/abyron-powder/index.html','lore/abyron-discovery/index.html','lore/genesis/index.html','marketplace.html','news.html','dpi.html','about.html','work-with-oldroot.html','contact.html','donate.html'
];

const noindex = [
  '404.html','cart.html','checkout.html','order-confirmation.html','library.html',
  ...Array.from({ length: 10 }, (_, i) => `library/oldroot-book-${i + 1}/index.html`)
];

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function canonicalFor(file) {
  if (file === 'index.html') return BASE;
  if (file.endsWith('/index.html')) return BASE + file.slice(0, -'index.html'.length);
  return BASE + file;
}

test('public records expose complete search and social metadata', async () => {
  const failures = [];
  for (const file of indexable) {
    const html = read(file);
    const expected = canonicalFor(file);
    if (!/<meta name="description" content="[^"]+"/i.test(html)) failures.push(file + ': description missing');
    if (!html.includes(`<link rel="canonical" href="${expected}"`)) failures.push(file + ': canonical mismatch');
    if (!html.includes('<meta property="og:site_name" content="OldRoot Studios"')) failures.push(file + ': og site name missing');
    if (!html.includes('<meta property="og:title"')) failures.push(file + ': og title missing');
    if (!html.includes('<meta property="og:description"')) failures.push(file + ': og description missing');
    if (!html.includes(`<meta property="og:url" content="${expected}"`)) failures.push(file + ': og url mismatch');
    const socialImage = file === 'characters/amari-razman/index.html'
      ? BASE + 'assets/characters/amari-razman/amari-featured.webp'
      : file === 'characters/ballestera/index.html'
        ? BASE + 'assets/characters/ballestera/ballestera-featured.webp'
        : file === 'characters/remedie/index.html'
          ? BASE + 'assets/characters/remedie/remedie-featured.webp'
          : SOCIAL;
    if (!html.includes(`<meta property="og:image" content="${socialImage}"`)) failures.push(file + ': og image missing');
    if (!html.includes('<meta name="twitter:card" content="summary_large_image"')) failures.push(file + ': twitter card missing');
    if (/name="robots" content="[^"]*noindex/i.test(html)) failures.push(file + ': unexpectedly noindex');
  }
  expect(failures).toEqual([]);
});

test('utility and unrevealed placeholder pages stay out of search', async () => {
  const failures = [];
  for (const file of noindex) {
    const html = read(file);
    if (!/name="robots" content="[^"]*noindex/i.test(html)) failures.push(file + ': noindex missing');
  }
  expect(failures).toEqual([]);
});

test('sitemap and robots expose exactly the public indexable surface', async () => {
  const sitemap = read('sitemap.xml');
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  const expected = indexable.map(canonicalFor);
  expect(new Set(urls).size).toBe(urls.length);
  expect([...urls].sort()).toEqual([...expected].sort());

  const robots = read('robots.txt');
  expect(robots).toContain('User-agent: *');
  expect(robots).toContain('Allow: /');
  expect(robots).toContain('Sitemap: ' + BASE + 'sitemap.xml');
});

test('World Index topology is local-first with a pinned remote fallback', async () => {
  const topology = JSON.parse(read('assets/data/world-110m.json'));
  expect(topology.type).toBe('Topology');
  expect(topology.objects.land).toBeTruthy();
  expect(topology.objects.countries).toBeTruthy();

  const js = read('locations.js');
  const local = js.indexOf('"assets/data/world-110m.json"');
  const remote = js.indexOf('"https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json"');
  expect(local).toBeGreaterThan(-1);
  expect(remote).toBeGreaterThan(local);

  const html = read('locations.html');
  expect(html).toContain('https://cdn.jsdelivr.net/npm/d3@7.9.0');
  expect(html).toContain('https://cdn.jsdelivr.net/npm/topojson-client@3.1.0');
  expect(html).toContain('location-data.js?v=2');
  expect(html).toContain('locations.js?v=5');
});

test('local page links resolve to repository files', async () => {
  const htmlFiles = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (['.git','node_modules'].includes(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith('.html')) htmlFiles.push(full);
    }
  }
  walk(ROOT);

  const failures = [];
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    const relative = path.relative(ROOT, file).replace(/\\/g, '/');
    const dir = path.posix.dirname(relative);
    for (const match of html.matchAll(/href="([^"]+)"/g)) {
      let href = match[1];
      if (!href || /^(https?:|mailto:|tel:|javascript:|#)/i.test(href)) continue;
      href = href.split('#')[0].split('?')[0];
      if (!href) continue;
      if (href.startsWith('/project-dorsey-dpi/')) href = href.slice('/project-dorsey-dpi/'.length);
      else if (href.startsWith('/')) continue;
      const resolved = path.posix.normalize(path.posix.join(dir === '.' ? '' : dir, href));
      const target = href.endsWith('/') ? path.join(ROOT, resolved, 'index.html') : path.join(ROOT, resolved);
      if (!fs.existsSync(target)) failures.push(relative + ' -> ' + match[1]);
    }
  }
  expect(failures).toEqual([]);
});

test('image markup preserves accessibility and reserves measurable WebP space', async () => {
  const htmlFiles = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (['.git','node_modules'].includes(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith('.html')) htmlFiles.push(full);
    }
  }
  walk(ROOT);

  const failures = [];
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    const relative = path.relative(ROOT, file).replace(/\\/g, '/');
    for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
      const tag = m[0];
      if (!/\balt=/.test(tag)) failures.push(relative + ': img missing alt');
      if (!/\bdecoding=/.test(tag)) failures.push(relative + ': img missing decoding hint');
      if (/\.webp(?:["?#]|$)/i.test(tag) && (!/\bwidth="\d+"/.test(tag) || !/\bheight="\d+"/.test(tag))) {
        failures.push(relative + ': WebP img missing intrinsic dimensions');
      }
    }
  }
  expect(failures).toEqual([]);
});
