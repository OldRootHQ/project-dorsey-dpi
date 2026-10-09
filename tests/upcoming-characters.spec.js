const { test, expect } = require('@playwright/test');

const BASE = 'http://127.0.0.1:8000';
const UPCOMING = ['Mark Hampton', 'Neegan Walters', 'Ballestera', 'Makari', 'Akuaom', 'Duke', 'Remedie', 'Malasangre', 'White Magma'];

async function expectFullUpcomingSection(page) {
  const section = page.locator('#upcoming-characters');
  await expect(section).toBeVisible();
  await expect(section.locator('h2')).toHaveText('Upcoming Characters');
  await expect(section.locator('.discovery-card')).toHaveCount(9);
  await expect(section.locator('.discovery-card h3')).toHaveText(UPCOMING);
  await expect(section.locator('.discovery-card').filter({ hasText: 'Mark Hampton' }).locator('b')).toHaveText('NO OPI LISTING');
  await expect(section.locator('.discovery-card').filter({ hasText: 'Neegan Walters' }).locator('b')).toHaveText('NO OPI LISTING');
  for (const name of ['Ballestera', 'Makari', 'Akuaom', 'Duke', 'Remedie', 'Malasangre', 'White Magma']) {
    await expect(section.locator('.discovery-card').filter({ hasText: name }).locator('b')).toHaveText('IN DEVELOPMENT');
  }
}

test('Homepage samples three upcoming characters while Dispatches keeps the full development registry', async ({ page }) => {
  await page.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded' });
  const homeSection = page.locator('#upcoming-characters');
  await expect(homeSection).toBeVisible();
  await expect(homeSection.locator('.discovery-card')).toHaveCount(3);
  const sampled = await homeSection.locator('.discovery-card h3').allTextContents();
  expect(new Set(sampled).size).toBe(3);
  for (const name of sampled) expect(UPCOMING).toContain(name);
  await expect(page.locator('#upcoming-characters a[href="news.html#upcoming-characters"]')).toHaveCount(1);

  await page.goto(`${BASE}/news.html#upcoming-characters`, { waitUntil: 'domcontentloaded' });
  await expectFullUpcomingSection(page);
  await expect(page.locator('#upcoming-characters')).toContainText('preview only');
});

test('Upcoming Characters do not become active registry or OPI records', async ({ page }) => {
  await page.goto(`${BASE}/dpi.html`, { waitUntil: 'networkidle' });
  const records = await page.evaluate(() => window.OLDROOT_CHARACTERS.map(c => c.codename));
  for (const name of UPCOMING) expect(records).not.toContain(name);

  await page.goto(`${BASE}/characters.html`, { waitUntil: 'domcontentloaded' });
  for (const name of UPCOMING) {
    await expect(page.locator('.character-card').filter({ hasText: name })).toHaveCount(0);
  }
});

test('Upcoming Characters sections remain contained on phone width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/index.html', '/news.html#upcoming-characters']) {
    await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
    const dims = await page.evaluate(() => ({
      viewport: innerWidth,
      html: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
      section: document.querySelector('#upcoming-characters').getBoundingClientRect().width
    }));
    expect(dims.html, path).toBeLessThanOrEqual(dims.viewport + 2);
    expect(dims.body, path).toBeLessThanOrEqual(dims.viewport + 2);
    expect(dims.section, path).toBeLessThanOrEqual(dims.viewport);
  }
});


test('Latch is public in the registry with an official scored OPI profile', async ({ page }) => {
  await page.goto(`${BASE}/characters.html`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.character-card').filter({ hasText: 'Latch' })).toHaveCount(1);
  await expect(page.locator('.character-card').filter({ hasText: 'Latch' })).toContainText('Official OPI 10.15');

  await page.goto(`${BASE}/dpi.html`, { waitUntil: 'networkidle' });
  const latch = await page.evaluate(() => window.OLDROOT_CHARACTERS.find(c => c.codename === 'Latch'));
  expect(latch).toBeTruthy();
  expect(latch.officialOPI).toBe(10.15);
  expect(latch.baseline.Combat).toBe(18.6);
  await expect(page.locator('[data-unscored-character="Latch"]')).toHaveCount(0);
});
