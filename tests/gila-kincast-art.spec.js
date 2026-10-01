const { test, expect } = require('@playwright/test');

const BASE = 'http://127.0.0.1:8000';

test('Gila Monster and Kincast final artwork is integrated across core surfaces', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));

  await page.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded' });
  const gilaHome = page.locator('[data-home-slide="gila"] img');
  const kincastHome = page.locator('[data-home-slide="kincast"] img');
  await expect(gilaHome).toHaveAttribute('src', 'assets/characters/gila-monster/gila-featured.webp');
  await expect(kincastHome).toHaveAttribute('src', 'assets/characters/kincast/kincast-featured.webp');
  await expect.poll(() => gilaHome.evaluate(img => img.naturalWidth)).toBeGreaterThan(0);
  await page.locator('[data-home-character="kincast"]').click();
  await expect(kincastHome).toBeVisible();
  await expect.poll(() => kincastHome.evaluate(img => img.naturalWidth)).toBeGreaterThan(0);

  await page.goto(`${BASE}/characters.html`, { waitUntil: 'domcontentloaded' });
  const gilaRegistry = page.locator('.character-card[href="characters/gila-monster/"] img');
  const kincastRegistry = page.locator('.character-card[href="characters/kincast/"] img');
  await expect(gilaRegistry).toHaveAttribute('src', 'assets/characters/gila-monster/gila-registry.webp');
  await expect(kincastRegistry).toHaveAttribute('src', 'assets/characters/kincast/kincast-registry.webp');
  await expect.poll(() => gilaRegistry.evaluate(img => img.naturalWidth)).toBeGreaterThan(0);
  await expect.poll(() => kincastRegistry.evaluate(img => img.naturalWidth)).toBeGreaterThan(0);

  await gilaRegistry.click();
  await expect(page.locator('.image-lightbox')).toHaveClass(/open/);
  await page.locator('.image-lightbox-close').click();

  await page.goto(`${BASE}/characters/gila-monster/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.character-feature-art img')).toHaveAttribute('src', '../../assets/characters/gila-monster/gila-primary.webp');
  await expect(page.locator('.dossier-illustration img')).toHaveCount(2);
  await expect(page.locator('.character-infobox img')).toHaveAttribute('src', /assets\/characters\/gila-monster\//);
  await expect(page.locator('.dpi-row').filter({ hasText: 'Senses' }).locator('.dpi-value')).toHaveText('22.2');
  await expect(page.locator('.conditional-box')).toContainText('Senses — Nocturnal: 31.7');
  await expect(page.locator('.dpi-summary')).toContainText('Baseline total · 201.4');
  await expect(page.locator('.dpi-summary')).toContainText('Baseline mean · 18.31');

  await page.goto(`${BASE}/characters/kincast/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.character-feature-art img')).toHaveAttribute('src', '../../assets/characters/kincast/kincast-primary.webp');
  await expect(page.locator('.dossier-illustration img')).toHaveCount(2);
  await expect(page.locator('.character-infobox img')).toHaveAttribute('src', '../../assets/characters/kincast/kincast-registry.webp');

  await page.goto(`${BASE}/dpi.html`, { waitUntil: 'networkidle' });
  const records = await page.evaluate(() => window.OLDROOT_CHARACTERS);
  const gilaRecord = records.find(c => c.codename === 'Gila Monster');
  expect(gilaRecord.image).toBe('assets/characters/gila-monster/gila-registry.webp');
  expect(gilaRecord.baseline.Senses).toBe(22.2);
  expect(gilaRecord.conditional.find(c => c.category === 'Senses' && c.condition === 'Nocturnal').value).toBe(31.7);
  expect(records.find(c => c.codename === 'Kincast').image).toBe('assets/characters/kincast/kincast-registry.webp');

  await page.goto(`${BASE}/locations/tucson/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.known-character-card[href="../../characters/gila-monster/"] img')).toHaveAttribute('src', '../../assets/characters/gila-monster/gila-registry.webp');

  await page.goto(`${BASE}/locations/baltimore/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.known-character-card[href="../../characters/kincast/"] img')).toHaveAttribute('src', '../../assets/characters/kincast/kincast-registry.webp');

  expect(errors, `Unexpected page errors: ${errors.join(' | ')}`).toEqual([]);
});

test('legacy Gila and Kincast filler files are no longer referenced by active pages', async ({ request }) => {
  const pages = [
    '/index.html',
    '/characters.html',
    '/dpi.html',
    '/data.js',
    '/characters/gila-monster/',
    '/characters/kincast/',
    '/locations/tucson/',
    '/locations/baltimore/'
  ];

  for (const path of pages) {
    const response = await request.get(`${BASE}${path}`);
    expect(response.ok(), path).toBeTruthy();
    const body = await response.text();
    expect(body, path).not.toContain('gila-monster-full.png');
    expect(body, path).not.toContain('kincast-full.png');
  }
});
