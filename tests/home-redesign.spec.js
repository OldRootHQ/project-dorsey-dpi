const { test, expect } = require('@playwright/test');

const BASE = 'http://127.0.0.1:8000';

test('OldRoot After Dark homepage prototype is active on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });

  await expect(page.locator('body')).toHaveClass(/home-after-dark/);
  await expect(page.locator('body')).toHaveAttribute('data-home-prototype', 'after-dark');
  await expect(page.locator('.hero-root-map')).toHaveCount(1);
  await expect(page.locator('.hero-signal-row')).toHaveCount(0);
  await expect(page.locator('.hero-actions a')).toHaveCount(2);

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
  expect(visual.heroHeight).toBeGreaterThanOrEqual(600);
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
    heroActionsVisible: [...document.querySelectorAll('.editorial-hero .hero-actions a')].every(link => link.getBoundingClientRect().width > 0)
  }));

  expect(layout.htmlWidth).toBeLessThanOrEqual(layout.viewport + 2);
  expect(layout.bodyWidth).toBeLessThanOrEqual(layout.viewport + 2);
  expect(layout.heroWidth).toBeLessThanOrEqual(layout.viewport);
  expect(layout.rootMapWidth).toBeLessThan(layout.viewport);
  expect(layout.heroActionsVisible).toBe(true);
});

test('Issue #1 announcement is prominent and reveals no unreleased story connection', async ({ page }) => {
  await page.goto('http://127.0.0.1:8000/', { waitUntil: 'domcontentloaded' });
  const announcement = page.locator('#issue-one-announcement');
  await expect(announcement).toBeVisible();
  await expect(announcement.locator('h2')).toHaveText('UNDEROBSERVATION');
  await expect(announcement).toContainText('ISSUE #1');
  await expect(announcement).toContainText('IN DEVELOPMENT');
  await expect(announcement).not.toContainText('Kincast');
  await expect(announcement.locator('a')).toHaveCount(0);
  const desktop = await announcement.boundingBox();
  expect(desktop.height).toBeGreaterThan(250);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(announcement).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(overflow).toBeLessThanOrEqual(2);
});
