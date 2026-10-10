const { test, expect } = require('@playwright/test');
const BASE = 'http://127.0.0.1:8000';

test('Public-facing character pages no longer repeat negative Ascendant labels', async ({ page }) => {
  test.setTimeout(90000);
  const routes = [
    'characters.html', 'lore.html', 'start-here.html', 'news.html',
    'locations/baltimore/',
    'characters/gila-monster/', 'characters/commotion/', 'characters/aftermark/',
    'characters/kincast/', 'characters/anchorage/', 'characters/agent-emerald/',
    'characters/latch/', 'characters/kokio/', 'characters/amari-razman/',
    'characters/ballestera/', 'characters/remedie/'
  ];
  for (const route of routes) {
    await page.goto(BASE + '/' + route, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).not.toContainText(/Non[\s-]?Ascendant/i);
    await expect(page.locator('a[href*="non-ascendant"]')).toHaveCount(0);
  }
});

test('Character source preserves origin meaning and OPI without negative status assignments', async ({ page }) => {
  await page.goto(BASE + '/dpi.html', { waitUntil: 'domcontentloaded' });
  const chars = await page.evaluate(() => window.OLDROOT_CHARACTERS);
  expect(chars).toHaveLength(11);
  for (const c of chars) {
    expect(c.ascendantStatus).toBeNull();
    expect(c.origin).not.toMatch(/Non[\s-]?Ascendant/i);
    expect(Object.keys(c.baseline)).toEqual([
      'Strength', 'Durability', 'Speed', 'Agility', 'Regeneration',
      'Senses', 'Offense', 'Intellect', 'Combat', 'Mobility', 'Stamina'
    ]);
  }
  expect(chars.find(c => c.codename === 'Kokio').powerClass).toBe('Demi-God');
  expect(chars.find(c => c.codename === 'Gila Monster').originType).toBe('Biotechnology');
  expect(chars.find(c => c.codename === 'Anchorage').originType).toBe('Experimental Enhancement');
  await expect(page.locator('body')).not.toContainText('Non-Ascendant');
});
