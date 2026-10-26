const { test, expect } = require('@playwright/test');

const BASE = 'http://127.0.0.1:8000';

for (const [name, route] of [
  ['homepage', '/'],
  ['character registry', '/characters.html'],
  ['character dossier', '/characters/remedie/'],
  ['locations', '/locations.html'],
  ['lore', '/lore.html'],
  ['marketplace', '/marketplace.html'],
  ['dispatches', '/news.html']
]) {
  test(`HQ 2.1 cosmic canvas reaches ${name} without background graffiti`, async ({ page }) => {
    await page.goto(BASE + route, { waitUntil: 'networkidle' });
    const theme = await page.evaluate(() => {
      const bodyStyle = getComputedStyle(document.body);
      const before = getComputedStyle(document.body, '::before');
      const after = getComputedStyle(document.body, '::after');
      return {
        background: bodyStyle.backgroundImage,
        bodyColor: bodyStyle.color,
        before: before.display,
        after: after.display
      };
    });
    expect(theme.background).toContain('oldroot-cosmic-field.svg');
    expect(theme.before).toBe('none');
    expect(theme.after).toBe('none');
    await expect(page.locator('.masthead .brand')).toBeVisible();
  });
}

for (const [mode, width, height] of [
  ['desktop', 1440, 900],
  ['mobile', 390, 844]
]) {
  test(`HQ 2.1 retains approved identity with strong masthead and composite features (${mode})`, async ({ page }) => {
    await page.setViewportSize({width,height});
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    const brand = page.locator('.masthead .brand');
    const logoBox = page.locator('.lc-wordmark');
    const carbonFeature = page.locator('.home-featured');
    const carbonLibrary = page.locator('.home-library-section');
    const hero = page.locator('.lc-hero');
    await expect(brand).toBeVisible();
    await expect(logoBox).toBeVisible();
    await expect(carbonFeature).toBeVisible();
    await expect(carbonLibrary).toBeVisible();
    const visuals = await page.evaluate(() => {
      const background = el => getComputedStyle(document.querySelector(el)).backgroundImage;
      const logoRect = document.querySelector('.masthead .brand').getBoundingClientRect();
      return {
        logoWidth:logoRect.width,
        logoBackground:background('.masthead .brand'),
        heroLogoBackground:background('.lc-wordmark'),
        heroBackground:background('.lc-hero'),
        featureBackground:background('.home-featured'),
        libraryBackground:background('.home-library-section'),
        portraitSources:[...document.querySelectorAll('.lc-face-grid .lc-face img')].map(el => el.getAttribute('src')),
        width:document.documentElement.scrollWidth,
        viewport:innerWidth
      };
    });
    expect(visuals.logoWidth).toBeGreaterThanOrEqual(mode==='desktop'?218:180);
    expect(visuals.logoBackground).toContain('approved-home/primary-logo.webp');
    expect(visuals.heroLogoBackground).toContain('approved-home/primary-logo.webp');
    expect(visuals.featureBackground).toContain('repeating-linear-gradient');
    expect(visuals.libraryBackground).toContain('repeating-linear-gradient');
    expect(visuals.heroBackground).toContain('gradient');
    expect(visuals.portraitSources).toHaveLength(8);
    expect(visuals.width).toBeLessThanOrEqual(visuals.viewport+3);
    await expect(page.locator('.oldroot-footer a[href="contact.html"]')).toBeVisible();
  });
}
