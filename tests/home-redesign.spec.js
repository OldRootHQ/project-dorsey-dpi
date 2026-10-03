const { test, expect } = require('@playwright/test');

const BASE = 'http://127.0.0.1:8000';

test('OldRoot After Dark homepage prototype is active on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });

  await expect(page.locator('body')).toHaveClass(/home-after-dark/);
  await expect(page.locator('body')).toHaveAttribute('data-home-prototype', 'after-dark');
  await expect(page.locator('.hero-root-map')).toHaveCount(1);
  await expect(page.locator('.hero-signal-row > div')).toHaveCount(3);

  const visual = await page.evaluate(() => {
    const body = getComputedStyle(document.body);
    const hero = document.querySelector('.editorial-hero').getBoundingClientRect();
    const featured = document.querySelector('.home-featured');
    const featuredStyle = getComputedStyle(featured);
    const art = document.querySelector('.home-character-slide.active .home-character-art').getBoundingClientRect();
    const card = document.querySelector('.discovery-card');
    const cardStyle = getComputedStyle(card);
    return {
      bodyBackground: body.backgroundImage,
      heroHeight: hero.height,
      featuredBackground: featuredStyle.backgroundImage,
      artHeight: art.height,
      cardBackground: cardStyle.backgroundImage,
      cardColor: cardStyle.color
    };
  });

  expect(visual.bodyBackground).toContain('gradient');
  expect(visual.heroHeight).toBeGreaterThan(600);
  expect(visual.featuredBackground).toContain('gradient');
  expect(visual.artHeight).toBeGreaterThan(500);
  expect(visual.cardBackground).toContain('gradient');
  expect(visual.cardColor).not.toBe('rgb(21, 21, 21)');
});

test('OldRoot After Dark homepage remains contained on phone width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });

  const layout = await page.evaluate(() => ({
    viewport: innerWidth,
    htmlWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
    heroWidth: document.querySelector('.editorial-hero').getBoundingClientRect().width,
    rootMapWidth: document.querySelector('.hero-root-map').getBoundingClientRect().width,
    signalColumns: getComputedStyle(document.querySelector('.hero-signal-row')).gridTemplateColumns.split(' ').length
  }));

  expect(layout.htmlWidth).toBeLessThanOrEqual(layout.viewport + 2);
  if (layout.bodyWidth > layout.viewport + 2) {
    const offenders = await page.evaluate(() => [...document.querySelectorAll('body *')].map(el => {
      const r = el.getBoundingClientRect();
      return { tag: el.tagName, id: el.id, cls: String(el.className || '').slice(0,120), left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width) };
    }).filter(x => x.right > innerWidth + 2 || x.left < -2).sort((a,b) => Math.max(b.right-innerWidth,-b.left)-Math.max(a.right-innerWidth,-a.left)).slice(0,12));
    console.log('MOBILE_OVERFLOW_OFFENDERS', JSON.stringify(offenders));
  }
  expect(layout.bodyWidth).toBeLessThanOrEqual(layout.viewport + 2);
  expect(layout.heroWidth).toBeLessThanOrEqual(layout.viewport);
  expect(layout.rootMapWidth).toBeLessThan(layout.viewport);
  expect(layout.signalColumns).toBe(3);
});
