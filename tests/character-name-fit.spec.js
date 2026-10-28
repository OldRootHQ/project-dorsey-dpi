const { test, expect } = require('@playwright/test');

const BASE = 'http://127.0.0.1:8000';
const characters = [
  'aftermark', 'agent-emerald', 'amari-razman', 'anchorage',
  'ballestera', 'commotion', 'deuce', 'flying-saucer',
  'gila-monster', 'kincast', 'latch', 'max-corbett', 'remedie'
];

async function checkTitle(page, slug, width) {
  await page.goto(BASE + '/characters/' + slug + '/', { waitUntil: 'domcontentloaded' });
  const title = page.locator('main.character-shell .character-identity h1');
  await expect(title).toBeVisible();
  await expect.poll(async () => title.evaluate(el => {
    const range = document.createRange();
    range.selectNodeContents(el);
    const textWidth = range.getBoundingClientRect().width;
    const available = el.getBoundingClientRect().width;
    return getComputedStyle(el).whiteSpace === 'nowrap' &&
      range.getClientRects().length === 1 && textWidth <= available + 1;
  }), { timeout: 6000, message: slug + ' must fit on one line at ' + width + 'px' }).toBe(true);

  const metrics = await title.evaluate(el => ({
    fontSize: parseFloat(getComputedStyle(el).fontSize),
    width: el.getBoundingClientRect().width,
    right: el.getBoundingClientRect().right,
    viewport: innerWidth
  }));
  expect(metrics.fontSize, slug).toBeGreaterThan(17);
  expect(metrics.width, slug).toBeGreaterThan(0);
  expect(metrics.right, slug).toBeLessThanOrEqual(metrics.viewport + 1);
}

test('all thirteen published character names fit on a single line at phone width', async ({ page }) => {
  test.setTimeout(95000);
  await page.setViewportSize({ width:390, height:844 });
  for (const slug of characters) await checkTitle(page, slug, 390);
});

test('long character names scale across narrow mobile, tablet and desktop widths', async ({ page }) => {
  test.setTimeout(95000);
  for(const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height:950 });
    for(const slug of ['commotion','agent-emerald','flying-saucer','gila-monster','amari-razman'])
      await checkTitle(page, slug, width);
  }
});

test('character title grows back to authored display size when viewport grows', async ({ page }) => {
  await page.setViewportSize({width:320,height:900});
  await page.goto(BASE+'/characters/commotion/',{waitUntil:'domcontentloaded'});
  const title = page.locator('.character-identity h1');
  await expect.poll(() => title.evaluate(el=>getComputedStyle(el).whiteSpace)).toBe('nowrap');
  const narrow = await title.evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
  await page.setViewportSize({width:1440,height:900});
  await expect.poll(() => title.evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThan(narrow+10);
});
