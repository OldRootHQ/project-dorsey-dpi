const { test, expect } = require('@playwright/test');
const fs = require('fs');

const BASE = 'http://127.0.0.1:8000';
const key = 'oldroot-welcome-seen-v1';

// Clear the default entered-visitor fixture before document scripts run.
test('first-time visitor sees the approved OldRoot welcome, then can enter once', async ({ page }) => {
  await page.setViewportSize({ width: 1648, height: 928 });
  await page.addInitScript((storageKey) => localStorage.removeItem(storageKey), key);
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });

  const modal = page.locator('#oldrootWelcome');
  await expect(modal).toBeVisible();
  await expect(modal.locator('[role="dialog"]')).toHaveAttribute('aria-modal', 'true');
  await expect(modal.locator('#orWelcomeTitle')).toHaveText('A Universe in the Making');
  await expect(modal).toContainText('Graphic-Action Novels');
  await expect(modal).toContainText('OldRoot is far from finished.');
  await expect(modal).toContainText('Welcome to the beginning of OldRoot.');
  await expect(page.locator('main')).toHaveJSProperty('inert', true);

  const logo = modal.locator('.or-welcome-logo');
  await expect(logo).toHaveAttribute('src', 'assets/approved-home/primary-logo-master.png');
  await expect.poll(() => logo.evaluate(img => img.complete && img.naturalWidth === 1448 && img.naturalHeight === 1086)).toBe(true);
  const backdrop = await modal.evaluate(el => getComputedStyle(el).backdropFilter);
  expect(backdrop).toContain('blur(');

  // No homepage, character, or poll rewrite.
  await expect(page.locator('.lc-face-grid .lc-face')).toHaveCount(8);
  const artwork = await page.locator('.lc-face img').evaluateAll(imgs => imgs.map(img => img.getAttribute('src')));
  expect(artwork).toEqual([
    'assets/approved-home/kincast.webp',
    'assets/approved-home/anchorage.webp',
    'assets/approved-home/isiah-ivory.webp',
    'assets/approved-home/liontone.webp',
    'assets/approved-home/agent-emerald.webp',
    'assets/approved-home/remedie.webp',
    'assets/approved-home/flying-saucer.webp',
    'assets/approved-home/gila-monster.webp'
  ]);

  fs.mkdirSync('artifacts/visual-qa', { recursive: true });
  await page.screenshot({ path: 'artifacts/visual-qa/desktop-welcome-modal.png', animations: 'disabled' });
  await modal.locator('.or-welcome-enter').click();
  await expect(modal).toBeHidden();
  await expect(page.locator('main')).toHaveJSProperty('inert', false);
  await expect.poll(() => page.evaluate(k => localStorage.getItem(k), key)).toBe('yes');

  // A new tab inherits the dismissal, without the one-time test init hook.
  const returning = await page.context().newPage();
  await returning.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await expect(returning.locator('#oldrootWelcome')).toBeHidden();
  await returning.close();
});

test('welcome is scrollable and accessible on phone, with an explicit reopen link', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE + '/?welcome=1', { waitUntil: 'networkidle' });
  const modal = page.locator('#oldrootWelcome');
  await expect(modal).toBeVisible();
  const metrics = await page.evaluate(() => {
    const card = document.querySelector('.or-welcome-card');
    const rect = card.getBoundingClientRect();
    return { viewport: innerWidth, width: document.documentElement.scrollWidth, left: rect.left, right: rect.right, height: rect.height, maxHeight: innerHeight };
  });
  expect(metrics.width).toBeLessThanOrEqual(metrics.viewport + 1);
  expect(metrics.left).toBeGreaterThanOrEqual(0);
  expect(metrics.right).toBeLessThanOrEqual(metrics.viewport + 1);
  expect(metrics.height).toBeLessThanOrEqual(metrics.maxHeight);
  fs.mkdirSync('artifacts/visual-qa', { recursive: true });
  await page.screenshot({ path: 'artifacts/visual-qa/mobile-welcome-modal.png', animations: 'disabled' });
  await expect(modal.locator('.or-welcome-close')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(modal.locator('.or-welcome-enter')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(modal.locator('.or-welcome-close')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(modal).toBeHidden();
});

test('short phone still scrolls the modal instead of clipping the Enter button', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto(BASE + '/?welcome=1', { waitUntil: 'domcontentloaded' });
  const card = page.locator('.or-welcome-card');
  await expect(card).toBeVisible();
  await expect.poll(() => card.evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true);
  await page.locator('.or-welcome-enter').click();
  await expect(page.locator('#oldrootWelcome')).toBeHidden();
});
