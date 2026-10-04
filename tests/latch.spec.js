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

test('Latch is connected to Australia on the World Index without inventing a city', async ({ page }) => {
  await page.goto(BASE + '/locations.html#australia', { waitUntil: 'networkidle' });
  await expect(page.locator('#locationName')).toHaveText('Australia');
  await expect(page.locator('#locationStatus')).toHaveText('Reference');
  await expect(page.locator('#locationCharacter a')).toHaveText('Latch');
  await expect(page.locator('#locationCharacter a')).toHaveAttribute('href', 'characters/latch/');
  await expect(page.locator('#locationNote')).toContainText('No specific Australian hometown or present-day base is established');

  await page.goto(BASE + '/characters/latch/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('a[href="../../locations.html#australia"]')).toHaveCount(2);
});

test('Latch appears in OPI Analytics as an unscored public record', async ({ page }) => {
  await page.goto(BASE + '/dpi.html', { waitUntil: 'networkidle' });
  const latch = await page.evaluate(() => window.OLDROOT_CHARACTERS.find(c => c.codename === 'Latch'));
  expect(latch).toBeTruthy();
  expect(latch.baseline).toBeNull();
  expect(latch.age).toBe(36);
  expect(latch.location).toBe('Australia');
  expect(latch.powerClass).toBeNull();

  await expect(page.locator('#count')).toHaveText('8 CHARACTERS');
  await expect(page.locator('#plot-count')).toContainText('7 plotted');
  await expect(page.locator('#unscored-panel')).toBeVisible();
  await expect(page.locator('[data-unscored-character="Latch"]')).toContainText('NUMERIC PROFILE NOT ESTABLISHED');

  await page.locator('[data-unscored-character="Latch"]').click();
  await expect(page.locator('#detail')).toContainText('Latch Boswell');
  await expect(page.locator('#detail')).toContainText('Numeric profile not established');
  await expect(page.locator('#detail')).toContainText('Missing values are not guessed');

  await page.locator('#search').fill('Latch');
  await expect(page.locator('#count')).toHaveText('1 CHARACTER');
  await expect(page.locator('#plot-count')).toContainText('0 plotted');
  await expect(page.locator('#detail')).toContainText('Numeric profile not established');
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
  await expect(page.locator('.start-stat').filter({ hasText: 'Public character dossiers' })).toContainText('8 active records');

  const sitemap = await (await page.request.get(BASE + '/sitemap.xml')).text();
  expect(sitemap).toContain('/characters/latch/');
  expect(sitemap).not.toContain('\\n');

  const readme = await (await page.request.get(BASE + '/README.md')).text();
  expect(readme).toContain('- Latch / Latch Boswell');
});
