const { test, expect } = require('@playwright/test');
const fs = require('fs');

const BASE = 'http://127.0.0.1:8000';
const pages = [
  ['home','/'],
  ['characters','/characters.html'],
  ['gila','/characters/gila-monster/'],
  ['latch','/characters/latch/'],
  ['kokio','/characters/kokio/'],
  ['amari-razman','/characters/amari-razman/'],
  ['locations','/locations.html'],
  ['hilo','/locations/hilo/'],
  ['lore','/lore.html'],
  ['abyron','/lore/abyron/'],
  ['abyron-discovery','/lore/abyron-discovery/'],
  ['genesis-lore','/lore/genesis/'],
  ['library','/library.html'],
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
      await page.goto(BASE + url, { waitUntil: 'domcontentloaded' });
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
