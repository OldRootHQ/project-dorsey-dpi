const { test, expect } = require('@playwright/test');

const BASE = 'http://127.0.0.1:8000';

test('Latch is promoted across public character discovery surfaces', async ({ page }) => {
  await page.goto(BASE + '/characters.html', { waitUntil: 'domcontentloaded' });
  const card = page.locator('.character-card').filter({ hasText: 'Latch' });
  await expect(card).toHaveCount(1);
  await expect(card).toContainText('Latch Boswell');
  await expect(card).toContainText('Human · Unenhanced');
  await expect(card).toContainText('OPI unscored');
  await expect(card).toHaveAttribute('data-release-order', '7');

  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-home-character="latch"]')).toHaveCount(1);
  await expect(page.locator('[data-home-slide="latch"]')).toHaveCount(1);
  await expect(page.locator('#upcoming-characters')).not.toContainText('Latch');

  await page.goto(BASE + '/news.html#upcoming-characters', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#upcoming-characters')).not.toContainText('Latch');

  await page.goto(BASE + '/start-here.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('a[href="characters/latch/"]').filter({ hasText: 'Latch' })).toHaveCount(1);
});

test('Latch dossier preserves supplied art package and unresolved canon boundaries', async ({ page }) => {
  await page.goto(BASE + '/characters/latch/', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('h1')).toHaveText('LATCH');
  await expect(page.locator('.character-subtitle')).toHaveText('Latch Boswell');
  await expect(page.locator('.character-feature-art img')).toHaveAttribute('src', '../../assets/characters/latch/latch-header.webp');

  const required = [
    'latch-broken-building-01.webp',
    'latch-broken-building-02.webp',
    'latch-casual-01.webp',
    'latch-casual-02.webp',
    'latch-combat-01.webp',
    'latch-combat-02.webp',
    'latch-cover-01.webp',
    'latch-cover-02.webp',
    'latch-desert-01.webp',
    'latch-sniping.webp'
  ];
  const sources = await page.locator('img').evaluateAll(images => images.map(img => img.getAttribute('src') || ''));
  for (const asset of required) expect(sources.some(src => src.endsWith(asset)), asset).toBe(true);

  await expect(page.locator('body')).toContainText('The enemy, technology or power, location, exact mission, and outcome details are intentionally open writer decisions.');
  await expect(page.locator('body')).toContainText('No cybernetic replacement is established.');
  await expect(page.locator('body')).toContainText('Not yet numerically established.');
});

test('Latch remains outside numeric OPI until creator-approved scores exist', async ({ page }) => {
  await page.goto(BASE + '/dpi.html', { waitUntil: 'networkidle' });
  const records = await page.evaluate(() => window.OLDROOT_CHARACTERS.map(c => c.codename));
  expect(records).not.toContain('Latch');
});

test('Latch dossier remains contained at phone width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE + '/characters/latch/', { waitUntil: 'domcontentloaded' });

  const dims = await page.evaluate(() => ({
    viewport: innerWidth,
    html: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
    feature: document.querySelector('.character-feature-art').getBoundingClientRect().width,
    header: document.querySelector('.masthead').getBoundingClientRect().width
  }));

  expect(dims.html).toBeLessThanOrEqual(dims.viewport + 2);
  expect(dims.body).toBeLessThanOrEqual(dims.viewport + 2);
  expect(dims.feature).toBeLessThanOrEqual(dims.viewport);
  expect(dims.header).toBeLessThanOrEqual(dims.viewport + 1);
});

test('Latch release updates public counts, README, and sitemap', async ({ page }) => {
  await page.goto(BASE + '/start-here.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.start-stat').filter({ hasText: 'Public character dossiers' })).toContainText('7 active records');

  const sitemap = await (await page.request.get(BASE + '/sitemap.xml')).text();
  expect(sitemap).toContain('/characters/latch/');
  expect(sitemap).not.toContain('\\n');

  const readme = await (await page.request.get(BASE + '/README.md')).text();
  expect(readme).toContain('- Latch / Latch Boswell');
});
