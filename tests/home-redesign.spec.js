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
  await expect(page.locator('.lc-face img')).toHaveCount(8);
  await expect(page.locator('.lc-face--pending')).toHaveCount(0);
  await expect(page.locator('.lc-face[data-approved-art="true"]')).toHaveCount(8);
  await expect(page.locator('.lc-wordmark[data-approved-logo="true"]')).toHaveCount(1);
  const directSources = await page.locator('.lc-face img').evaluateAll(images =>
    images.map(img => img.getAttribute('src'))
  );
  expect(directSources).toEqual([
    'assets/approved-home/kincast.webp',
    'assets/approved-home/anchorage.webp',
    'assets/approved-home/isiah-ivory.webp',
    'assets/approved-home/liontone.webp',
    'assets/approved-home/agent-emerald.webp',
    'assets/approved-home/remedie.webp',
    'assets/approved-home/flying-saucer.webp',
    'assets/approved-home/gila-monster.webp'
  ]);
  await expect(page.locator('.lc-face-name')).toHaveText([
    'Kincast','Anchorage','Isiah Ivory','Liontone',
    'Agent Emerald','Remedie','Flying Saucer','Gila Monster'
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
  // Approved palette deliberately avoids adjacent green and warm-orange panels.
  const shades = await page.locator('.lc-face').evaluateAll(elements =>
    elements.map(el => el.style.getPropertyValue('--panel-shade').trim().toLowerCase())
  );
  expect(shades).toEqual([
    '#c57a45','#174b9a','#a51f30','#34814b',
    '#123f30','#e3ae38','#7843ab','#e97627'
  ]);
  await expect(page.locator('.lc-face-flag')).toHaveCount(0);

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
