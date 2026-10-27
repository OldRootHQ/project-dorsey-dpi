const { test, expect } = require('@playwright/test');

const BASE = 'http://127.0.0.1:8000';
const AVOCADO = 'rgb(183, 207, 138)';

test('masthead dropdown carets and active navigation accents use avocado across pages', async ({ page }) => {
  for (const path of ['/', '/characters.html', '/locations.html', '/contact.html', '/lore.html']) {
    await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.masthead .brand')).toBeVisible();
    await expect(page.locator('.masthead .nav-caret').first()).toHaveCSS('color', AVOCADO);
    const after = await page.locator('.masthead .nav-menu-button').first()
      .evaluate(el => getComputedStyle(el, '::after').backgroundImage);
    expect(after).toContain(AVOCADO);
    const gold = await page.locator('.masthead').evaluate(el => getComputedStyle(el).getPropertyValue('--old-gold').trim());
    expect(gold).toBe('#B7CF8A');
  }
});

test('mobile nav icon and dropdown arrow use green, not leftover gold', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE + '/characters.html', { waitUntil: 'domcontentloaded' });
  const toggle = page.locator('.masthead .mobile-nav-toggle');
  await expect(toggle).toBeVisible();
  await expect(toggle.locator('.mobile-nav-icon i').first()).toHaveCSS('background-color', AVOCADO);
  await toggle.click();
  await expect(page.locator('.masthead .nav-caret').first()).toHaveCSS('color', AVOCADO);
  await expect(page.locator('#nav-characters-menu')).toBeHidden();
  await page.locator('.masthead [aria-controls="nav-characters-menu"]').click();
  await expect(page.locator('#nav-characters-menu')).toBeVisible();
});
