const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const BASE = 'https://oldroothq.com/';
const SOCIAL = BASE + 'assets/branding/oldroot-primary.png';

const indexable = [
  'index.html','characters.html',
  'characters/gila-monster/index.html','characters/commotion/index.html','characters/aftermark/index.html',
  'characters/kincast/index.html','characters/anchorage/index.html','characters/agent-emerald/index.html','characters/latch/index.html','characters/kokio/index.html','characters/amari-razman/index.html','characters/ballestera/index.html','characters/remedie/index.html','characters/deuce/index.html','characters/max-corbett/index.html', 'characters/flying-saucer/index.html',
  'locations.html','locations/tucson/index.html','locations/chicago/index.html','locations/san-juan/index.html',
  'locations/st-dorsey/index.html','locations/baltimore/index.html','locations/seattle/index.html','locations/hilo/index.html',
  'events.html','organizations.html','organizations/los-moralistas/index.html','organizations/dunamis-dynamics/index.html',
  'start-here.html','lore.html','lore/abyron/index.html','lore/abyron-powder/index.html','lore/abyron-discovery/index.html','lore/genesis/index.html','marketplace.html','news.html','dpi.html','about.html','work-with-oldroot.html','contact.html','donate.html'
];

const noindex = [
  '404.html','cart.html','checkout.html','order-confirmation.html','library.html',
  ...Array.from({ length: 10 }, (_, i) => `library/oldroot-book-${i + 1}/index.html`),
  ...["gila-monster","commotion","latch","kokio","remedie","agent-emerald","aftermark","kincast","anchorage","deuce","flying-saucer"].map(slug=>`stickers/${slug}/index.html`)
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
          : file === 'characters/max-corbett/index.html'
            ? BASE + 'assets/characters/max-corbett/max-registry.webp'
          : file === 'characters/flying-saucer/index.html'
            ? BASE + 'assets/characters/flying-saucer/flying-saucer-sunset-jump.webp'
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
  expect(html).toContain('location-data.js?v=4');
  expect(html).toContain('locations.js?v=6');
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
      const fromSiteRoot = href.startsWith('/');
      const directoryLink = href.endsWith('/');
      if (fromSiteRoot) href = href.slice(1);
      const resolved = path.posix.normalize(fromSiteRoot ? href : path.posix.join(dir === '.' ? '' : dir, href));
      const target = directoryLink ? path.join(ROOT, resolved, 'index.html') : path.join(ROOT, resolved);
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

test('OldRootHQ custom domain is configured and legacy project URLs are absent from live pages', async () => {
  expect(read('CNAME').trim()).toBe('oldroothq.com');
  const tree = ['index.html', '404.html', ...indexable, ...noindex];
  const failures = [];
  for (const file of new Set(tree)) {
    const html = read(file);
    if (html.includes('https://oldroothq.github.io/project-dorsey-dpi')) failures.push(file + ': legacy public URL');
    if (html.includes('"/project-dorsey-dpi/') || html.includes("'/project-dorsey-dpi/")) failures.push(file + ': legacy root-relative project path');
  }
  expect(failures).toEqual([]);
  expect(read('robots.txt')).toContain('https://oldroothq.com/sitemap.xml');
  expect(read('sitemap.xml')).toContain('<loc>https://oldroothq.com/</loc>');
});

test('OldRoot is clearly identifiable to search crawlers as a superhero universe', async () => {
  const home = read('index.html');
  const start = read('start-here.html');
  const registry = read('characters.html');
  const kincast = read('characters/kincast/index.html');
  const robots = read('robots.txt');

  expect(home).toContain('<title>OldRoot — Original Superhero Universe | OldRoot Studios</title>');
  expect(home).toContain('OldRoot is an original superhero universe created by OldRoot Studios.');
  expect(home).toContain('Gila Monster, Kincast, Ballestera and Anchorage');
  expect(start).toContain('<title>What Is OldRoot? Start Here | OldRoot Universe</title>');
  expect(registry).toContain('<title>OldRoot Characters — Superheroes, Villains & Dossiers</title>');
  expect(kincast).toContain('<title>Kincast (Micah & Naomi Ellison) | OldRoot Universe</title>');
  expect(kincast).toContain('<meta name="description" content="Meet Kincast, the shared superhero identity');
  expect(home).not.toContain('name="robots" content="noindex"');

  const structuredMatch = home.match(/<script type="application\/ld\+json">([^<]+)<\/script>/);
  expect(structuredMatch).not.toBeNull();
  const website = JSON.parse(structuredMatch[1]);
  expect(website['@type']).toBe('WebSite');
  expect(website.name).toBe('OldRoot Studios');
  expect(website.alternateName).toBe('OldRoot');
  expect(website.publisher.name).toBe('OldRoot Studios');
  expect(website.about.name).toBe('OldRoot');
  expect(website.about.genre).toBe('Superhero fiction');

  expect(robots).toBe('User-agent: *\nAllow: /\n\nSitemap: https://oldroothq.com/sitemap.xml\n');
  expect(robots).toContain('User-agent: *\nAllow: /');
  expect(robots).toContain('Sitemap: https://oldroothq.com/sitemap.xml');
});

test('public OldRoot surfaces do not advertise outside infrastructure brands', async () => {
  const forbidden = /chat[\s-]?gpt|openai|github(?:\.io)?|oai-searchbot/i;
  const exclusions = new Set(['.git', '.github', 'node_modules', 'tests']);
  const extensions = /\.(html|js|css|xml|txt|md)$/i;
  const problems = [];

  function scan(directory = ROOT) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (exclusions.has(entry.name)) continue;
      const filename = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        scan(filename);
      } else if (entry.isFile() && extensions.test(entry.name)) {
        const body = fs.readFileSync(filename, 'utf8');
        if (forbidden.test(body)) problems.push(path.relative(ROOT, filename));
      }
    }
  }

  scan();
  expect(problems).toEqual([]);
  expect(read('news.html')).toContain('id="or-web-0097"');
  expect(read('robots.txt')).toContain('User-agent: *');
  expect(read('robots.txt')).toContain('Allow: /');
  expect(read('robots.txt')).toContain('Sitemap: https://oldroothq.com/sitemap.xml');
});
