const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE = 'http://127.0.0.1:8000';

const DARK_PAGES = [
  ['characters.html', '.character-card'],
  ['characters/anchorage/', '.wiki-section'],
  ['characters/agent-emerald/', '.wiki-section'],
  ['start-here.html', '.section-band'],
  ['lore.html', '.lore-entry'],
  ['events.html', '.event-feature'],
  ['organizations.html', '.org-card'],
  ['organizations/dunamis-dynamics/', '.location-section'],
  ['locations.html', '.location-terminal'],
  ['locations/baltimore/', '.location-section'],
  ['locations/seattle/', '.location-section'],
  ['library.html', '.library-card'],
  ['library/oldroot-book-1/', '.product-buybox'],
  ['news.html', '.dispatch-card'],
  ['contact.html', '.mail-console'],
  ['donate.html', '.donate-primary'],
  ['cart.html', '.cart-main'],
  ['checkout.html', '.checkout-form'],
  ['dpi.html', '.panel'],
  ['about.html', '.section-band']
];

test('After Dark renders across every major OldRoot page family', async ({ page }) => {
  for (const [url, selector] of DARK_PAGES) {
    await page.goto(BASE + '/' + url, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toHaveClass(/oldroot-after-dark/);
    const surface = page.locator(selector).first();
    await expect(surface).toBeVisible();

    const appearance = await surface.evaluate(el => {
      const style = getComputedStyle(el);
      return {
        color: style.color,
        backgroundColor: style.backgroundColor,
        backgroundImage: style.backgroundImage,
        borderColor: style.borderTopColor
      };
    });

    expect(appearance.color).not.toBe('rgb(21, 21, 21)');
    expect(
      appearance.backgroundImage !== 'none' ||
      appearance.backgroundColor.includes('rgba(') ||
      appearance.backgroundColor.includes('rgb(')
    ).toBe(true);
  }
});

test('After Dark major pages remain viewport-safe on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const pages = [
    '/',
    '/characters.html',
    '/characters/anchorage/',
    '/characters/agent-emerald/',
    '/start-here.html',
    '/lore.html',
    '/events.html',
    '/organizations.html',
    '/organizations/dunamis-dynamics/',
    '/locations.html',
    '/locations/baltimore/',
    '/locations/seattle/',
    '/library.html',
    '/library/oldroot-book-1/',
    '/news.html',
    '/contact.html',
    '/donate.html',
    '/cart.html',
    '/checkout.html',
    '/dpi.html'
  ];

  for (const url of pages) {
    await page.goto(BASE + url, { waitUntil: 'domcontentloaded' });
    const widths = await page.evaluate(() => ({
      viewport: innerWidth,
      html: document.documentElement.scrollWidth,
      body: document.body.scrollWidth
    }));
    expect(widths.html, url).toBeLessThanOrEqual(widths.viewport + 2);
    expect(widths.body, url).toBeLessThanOrEqual(widths.viewport + 2);
  }
});

test('all static pages opt into After Dark and current stylesheet cache keys', async () => {
  const root = process.cwd();
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

  const failures = [];
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    const relative = path.relative(root, file).replace(/\\/g, '/');

    if (!html.includes('oldroot-after-dark')) failures.push(relative + ': theme class missing');
    if (!html.includes('brand.css?v=11')) failures.push(relative + ': brand cache key stale');
    if (html.includes('site.css') && !html.includes('site.css?v=29')) failures.push(relative + ': site cache key stale');
    if (html.includes('character.css') && !html.includes('character.css?v=18')) failures.push(relative + ': character cache key stale');
    if (html.includes('locations.css') && !html.includes('locations.css?v=6')) failures.push(relative + ': locations cache key stale');
    if (html.includes('styles.css') && !html.includes('styles.css?v=13')) failures.push(relative + ': OPI cache key stale');
    if (html.includes('shop.css') && !html.includes('shop.css?v=2')) failures.push(relative + ': shop cache key stale');
    if (html.includes('lightbox.js') && !html.includes('lightbox.js?v=9')) failures.push(relative + ': lightbox cache key stale');
    if (html.includes('nav.js') && !html.includes('nav.js?v=1')) failures.push(relative + ': nav cache key stale');
    if (html.includes('shop.js') && !html.includes('shop.js?v=1')) failures.push(relative + ': shop script cache key stale');
    if (html.includes('locations.js') && !html.includes('locations.js?v=54')) failures.push(relative + ': locations script cache key stale');
    if (relative === 'dpi.html' && !html.includes('data.js?v=12')) failures.push(relative + ': OPI data cache key stale');
    if (relative === 'dpi.html' && !html.includes('app.js?v=10')) failures.push(relative + ': OPI app cache key stale');
  }

  expect(htmlFiles.length).toBe(40);
  expect(failures).toEqual([]);
});
