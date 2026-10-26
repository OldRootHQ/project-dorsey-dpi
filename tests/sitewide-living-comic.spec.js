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
    expect(theme.background).toContain('oldroot-cosmic-field.svg');
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

test('Indexed place cards use readable light type on carbon composite', async ({ page }) => {
  await page.goto(BASE + '/locations.html', { waitUntil: 'networkidle' });
  const firstCard = page.locator('.location-dossier-cards a.place-card').first();
  await expect(firstCard).toBeVisible();
  await expect(firstCard.locator('h3')).toHaveCSS('color', 'rgb(252, 246, 233)');
  await expect(firstCard.locator('p')).toHaveCSS('color', 'rgb(207, 219, 208)');
});

test('Character registry metadata pills have accessible carbon-and-gold contrast', async ({ page }) => {
  await page.goto(BASE + '/characters.html', { waitUntil: 'networkidle' });
  const pill = page.locator('.character-card .meta-pill').first();
  await expect(pill).toBeVisible();
  await expect(pill).toHaveCSS('color', 'rgb(226, 209, 166)');
  await expect(pill).toHaveCSS('background-color', 'rgb(26, 56, 43)');
});


test('Marketplace uses high-contrast type on cosmic canvas and dark showcase panels', async ({ page }) => {
  await page.goto(BASE + '/marketplace.html', { waitUntil: 'networkidle' });
  await expect(page.locator('#marketplace-library-title')).toHaveCSS('color', 'rgb(250, 244, 232)');
  await expect(page.locator('#marketplace-stickers-title')).toHaveCSS('color', 'rgb(250, 244, 232)');
  await expect(page.locator('.library-feature .library-section-head h2')).toHaveCSS('color', 'rgb(255, 245, 231)');
  await expect(page.locator('.library-feature .feature-slide.active .feature-copy h3')).toHaveCSS('color', 'rgb(255, 245, 231)');
});


test('OPI profile sidebar retains its readable tactical dark contrast', async ({ page }) => {
  await page.goto(BASE + '/dpi.html', { waitUntil: 'networkidle' });
  const detailPanel = page.locator('.shell .panel.detail-panel');
  await expect(detailPanel).toBeVisible();
  await expect(detailPanel).toHaveCSS('color', 'rgb(227, 231, 220)');
  await expect(detailPanel.locator('.name')).toHaveCSS('color', 'rgb(240, 234, 223)');
});


for (const [label, width, height] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
  test(`Publisher header and essential footer links survive homepage rendering (${label})`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    const header = page.locator('header.masthead');
    await expect(header).toBeVisible();
    await expect(header.locator('a.brand')).toBeVisible();
    await expect(header.locator('nav.site-nav')).toHaveCount(1);
    const headerPosition = await header.evaluate(el => {
      const rect = el.getBoundingClientRect();
      const logo = getComputedStyle(el.querySelector('a.brand')).backgroundImage;
      return { y: rect.y, height: rect.height, logo };
    });
    expect(headerPosition.y).toBeGreaterThanOrEqual(-1);
    expect(headerPosition.y).toBeLessThanOrEqual(2);
    expect(headerPosition.height).toBeGreaterThan(45);
    expect(headerPosition.logo).toContain('assets/approved-home/primary-logo.webp');
    if (width > 760) {
      await expect(header.locator('nav.site-nav > a[href="index.html"]')).toBeVisible();
      await expect(header.locator('nav.site-nav > a[href="news.html"]')).toBeVisible();
      await expect(header.locator('[aria-controls="nav-characters-menu"]')).toBeVisible();
      await expect(header.locator('[aria-controls="nav-world-menu"]')).toBeVisible();
      await expect(header.locator('[aria-controls="nav-lore-menu"]')).toBeVisible();
    } else {
      const toggle = header.locator('.mobile-nav-toggle');
      await expect(toggle).toBeVisible();
      await toggle.click();
      await expect(header.locator('.site-nav')).toBeVisible();
      await toggle.click();
    }
    const footer = page.locator('footer.oldroot-footer');
    await expect(footer).toBeVisible();
    await expect(footer.locator('.footer-links a[href="contact.html"]')).toHaveText('Contact Us');
    await expect(footer.locator('.footer-links a[href="work-with-oldroot.html"]')).toHaveText('Work with OldRoot');
    for (const target of ['start-here.html','characters.html','locations.html','lore.html',
      'marketplace.html','news.html','about.html','dpi.html']) {
      await expect(footer.locator(`.footer-links a[href="${target}"]`)).toHaveCount(1);
    }
    await expect(footer.locator('.footer-bottom')).toContainText('2026');
  });
}
