const { test, expect } = require('@playwright/test');
const BASE = 'http://127.0.0.1:8000';

for (const width of [390, 768, 900]) {
  test(`homepage approved logo is naturally unframed at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    const wordmark = page.locator('.lc-hero-top .lc-wordmark');
    await expect(wordmark).toBeVisible();
    const appearance = await wordmark.evaluate(el => {
      const css = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        background: css.backgroundImage,
        border: css.borderTopWidth,
        shadow: css.boxShadow,
        padding: css.paddingLeft,
        radius: css.borderTopLeftRadius,
        backgroundColor: css.backgroundColor,
        left: rect.left, right: rect.right,
        viewport: window.innerWidth
      };
    });
    expect(appearance.background).toContain('assets/approved-home/primary-logo.webp');
    expect(appearance.background).not.toContain('gradient');
    expect(appearance.border).toBe('0px');
    expect(appearance.shadow).toBe('none');
    expect(appearance.padding).toBe('0px');
    expect(appearance.radius).toBe('0px');
    expect(appearance.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(appearance.left).toBeGreaterThanOrEqual(0);
    expect(appearance.right).toBeLessThanOrEqual(appearance.viewport + 1);
  });
}

test('desktop retains original publisher logo presentation', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  const appearance = await page.locator('.lc-hero-top .lc-wordmark').evaluate(el => {
    const css = getComputedStyle(el);
    return { background: css.backgroundImage, border: css.borderTopWidth, shadow: css.boxShadow };
  });
  expect(appearance.background).toContain('assets/approved-home/primary-logo.webp');
  expect(appearance.background).toContain('gradient');
  expect(appearance.border).not.toBe('0px');
  expect(appearance.shadow).not.toBe('none');
});
