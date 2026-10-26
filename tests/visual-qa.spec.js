const { test, expect } = require('@playwright/test');
const fs = require('fs');

const BASE = 'http://127.0.0.1:8000';
const pages = [
  ['home','/'],
  ['characters','/characters.html'],
  ['gila','/characters/gila-monster/'],
  ['latch','/characters/latch/'],
  ['anchorage','/characters/anchorage/'],
  ['amari-razman','/characters/amari-razman/'],
  ['ballestera','/characters/ballestera/'],
  ['locations','/locations.html'],
  ['hilo','/locations/hilo/'],
  ['lore','/lore.html'],
  ['abyron','/lore/abyron/'],
  ['abyron-discovery','/lore/abyron-discovery/'],
  ['genesis-lore','/lore/genesis/'],
  ['marketplace','/marketplace.html'],
  ['dispatches','/news.html'],
  ['opi','/dpi.html']
];

const viewports = [
  ['desktop', 1440, 1000],
  ['mobile', 390, 844]
];

for (const [mode, width, height] of viewports) {
  test(`capture ${mode} production surfaces`, async ({ page }) => {
    test.setTimeout(180000);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width, height });
    fs.mkdirSync('artifacts/visual-qa', { recursive: true });

    const errors = [];
    page.on('pageerror', error => errors.push(error.message));

    for (const [name, url] of pages) {
      const response = await page.goto(BASE + url, { waitUntil: 'domcontentloaded' });
      expect(response?.status(), `Visual QA requires published route ${url}`).toBe(200);
      if (name === 'home') {
        // Capture the approved portrait ensemble only after the async art loader
        // has installed all eight transparent images, including mobile below-fold slots.
        await page.waitForFunction(() => {
          const portraits = [...document.querySelectorAll('.lc-face img')];
          return portraits.length === 8 && portraits.every(img => img.complete && img.naturalWidth > 0);
        }, null, { timeout: 20000 });
        // Full-page Chromium capture can defer rasterizing below-fold portraits
        // even after image data is ready. Visit the real mobile scroll positions.
        await page.evaluate(async () => {
          await Promise.all([...document.querySelectorAll('.lc-face img')].map(img => img.decode().catch(() => {})));
        });
        for (let i = 0; i < 8; i++) {
          await page.locator('.lc-face').nth(i).scrollIntoViewIfNeeded();
        }
        await page.evaluate(() => window.scrollTo({top: 0, left: 0, behavior: 'instant'}));
        await page.waitForTimeout(150);
        const selected = page.locator('.home-character-slide.active .home-character-art img');
        if (await selected.count()) {
          await selected.first().scrollIntoViewIfNeeded();
          await expect.poll(() => selected.first().evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
          await selected.first().evaluate(img => img.decode().catch(() => {}));
          await page.locator('.home-featured').screenshot({
            path: `artifacts/visual-qa/${mode}-rotating-character-spotlight.png`,
            animations: 'disabled'
          });
          await page.evaluate(() => window.scrollTo({top: 0, left: 0, behavior: 'instant'}));
        }
      }
      if (name === 'characters') {
        // Lazy-loaded registry art belongs to the scrollable page, not to blank
        // screenshot placeholders. Prime it before the full-page visual capture.
        const portraits = page.locator('.character-card .character-thumb');
        for (let n = 0, total = await portraits.count(); n < total; n++) {
          await portraits.nth(n).scrollIntoViewIfNeeded();
          await portraits.nth(n).evaluate(img => img.decode().catch(() => {}));
        }
        await page.evaluate(() => window.scrollTo({top: 0, left: 0, behavior: 'instant'}));
      }
      // The shared header is position:sticky and document-level smooth scrolling
      // can leave it stranded midway through a full-page screenshot. Force a real
      // top-of-document capture and confirm the visible brand/navigation first.
      await page.evaluate(() => {
        document.documentElement.style.scrollBehavior = 'auto';
        document.body.style.scrollBehavior = 'auto';
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      });
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
      const masthead = page.locator('header.masthead');
      await expect(masthead).toBeVisible();
      const bounds = await masthead.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds.y).toBeGreaterThanOrEqual(-1);
      expect(bounds.y).toBeLessThanOrEqual(1);
      // Separate review crops make the publisher masthead and contact footer
      // impossible to accidentally omit from creator preview handoffs.
      if (name === 'home') {
        await page.screenshot({
          path: `artifacts/visual-qa/${mode}-home-masthead.png`,
          animations: 'disabled'
        });
        await expect(page.locator('.oldroot-footer')).toBeVisible();
        await page.locator('.oldroot-footer').screenshot({
          path: `artifacts/visual-qa/${mode}-home-footer.png`,
          animations: 'disabled'
        });
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
      }
      await page.waitForTimeout(250);
      await page.screenshot({
        path: `artifacts/visual-qa/${mode}-${name}.png`,
        fullPage: true,
        animations: 'disabled'
      });
    }

    expect(errors, `Unexpected page errors: ${errors.join(' | ')}`).toEqual([]);
  });
}
