const { test, expect } = require('@playwright/test');

const BASE = 'http://127.0.0.1:8000';

// Visual contracts for the cleaner carbon surfaces and Liontone's actual dossier.
// Keep illustrations, canon and the eleven official OPI fields unchanged.
test('shared carbon card surfaces are smooth rather than cross-hatched', async ({ page }) => {
  for (const [route, selector] of [
    ['/characters.html', '.character-card'],
    ['/characters/agent-emerald/', '.wiki-section'],
    ['/characters/liontone/', '.wiki-section'],
  ]) {
    await page.goto(BASE + route, { waitUntil: 'domcontentloaded' });
    const surface = page.locator(selector).first();
    await expect(surface).toBeVisible();
    const background = await surface.evaluate(el => getComputedStyle(el).backgroundImage);
    expect(background, route + ' ' + selector).not.toContain('repeating-linear-gradient');
  }
});

test('Liontone has an uncluttered top service record and legible text on desktop and phone', async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(BASE + '/characters/liontone/', { waitUntil: 'domcontentloaded' });
    const main = page.locator('main.liontone-dossier');
    await expect(main).toBeVisible();
    await expect(main.locator('.character-identity h1')).toHaveText('LIONTONE');
    const service = main.locator('.guardian-service-record');
    await expect(service).toContainText('Jamaica’s guardian');
    await expect(service).toContainText('Jamaica Defence Force');
    await expect(service).not.toContainText('LIONTONE');

    const geometry = await page.evaluate(() => {
      const title = document.querySelector('.character-identity h1').getBoundingClientRect();
      const record = document.querySelector('.guardian-service-record').getBoundingClientRect();
      const paragraph = document.querySelector('.wiki-section p');
      const info = document.querySelector('.info-row dd');
      const dpi = document.querySelector('.dpi-name');
      return {
        title: { left: title.left, right: title.right, bottom: title.bottom },
        record: { left: record.left, top: record.top, right: record.right },
        copySize: parseFloat(getComputedStyle(paragraph).fontSize),
        copyColor: getComputedStyle(paragraph).color,
        infoSize: parseFloat(getComputedStyle(info).fontSize),
        dpiSize: parseFloat(getComputedStyle(dpi).fontSize),
        viewport: innerWidth,
        docWidth: document.documentElement.scrollWidth,
        bodyWidth: document.body.scrollWidth
      };
    });
    expect(geometry.copySize).toBeGreaterThanOrEqual(width < 620 ? 15 : 16);
    expect(geometry.infoSize).toBeGreaterThanOrEqual(14);
    expect(geometry.dpiSize).toBeGreaterThanOrEqual(13);
    expect(geometry.docWidth).toBeLessThanOrEqual(geometry.viewport + 2);
    expect(geometry.bodyWidth).toBeLessThanOrEqual(geometry.viewport + 2);
    if (width > 920) {
      expect(geometry.record.left).toBeGreaterThan(geometry.title.right - 10);
    } else {
      expect(geometry.record.top).toBeGreaterThan(geometry.title.bottom);
    }

    await expect(main.locator('.dpi-row')).toHaveCount(11);
    await expect(main.locator('.dossier-illustration')).toHaveCount(2);
    await expect(main.locator('.character-portrait img')).toHaveAttribute('src', '../../assets/characters/liontone/liontone-ruins.webp');
  }
});
