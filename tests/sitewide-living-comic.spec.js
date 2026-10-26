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
