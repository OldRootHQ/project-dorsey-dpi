const { test, expect } = require('@playwright/test');

const BASE = 'http://127.0.0.1:8000';
const pages = [
  '/',
  '/characters.html',
  '/characters/anchorage/',
  '/characters/commotion/',
  '/characters/agent-emerald/',
  '/characters/kokio/',
  '/characters/amari-razman/',
  '/characters/ballestera/',
  '/locations.html',
  '/locations/baltimore/',
  '/locations/seattle/',
  '/locations/hilo/',
  '/organizations/dunamis-dynamics/',
  '/dpi.html',
  '/library.html',
  '/news.html'
];

test.use({ viewport: { width: 390, height: 844 } });

test('core OldRoot pages stay inside the phone viewport', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));

  for (const path of pages) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });

    const layout = await page.evaluate(() => ({
      viewport: window.innerWidth,
      htmlWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth,
      mastWidth: document.querySelector('.masthead').getBoundingClientRect().width,
      mastHeight: document.querySelector('.masthead').getBoundingClientRect().height,
      mobileToggleVisible: (() => {
        const toggle = document.querySelector('.mobile-nav-toggle');
        return !!toggle && getComputedStyle(toggle).display !== 'none';
      })(),
      navDisplay: getComputedStyle(document.querySelector('.site-nav')).display,
      main: (() => {
        const el = document.querySelector('main');
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { left: r.left, right: r.right, width: r.width };
      })()
    }));

    expect(layout.htmlWidth, `${path} html overflowed horizontally`).toBeLessThanOrEqual(layout.viewport + 2);
    expect(layout.bodyWidth, `${path} body overflowed horizontally`).toBeLessThanOrEqual(layout.viewport + 2);
    expect(layout.mastWidth, `${path} masthead exceeded viewport`).toBeLessThanOrEqual(layout.viewport + 1);
    expect(layout.mastHeight, `${path} compact mobile header is too tall`).toBeLessThanOrEqual(84);
    expect(layout.mobileToggleVisible, `${path} mobile menu toggle is not visible`).toBe(true);
    expect(layout.navDisplay, `${path} primary navigation should start collapsed on phones`).toBe('none');

    if (layout.main) {
      expect(layout.main.left, `${path} main content starts off-screen`).toBeGreaterThanOrEqual(-1);
      expect(layout.main.right, `${path} main content ends off-screen`).toBeLessThanOrEqual(layout.viewport + 1);
    }
  }

  expect(errors, `Unexpected page errors: ${errors.join(' | ')}`).toEqual([]);
});

test('mobile-specific complex controls reflow instead of compressing desktop grids', async ({ page }) => {
  await page.goto(`${BASE}/locations.html`, { waitUntil: 'domcontentloaded' });
  const globeControlColumns = await page.locator('.world-controls').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
  expect(globeControlColumns).toBeLessThanOrEqual(2);

  await page.goto(`${BASE}/dpi.html`, { waitUntil: 'domcontentloaded' });
  const axisColumns = await page.locator('.axis-controls').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
  expect(axisColumns).toBe(1);

  await page.goto(`${BASE}/characters/anchorage/`, { waitUntil: 'domcontentloaded' });
  const titleSize = parseFloat(await page.locator('.character-identity h1').evaluate(el => getComputedStyle(el).fontSize));
  expect(titleSize).toBeLessThanOrEqual(60);
});


test('mobile primary navigation expands cleanly and registry art uses editorial crops', async ({ page }) => {
  await page.goto(`${BASE}/characters.html`, { waitUntil: 'domcontentloaded' });

  const toggle = page.locator('.mobile-nav-toggle');
  const nav = page.locator('.site-nav');

  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(nav).toBeHidden();

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(nav).toBeVisible();

  const columns = await nav.evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
  expect(columns).toBe(3);

  const thumbHeight = await page.locator('.character-thumb').first().evaluate(el => el.getBoundingClientRect().height);
  expect(thumbHeight).toBeGreaterThanOrEqual(245);
  expect(thumbHeight).toBeLessThanOrEqual(290);

  await toggle.click();
  await expect(nav).toBeHidden();
});


test('desktop Character Registry artwork stays within editorial card framing', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(`${BASE}/characters.html`, { waitUntil: 'domcontentloaded' });

  const metrics = await page.locator('.character-thumb').evaluateAll(images => images.map(img => {
    const r = img.getBoundingClientRect();
    return { width: r.width, height: r.height };
  }));

  expect(metrics.length).toBe(9);
  for (const metric of metrics) {
    expect(metric.height).toBeGreaterThanOrEqual(255);
    expect(metric.height).toBeLessThanOrEqual(365);
    expect(metric.height / metric.width).toBeLessThan(0.9);
  }

  await page.close();
});
