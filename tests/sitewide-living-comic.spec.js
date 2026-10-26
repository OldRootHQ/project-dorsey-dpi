const { test, expect } = require('@playwright/test');
const BASE = 'http://127.0.0.1:8000';

/* Sitewide theme coverage: content records stay intact.
   Browser QA must be run before this draft PR is approved for production. */
const routes = [
  '/', '/characters.html', '/characters/kincast/', '/characters/gila-monster/',
  '/characters/anchorage/', '/characters/commotion/', '/locations.html',
  '/locations/baltimore/', '/locations/tucson/', '/lore.html',
  '/lore/abyron/', '/lore/genesis/', '/events.html', '/organizations.html',
  '/organizations/dunamis-dynamics/', '/start-here.html', '/news.html',
  '/marketplace.html', '/dpi.html', '/about.html'
];
for (const route of routes) {
  test('Living Comic theme: ' + route, async ({ page }) => {
    await page.goto(BASE + route, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toHaveClass(/oldroot-after-dark/);
    await expect(page.locator('.masthead .brand')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    const theme = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      const header = getComputedStyle(document.querySelector('.masthead'));
      const body = getComputedStyle(document.body);
      return {
        paper: root.getPropertyValue('--or-paper').trim(),
        ink: root.getPropertyValue('--or-ink').trim(),
        header: header.backgroundColor,
        background: body.backgroundImage,
        brokenImages: [...document.querySelectorAll('img')]
          .filter(img => img.hasAttribute('src') && img.getAttribute('src').trim() !== '' && img.complete && img.naturalWidth === 0)
          .map(img => img.getAttribute('src')),
      };
    });
    expect(theme.paper).toBe('#f1e5cf');
    expect(theme.ink).toBe('#171514');
    expect(theme.header).not.toBe('rgba(0, 0, 0, 0)');
    expect(theme.background).toContain('gradient');
    expect(theme.brokenImages).toEqual([]);
  });
}
test('Global mobile shell avoids unintended sideways scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ['/','/characters/kincast/','/locations/baltimore/','/lore.html']) {
    await page.goto(BASE + route, { waitUntil: 'domcontentloaded' });
    const dimensions = await page.evaluate(() => ({
      viewport: innerWidth,
      width: document.documentElement.scrollWidth,
    }));
    expect(dimensions.width, route).toBeLessThanOrEqual(dimensions.viewport + 3);
  }
});
test('The interactive world globe stays in the locations index', async ({ page }) => {
  await page.goto(BASE + '/locations.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#techGlobe')).toBeVisible();
  await expect(page.locator('#earthView')).toBeVisible();
  await expect(page.locator('#zoomInGlobe')).toBeVisible();
});


test('Approved art remains visible below the mobile fold', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await expect(page.locator('.lc-face img')).toHaveCount(8);
  await expect(page.locator('.lc-face[data-approved-art="true"]')).toHaveCount(8);
  const readiness = await page.locator('.lc-face img').evaluateAll(images =>
    images.map(img => ({ source: img.getAttribute('src'), loaded: img.complete && img.naturalWidth > 0 }))
  );
  expect(readiness.every(image => image.loaded), JSON.stringify(readiness)).toBe(true);
});

test('Indexed place cards use readable ink on café-paper, not dark ink on dark green', async ({ page }) => {
  await page.goto(BASE + '/locations.html', { waitUntil: 'networkidle' });
  const firstCard = page.locator('.location-dossier-cards a.place-card').first();
  await expect(firstCard).toBeVisible();
  await expect(firstCard.locator('h3')).toHaveCSS('color', 'rgb(41, 33, 30)');
  await expect(firstCard.locator('p')).toHaveCSS('color', 'rgb(89, 76, 66)');
});

test('Character registry metadata pills have accessible paper-and-ink contrast', async ({ page }) => {
  await page.goto(BASE + '/characters.html', { waitUntil: 'networkidle' });
  const pill = page.locator('.character-card .meta-pill').first();
  await expect(pill).toBeVisible();
  await expect(pill).toHaveCSS('color', 'rgb(41, 33, 30)');
  await expect(pill).toHaveCSS('background-color', 'rgb(241, 223, 196)');
});
