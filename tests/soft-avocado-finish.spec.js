const { test, expect } = require('@playwright/test');

const BASE = 'http://127.0.0.1:8000';

test('masthead reuses the original red In Development sticker asset', async ({ page }) => {
  await page.goto(BASE + '/characters.html', { waitUntil: 'networkidle' });
  const sticker = page.locator('.masthead .brand .mast-development-sticker');
  await expect(sticker).toHaveCount(1);
  await expect(sticker).toBeVisible();
  await expect(sticker).toHaveAttribute('src', /assets\/approved-home\/in-development-sticker\.webp$/);
  const assetLoaded = await sticker.evaluate(img => img.complete && img.naturalWidth > 0);
  expect(assetLoaded).toBe(true);
});

test('public inquiry and collaborator forms target the verified studio address', async ({ page }) => {
  for (const route of ['/contact.html', '/work-with-oldroot.html']) {
    await page.goto(BASE + route);
    await expect(page.locator('form[action="https://formsubmit.co/contact@oldroothq.com"]')).toHaveCount(1);
    expect(await page.locator('body').innerText()).toContain('OLDROOT');
    expect(await page.locator('a[href^="mailto:contact@oldroothq.com"]').count()).toBeGreaterThan(0);
  }
  await expect(page.locator('a[href^="mailto:oldrootinquiries@gmail.com"]')).toHaveCount(0);
});

test('registry explainer has readable avocado panel and no carbon overlay', async ({ page }) => {
  await page.goto(BASE + '/characters.html');
  const panel = page.locator('.registry-explainer');
  await expect(panel).toBeVisible();
  await expect(panel.locator('.registry-note')).toHaveCSS('color', 'rgb(27, 53, 32)');
  const css = await panel.evaluate(el => getComputedStyle(el).backgroundImage);
  expect(css).toContain('linear-gradient');
  expect(css).toContain('183, 207, 138');
});

test('world console outside the globe uses avocado while inner gold nodes remain styled by existing rules', async ({ page }) => {
  await page.goto(BASE + '/locations.html');
  await expect(page.locator('.location-terminal')).toHaveCSS('border-top-color', 'rgb(183, 207, 138)');
  await expect(page.locator('.terminal-regional')).toBeVisible();
  await expect(page.locator('.terminal-regional p')).toHaveCSS('color', 'rgb(29, 57, 35)');
  const stage = page.locator('.globe-stage');
  await expect(stage).toBeVisible();
  await expect(page.locator('#techGlobe')).toBeVisible();
  const markerColor = await page.evaluate(() => getComputedStyle(document.body).getPropertyValue('--old-gold').trim());
  expect(markerColor).toBe('#d0ad56');
});
