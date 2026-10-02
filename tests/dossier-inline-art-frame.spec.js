const { test, expect } = require('@playwright/test');

const BASE = 'http://127.0.0.1:8000';
const DOSSIERS = [
  '/characters/commotion/',
  '/characters/aftermark/',
  '/characters/anchorage/',
  '/characters/gila-monster/',
  '/characters/kincast/',
  '/characters/agent-emerald/'
];

test('inline dossier illustrations use the slimmer framed treatment', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });

  for (const url of DOSSIERS) {
    await page.goto(BASE + url, { waitUntil: 'domcontentloaded' });
    const figures = page.locator('.dossier-illustration');
    const count = await figures.count();
    expect(count, url).toBeGreaterThan(0);

    for (let i = 0; i < count; i += 1) {
      const figure = figures.nth(i);
      await figure.scrollIntoViewIfNeeded();

      const style = await figure.evaluate(el => {
        const rect = el.getBoundingClientRect();
        const parent = el.parentElement.getBoundingClientRect();
        const computed = getComputedStyle(el);
        const before = getComputedStyle(el, '::before');
        const after = getComputedStyle(el, '::after');
        return {
          width: rect.width,
          leftGap: rect.left - parent.left,
          rightGap: parent.right - rect.right,
          borderStyle: computed.borderTopStyle,
          borderWidth: computed.borderTopWidth,
          borderRadius: computed.borderRadius,
          shadow: computed.boxShadow,
          beforeTop: before.borderTopWidth,
          beforeLeft: before.borderLeftWidth,
          afterRight: after.borderRightWidth,
          afterBottom: after.borderBottomWidth
        };
      });

      expect(style.width, `${url} illustration ${i}`).toBeLessThanOrEqual(762);
      expect(Math.abs(style.leftGap - style.rightGap), `${url} illustration ${i}`).toBeLessThanOrEqual(3);
      expect(style.borderStyle).toBe('solid');
      expect(parseFloat(style.borderWidth)).toBeGreaterThanOrEqual(1);
      expect(parseFloat(style.borderRadius)).toBeGreaterThanOrEqual(15);
      expect(style.shadow).not.toBe('none');
      expect(parseFloat(style.beforeTop)).toBeGreaterThanOrEqual(3);
      expect(parseFloat(style.beforeLeft)).toBeGreaterThanOrEqual(3);
      expect(parseFloat(style.afterRight)).toBeGreaterThanOrEqual(3);
      expect(parseFloat(style.afterBottom)).toBeGreaterThanOrEqual(3);

      const image = figure.locator('img');
      await expect.poll(() => image.evaluate(img => img.naturalWidth)).toBeGreaterThan(0);
    }
  }
});

test('framed dossier illustrations remain full-width safe on phones', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const url of DOSSIERS) {
    await page.goto(BASE + url, { waitUntil: 'domcontentloaded' });
    const first = page.locator('.dossier-illustration').first();
    await first.scrollIntoViewIfNeeded();

    const dims = await page.evaluate(() => {
      const figure = document.querySelector('.dossier-illustration').getBoundingClientRect();
      return {
        viewport: innerWidth,
        html: document.documentElement.scrollWidth,
        body: document.body.scrollWidth,
        figureWidth: figure.width
      };
    });

    expect(dims.html, url).toBeLessThanOrEqual(dims.viewport + 2);
    expect(dims.body, url).toBeLessThanOrEqual(dims.viewport + 2);
    expect(dims.figureWidth, url).toBeLessThanOrEqual(dims.viewport);
  }
});
