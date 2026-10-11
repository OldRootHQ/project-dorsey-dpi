const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const BASE = 'http://127.0.0.1:8000';
test('unpublished sticker preview shows 8 exact approved emblems without fake purchase links', async ({ page }) => {
  await page.goto(BASE + '/merch.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('[data-merch-character]')).toHaveCount(8);
  await expect(page.locator('body')).toContainText('NO ORDERS OR PAYMENTS ACCEPTED');
  await expect(page.locator('body')).toContainText('Sample pending');
  await expect(page.getByRole('button', { name: /buy|add to bag|checkout/i })).toHaveCount(0);
  await expect(page.locator('main a[href*="checkout"], main a[href*="cart.html"], main [data-buy]')).toHaveCount(0);
  for (const slug of ['gila-monster','commotion','aftermark','kincast','anchorage','agent-emerald','latch','remedie']) {
    const card = page.locator('[data-merch-character="' + slug + '"]');
    await expect(card.locator('img')).toHaveAttribute('src', new RegExp('^assets/characters/' + slug + '/.*-emblem\\.svg$'));
    await expect(card.locator('a')).toHaveAttribute('href', 'characters/' + slug + '/');
    const image = card.locator('img');
    await expect.poll(() => image.evaluate(el => el.naturalWidth)).toBeGreaterThan(0);
  }
});
test('sticker preview remains inside mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE + '/merch.html', { waitUntil: 'domcontentloaded' });
  const dim = await page.evaluate(() => ({scroll:document.documentElement.scrollWidth,width:window.innerWidth}));
  expect(dim.scroll).toBeLessThanOrEqual(dim.width + 2);
  await expect(page.locator('[data-merch-character]')).toHaveCount(8);
});
