const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE = 'http://127.0.0.1:8000';

test('Root Atmosphere renders as a dark decorative layer without blocking content', async ({ page }) => {
  await page.goto(BASE + '/index.html', { waitUntil: 'domcontentloaded' });

  const atmosphere = await page.evaluate(() => {
    const body = document.body;
    const before = getComputedStyle(body, '::before');
    const after = getComputedStyle(body, '::after');
    const card = document.querySelector('.discovery-card');
    const cardAfter = getComputedStyle(card, '::after');

    return {
      bodyBackground: getComputedStyle(body).backgroundImage,
      bodyColor: getComputedStyle(body).color,
      rootBackground: before.backgroundImage,
      rootOpacity: Number(before.opacity),
      rootPointerEvents: before.pointerEvents,
      grainPointerEvents: after.pointerEvents,
      cardRoot: cardAfter.backgroundImage,
      cardRootPointerEvents: cardAfter.pointerEvents
    };
  });

  expect(atmosphere.bodyBackground).toContain('linear-gradient');
  expect(atmosphere.rootBackground).toContain('root-network.svg');
  expect(atmosphere.rootOpacity).toBeGreaterThan(0.3);
  expect(atmosphere.rootPointerEvents).toBe('none');
  expect(atmosphere.grainPointerEvents).toBe('none');
  expect(atmosphere.cardRoot).toContain('root-corner.svg');
  expect(atmosphere.cardRootPointerEvents).toBe('none');

  await expect(page.locator('.site-nav > a[href="index.html"]').first()).toBeVisible();
});

test('Root Atmosphere connects into dossier bubbles while preserving readable surfaces', async ({ page }) => {
  await page.goto(BASE + '/characters/kincast/', { waitUntil: 'domcontentloaded' });

  const styles = await page.locator('.wiki-section').first().evaluate(el => {
    const box = getComputedStyle(el);
    const root = getComputedStyle(el, '::before');
    return {
      textColor: box.color,
      backgroundColor: box.backgroundColor,
      rootImage: root.backgroundImage,
      rootOpacity: Number(root.opacity),
      rootPointerEvents: root.pointerEvents
    };
  });

  expect(styles.rootImage).toContain('root-corner.svg');
  expect(styles.rootOpacity).toBeGreaterThan(0.25);
  expect(styles.rootPointerEvents).toBe('none');
  expect(styles.textColor).not.toBe('rgba(0, 0, 0, 0)');
});

test('Root Atmosphere disables drift for reduced-motion users', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(BASE + '/index.html', { waitUntil: 'domcontentloaded' });
  const animationName = await page.evaluate(() => getComputedStyle(document.body, '::before').animationName);
  expect(animationName).toBe('none');
});

test('Root Atmosphere remains viewport-safe and less intense on phones', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const url of ['/index.html', '/characters/kincast/', '/news.html']) {
    await page.goto(BASE + url, { waitUntil: 'domcontentloaded' });
    const state = await page.evaluate(() => ({
      viewport: innerWidth,
      html: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
      opacity: Number(getComputedStyle(document.body, '::before').opacity),
      animation: getComputedStyle(document.body, '::before').animationName
    }));

    expect(state.html, url).toBeLessThanOrEqual(state.viewport + 2);
    expect(state.body, url).toBeLessThanOrEqual(state.viewport + 2);
    expect(state.opacity, url).toBeLessThanOrEqual(0.35);
    expect(state.animation, url).toBe('none');
  }
});

test('Root Atmosphere remains a single removable visual dependency', async () => {
  const root = process.cwd();
  const brand = fs.readFileSync(path.join(root, 'brand.css'), 'utf8');
  const atmosphere = fs.readFileSync(path.join(root, 'root-atmosphere.css'), 'utf8');

  expect(brand.startsWith('@import url("root-atmosphere.css?v=2");')).toBe(true);
  expect(atmosphere).toContain('OR-WEB-0028 — Root Atmosphere experiment');
  expect(fs.existsSync(path.join(root, 'assets/branding/root-network.svg'))).toBe(true);
  expect(fs.existsSync(path.join(root, 'assets/branding/root-corner.svg'))).toBe(true);

  const htmlFiles = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === '.git' || entry.name === 'node_modules') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith('.html')) htmlFiles.push(full);
    }
  }
  walk(root);

  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    expect(html, path.relative(root, file)).toContain('brand.css?v=14');
    expect(html, path.relative(root, file)).not.toContain('brand.css?v=13');
  }
});


test('character registry filter control is integrated into the finalized dark atmosphere', async ({ page }) => {
  await page.goto(BASE + '/characters.html', { waitUntil: 'domcontentloaded' });

  const state = await page.locator('#filterToggle').evaluate(el => {
    const s = getComputedStyle(el);
    const sliders = getComputedStyle(el.querySelector('.filter-sliders'));
    return {
      background: s.backgroundImage,
      color: s.color,
      borderColor: s.borderTopColor,
      rootVisible: s.backgroundImage.includes('root-corner.svg'),
      iconColor: sliders.color
    };
  });

  expect(state.rootVisible).toBe(true);
  expect(state.background).toContain('linear-gradient');
  expect(state.color).not.toBe('rgb(23, 52, 40)');

  const cardRoot = await page.locator('.character-card').first().evaluate(el => {
    const after = getComputedStyle(el, '::after');
    return {
      image: after.backgroundImage,
      opacity: Number(after.opacity),
      pointerEvents: after.pointerEvents
    };
  });

  expect(cardRoot.image).toContain('root-corner.svg');
  expect(cardRoot.opacity).toBeGreaterThan(0.35);
  expect(cardRoot.pointerEvents).toBe('none');
});
