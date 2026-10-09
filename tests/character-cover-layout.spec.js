const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE = 'http://127.0.0.1:8000';
const DOSSIERS = [
  '/characters/commotion/',
  '/characters/aftermark/',
  '/characters/anchorage/',
  '/characters/gila-monster/',
  '/characters/kincast/',
  '/characters/agent-emerald/'
];

test('active character dossiers display cinematic side-by-side identity and approved artwork', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });

  for (const url of DOSSIERS) {
    await page.goto(BASE + url, { waitUntil: 'domcontentloaded' });

    const layout = await page.evaluate(() => {
      const identity = document.querySelector('.character-identity').getBoundingClientRect();
      const cover = document.querySelector('.character-feature-art').getBoundingClientRect();
      const image = document.querySelector('.character-feature-art img');
      return {
        identityTop: identity.top,
        identityBottom: identity.bottom,
        identityRight: identity.right,
        coverLeft: cover.left,
        coverTop: cover.top,
        coverHeight: cover.height,
        coverWidth: cover.width,
        imageFit: getComputedStyle(image).objectFit,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight
      };
    });

    // Cinematic dossiers present identity and approved art side by side.
    expect(Math.abs(layout.identityTop - layout.coverTop), url).toBeLessThanOrEqual(2);
    expect(layout.identityRight, url).toBeLessThanOrEqual(layout.coverLeft + 2);
    expect(layout.coverHeight, url).toBeGreaterThanOrEqual(440);
    expect(layout.coverHeight, url).toBeLessThanOrEqual(700);
    expect(layout.coverWidth, url).toBeLessThanOrEqual(982);
    expect(layout.imageFit, url).toBe('contain');
    expect(layout.naturalWidth, url).toBeGreaterThan(0);
    expect(layout.naturalHeight, url).toBeGreaterThan(0);
  }
});

test('sitewide dossier covers stack safely on phone width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const url of DOSSIERS) {
    await page.goto(BASE + url, { waitUntil: 'domcontentloaded' });
    const dims = await page.evaluate(() => {
      const cover = document.querySelector('.character-feature-art').getBoundingClientRect();
      return {
        viewport: innerWidth,
        html: document.documentElement.scrollWidth,
        body: document.body.scrollWidth,
        coverHeight: cover.height,
        coverWidth: cover.width
      };
    });

    expect(dims.html, url).toBeLessThanOrEqual(dims.viewport + 2);
    expect(dims.body, url).toBeLessThanOrEqual(dims.viewport + 2);
    expect(dims.coverHeight, url).toBeLessThanOrEqual(400);
    expect(dims.coverWidth, url).toBeLessThanOrEqual(dims.viewport);
  }
});

test('Aftermark rejected sunrise cover is deleted and replaced by the ability cover', async ({ page }) => {
  const root = process.cwd();
  expect(fs.existsSync(path.join(root, 'assets/characters/aftermark/aftermark-cover.webp'))).toBe(false);
  expect(fs.existsSync(path.join(root, 'assets/characters/aftermark/source/aftermark-cover-source.png'))).toBe(false);

  await page.goto(BASE + '/characters/aftermark/', { waitUntil: 'domcontentloaded' });
  const cover = page.locator('.character-feature-art img');
  await expect(cover).toHaveAttribute('src', '../../assets/characters/aftermark/aftermark-location-cover.webp');
  await expect(cover).toHaveAttribute('alt', /invisible stored counterpunch/i);
  await expect(page.locator('.character-feature-art')).toContainText('Ability visual reference');
  await expect(page.locator('.character-feature-art')).toContainText('Invisible Counterpunch');
});
