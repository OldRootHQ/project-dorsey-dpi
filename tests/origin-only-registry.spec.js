const { test, expect } = require('@playwright/test');
const BASE = 'http://127.0.0.1:8000';

test('Registry has one origin filter, retains Demi-God and God, and no power-class filter', async ({ page }) => {
  await page.goto(BASE + '/characters.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.character-card')).toHaveCount(12);
  await expect(page.getByText('Power Classification')).toHaveCount(0);
  await expect(page.locator('[data-filter-group="power"]')).toHaveCount(0);
  await expect(page.locator('[data-filter-group="origin"][value="human"]')).toHaveCount(1);
  await expect(page.locator('[data-filter-group="origin"][value="inborn-anomaly"]')).toHaveCount(1);
  await expect(page.locator('[data-filter-group="origin"][value="demi-god"]')).toHaveCount(1);
  await expect(page.locator('[data-filter-group="origin"][value="god"]')).toHaveCount(1);
  await expect(page.getByText('Unresolved / unexplained')).toHaveCount(0);
  await expect(page.getByText('Ascendant status unresolved')).toHaveCount(0);

  await page.locator('#filterToggle').click();
  await page.locator('[data-filter-group="origin"][value="demi-god"]').check();
  await page.locator('#filterApply').click();
  await expect(page.locator('.character-card:visible')).toHaveCount(1);
  await expect(page.locator('.character-card:visible h3')).toHaveText('Kokio');

  await page.locator('#filterToggle').click();
  await page.locator('#filterClear').click();
  await page.locator('[data-filter-group="origin"][value="god"]').check();
  await page.locator('#filterApply').click();
  await expect(page.locator('.character-card:visible')).toHaveCount(0);

  await page.locator('#filterToggle').click();
  await page.locator('#filterClear').click();
  await page.locator('[data-filter-group="origin"][value="inborn-anomaly"]').check();
  await page.locator('#filterApply').click();
  await expect(page.locator('.character-card:visible h3')).toHaveText('Kincast');

  await page.locator('#filterToggle').click();
  await page.locator('#filterClear').click();
  await page.locator('[data-filter-group="origin"][value="human"]').check();
  await page.locator('#filterApply').click();
  await expect(page.locator('.character-card:visible')).toHaveCount(7);
});

test('OPI uses origin, preserves all eleven capability values and excludes retired fields', async ({ page }) => {
  await page.goto(BASE + '/dpi.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#color-by')).toHaveValue('originType');
  await expect(page.locator('#color-by option[value="powerClass"]')).toHaveCount(0);
  const records = await page.evaluate(() => window.OLDROOT_CHARACTERS);
  expect(records).toHaveLength(11);
  for (const c of records) {
    expect(c).not.toHaveProperty('powerClass');
    expect(c).not.toHaveProperty('ascendantStatus');
    expect(c.origin).toBeTruthy();
    expect(c.originType).toBeTruthy();
    expect(Object.keys(c.baseline)).toHaveLength(11);
  }
  const kokio = records.find(c => c.codename === 'Kokio');
  expect(kokio.originType).toBe('Demi-God / Supernatural Ritual');
  expect(kokio.origin).toContain('Takaro');
  expect(records.filter(c => /(^|[ /\-])God(?![a-z])/i.test(c.originType) && !c.originType.startsWith('Demi-God'))).toHaveLength(0);
  expect(records.find(c => c.codename === 'Kincast').origin).toContain('Inborn');
  await page.locator('#filter-open').click();
  await expect(page.locator('[data-filter-key="powerClass"]')).toHaveCount(0);
  await expect(page.locator('[data-filter-key="originType"][value="Demi-God / Supernatural Ritual"]')).toHaveCount(1);
  await page.locator('[data-filter-key="originType"][value="Demi-God / Supernatural Ritual"]').check();
  await page.locator('#filter-apply').click();
  await expect(page.locator('#count')).toHaveText('1 CHARACTER');
  await expect(page.locator('#detail')).toContainText('Kokio');
  await expect(page.locator('#detail')).toContainText('Origin');
  await expect(page.locator('#detail')).not.toContainText('Power class');
});

test('Every published dossier uses an origin record instead of a power-class row', async ({ page }) => {
  test.setTimeout(90000);
  for (const slug of ['gila-monster','commotion','aftermark','kincast','anchorage','agent-emerald','latch','kokio','amari-razman','ballestera','remedie']) {
    await page.goto(BASE + '/characters/' + slug + '/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.character-infobox')).toContainText('Origin');
    await expect(page.locator('.character-infobox')).not.toContainText('Power class');
    await expect(page.locator('a[href*="power-classification"]')).toHaveCount(0);
  }
  await page.goto(BASE + '/lore.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#origin')).toHaveCount(1);
  await expect(page.locator('#power-classification')).toHaveCount(0);
});
