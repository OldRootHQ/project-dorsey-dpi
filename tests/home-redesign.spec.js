const { test, expect } = require('@playwright/test');
const BASE = 'http://127.0.0.1:8000';

test('Living Comic homepage leads with eight approved-identity panels', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await expect(page.locator('body')).toHaveClass(/home-living-comic/);
  await expect(page.locator('.lc-hero')).toBeVisible();
  await expect(page.locator('.lc-hero')).toContainText('EXTRAORDINARY PEOPLE.');
  await expect(page.locator('.lc-hero')).toContainText('UNFORGETTABLE STORIES.');
  await expect(page.locator('.lc-face')).toHaveCount(8);
  await expect(page.locator('.lc-face img')).toHaveCount(7);
  await expect(page.locator('.lc-face--pending')).toContainText('Liontone');
  await expect(page.locator('.lc-face-name')).toHaveText([
    'Kincast','Anchorage','Flying Saucer','Liontone',
    'Latch','Remedie','Gila Monster','Agent Emerald'
  ]);
  await expect(page.locator('.lc-hero-actions a')).toHaveCount(3);
  await expect(page.locator('.editorial-hero')).toHaveCount(0);

  const checked = await page.locator('.lc-face img').evaluateAll(images =>
    images.map(img => ({ src: img.getAttribute('src'), loaded: img.complete && img.naturalWidth > 0 }))
  );
  expect(checked.every(item => item.loaded), JSON.stringify(checked)).toBe(true);

  const cols = await page.locator('.lc-face-grid').evaluate(el =>
    getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length
  );
  expect(cols).toBe(4);

  await expect(page.locator('#techGlobe')).toHaveCount(0);
  await expect(page.locator('#issue-one')).toContainText('IN DEVELOPMENT');
});

test('Living Comic eight-panel homepage reflows within a phone viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  const layout = await page.evaluate(() => ({
    viewport: innerWidth,
    htmlWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
    cols: getComputedStyle(document.querySelector('.lc-face-grid')).gridTemplateColumns.split(' ').filter(Boolean).length,
    ctaCount: [...document.querySelectorAll('.lc-hero-actions a')].filter(a => a.getBoundingClientRect().width > 0).length,
  }));
  expect(layout.htmlWidth).toBeLessThanOrEqual(layout.viewport + 2);
  expect(layout.bodyWidth).toBeLessThanOrEqual(layout.viewport + 2);
  expect(layout.cols).toBe(2);
  expect(layout.ctaCount).toBe(3);
});

test('Locations retains the original interactive globe while adopting editorial shell', async ({ page }) => {
  await page.goto(BASE + '/locations.html', { waitUntil: 'networkidle' });
  await expect(page.locator('body')).toHaveClass(/locations-living-comic/);
  await expect(page.locator('#techGlobe')).toBeVisible();
  await expect(page.locator('#earthView')).toBeVisible();
  await expect(page.locator('#zoomInGlobe')).toBeVisible();
  await expect(page.locator('.locations-cosmic-copy')).toContainText('Every hero has a hometown');
});
