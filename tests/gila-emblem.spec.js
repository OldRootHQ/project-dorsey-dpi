const { test, expect } = require('@playwright/test');
const fs = require('fs');

const BASE = 'http://127.0.0.1:8000';
const EMBLEM = 'assets/characters/gila-monster/gila-monster-emblem.svg';

test('Gila Monster dossier installs the approved emblem without replacing hero artwork', async ({ page }) => {
  await page.goto(BASE + '/characters/gila-monster/', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('h1')).toHaveText('GILA MONSTER');
  await expect(page.locator('.logo-slot.has-logo')).toHaveCount(1);
  await expect(page.locator('.character-logo')).toHaveAttribute('src', '../../' + EMBLEM);
  await expect(page.locator('.logo-slot')).not.toContainText('CHARACTER LOGO — COMING');
  await expect(page.locator('.character-feature-art img')).toHaveAttribute('src', '../../assets/characters/gila-monster/gila-featured.webp');
  await expect.poll(() => page.locator('.character-logo').evaluate(img => img.naturalWidth)).toBeGreaterThan(0);

  const asset = await page.request.get(BASE + '/' + EMBLEM);
  expect(asset.ok()).toBe(true);
  expect(await asset.text()).toContain('Gila Monster emblem');
});

test('Gila Monster emblem propagates to compact identity surfaces', async ({ page }) => {
  await page.goto(BASE + '/characters.html', { waitUntil: 'domcontentloaded' });
  const card = page.locator('.character-card[href="characters/gila-monster/"]');
  await expect(card.locator('.character-thumb')).toHaveAttribute('src', 'assets/characters/gila-monster/gila-registry.webp');
  await expect(card.locator('.character-card-mark')).toHaveAttribute('src', EMBLEM);

  await page.goto(BASE + '/start-here.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('a[href="characters/gila-monster/"] .start-character-mark')).toHaveAttribute('src', EMBLEM);

  await page.goto(BASE + '/locations/tucson/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.known-character-card[href="../../characters/gila-monster/"] img')).toHaveAttribute('src', '../../' + EMBLEM);

  await page.goto(BASE + '/organizations/los-moralistas/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.known-character-card[href="../../characters/gila-monster/"] img')).toHaveAttribute('src', '../../' + EMBLEM);
});

test('Gila Monster emblem is available to homepage and OPI systems', async ({ page }) => {
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  const homeMark = await page.evaluate(() => window.OLDROOT_HOME.characterSpotlights['Gila Monster'].mark);
  expect(homeMark).toBe(EMBLEM);

  await page.goto(BASE + '/dpi.html', { waitUntil: 'domcontentloaded' });
  const dataMark = await page.evaluate(() => window.OLDROOT_CHARACTERS.find(c => c.codename === 'Gila Monster').mark);
  expect(dataMark).toBe(EMBLEM);
  await page.locator('#search').fill('Gila Monster');
  await expect(page.locator('.detail-mark')).toHaveAttribute('src', EMBLEM);
  await expect(page.locator('.detail-portrait')).toHaveAttribute('src', 'assets/characters/gila-monster/gila-registry.webp');
});

test('Gila Monster emblem stays inside phone layouts', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/characters/gila-monster/', '/characters.html', '/start-here.html', '/locations/tucson/', '/organizations/los-moralistas/', '/dpi.html']) {
    await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
    const dims = await page.evaluate(() => ({
      viewport: innerWidth,
      html: document.documentElement.scrollWidth,
      body: document.body.scrollWidth
    }));
    expect(dims.html, path).toBeLessThanOrEqual(dims.viewport + 2);
    expect(dims.body, path).toBeLessThanOrEqual(dims.viewport + 2);
  }
});

test('Gila Monster emblem asset remains a transparent scalable SVG', async () => {
  const svg = fs.readFileSync(EMBLEM, 'utf8');
  expect(svg).toContain('viewBox="0 0 720 720"');
  expect(svg).not.toContain('<rect width="720" height="720"');
  expect((svg.match(/<use href="#slash"/g) || []).length).toBe(3);
});
