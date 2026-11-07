const { test, expect } = require('@playwright/test');

const BASE = 'http://127.0.0.1:8000';
const CATEGORIES = ['Strength', 'Durability', 'Speed', 'Agility', 'Regeneration', 'Senses', 'Offense', 'Intellect', 'Combat', 'Mobility', 'Stamina'];

test('OPI Analytics has fixed 0–100 category axes without modifying creator ratings', async ({ page }) => {
  await page.goto(BASE + '/dpi.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#x-metric')).toHaveValue('Offense');
  await expect(page.locator('#y-metric')).toHaveValue('Durability');
  const ticks = await page.locator('#chart .tick').allTextContents();
  for (const tick of ['0', '20', '40', '60', '80', '100']) expect(ticks).toContain(tick);
  expect(ticks).not.toContain('50');
  const records = await page.evaluate(() => window.OLDROOT_CHARACTERS);
  expect(records).toHaveLength(12);
  for (const character of records) {
    expect(Object.keys(character.baseline)).toEqual(CATEGORIES);
    for (const number of Object.values(character.baseline)) expect(number).toBeGreaterThanOrEqual(0);
    for (const number of Object.values(character.baseline)) expect(number).toBeLessThanOrEqual(100);
  }
  expect(records.find(c => c.codename === 'Gila Monster').baseline.Durability).toBe(23.3);
  expect(records.find(c => c.codename === 'Anchorage').baseline.Durability).toBe(37.4);
  expect(records.find(c => c.codename === 'Latch').officialOPI).toBe(10.15);
  expect(records.find(c => c.codename === 'Amari Razman').officialOPI).toBe(10.02);
  expect(records.find(c => c.codename === 'Liontone').suppressAggregate).toBe(true);
  expect(records.find(c => c.codename === 'Ballestera').suppressAggregate).toBe(true);
  expect(records.find(c => c.codename === 'Flying Saucer').suppressAggregate).toBe(true);
  expect(records.find(c => c.codename === 'Agent Emerald').conditional).toEqual([
    {category:'Senses',condition:'Precision Pill Active',value:16.1}
  ]);
});

test('Every published OPI dossier uses the 0–100 percentage while retaining all 11 original values', async ({ page }) => {
  test.setTimeout(90000);
  await page.goto(BASE + '/dpi.html', { waitUntil: 'domcontentloaded' });
  const records = await page.evaluate(() => window.OLDROOT_CHARACTERS);
  for (const character of records) {
    await page.goto(BASE + '/' + character.page, { waitUntil: 'domcontentloaded' });
    const rows = await page.locator('.dpi-row').evaluateAll(elements => elements.map(row => ({
      category: row.querySelector('.dpi-name').textContent.trim(),
      value: Number(row.querySelector('.dpi-value').textContent.trim()),
      percent: parseFloat(row.querySelector('.dpi-fill').style.getPropertyValue('--score'))
    })));
    expect(rows, character.codename + ' should have exactly 11 metrics').toHaveLength(11);
    expect(rows.map(r => r.category)).toEqual(CATEGORIES);
    for (const row of rows) {
      expect(row.value, character.codename + ' ' + row.category).toBe(character.baseline[row.category]);
      expect(row.percent, character.codename + ' ' + row.category + ' percentage').toBeCloseTo(row.value, 4);
    }
  }
});

test('Gila totals and averages agree on registry, dossier and Analytics', async ({ page }) => {
  await page.goto(BASE + '/characters.html', { waitUntil: 'domcontentloaded' });
  const card = page.locator('.character-card').filter({has:page.locator('h3', {hasText:'Gila Monster'})});
  await expect(card).toContainText('Baseline mean 18.31');
  await expect(card).not.toContainText('17.67');
  await page.goto(BASE + '/characters/gila-monster/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.dpi-summary')).toContainText('Baseline total · 201.4');
  await expect(page.locator('.dpi-summary')).toContainText('Baseline mean · 18.31');
  await expect(page.locator('.character-infobox')).toContainText('18.31 · analytics only');
  await page.goto(BASE + '/dpi.html', { waitUntil: 'domcontentloaded' });
  const sum = await page.evaluate(() => {
    const c = window.OLDROOT_CHARACTERS.find(c => c.codename === 'Gila Monster');
    return Object.values(c.baseline).reduce((a,b) => a + b, 0);
  });
  expect(sum).toBeCloseTo(201.4, 4);
  expect(sum / 11).toBeCloseTo(18.31, 2);
});

test('0–100 chart remains readable and inside the viewport on desktop and phones', async ({ page }) => {
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(BASE + '/dpi.html', { waitUntil: 'domcontentloaded' });
    const measure = await page.evaluate(() => {
      const chart = document.querySelector('#chart');
      const rect = chart.getBoundingClientRect();
      return {
        screen: innerWidth, overflow: document.documentElement.scrollWidth,
        svgWidth: chart.viewBox.baseVal.width, displayedWidth: rect.width,
        colorLegendVisible: !document.querySelector('#mobile-chart-legend').hidden,
        ticks: [...chart.querySelectorAll('.tick')].map(t => t.textContent)
      };
    });
    expect(measure.overflow, 'horizontal overflow at ' + width).toBeLessThanOrEqual(width + 2);
    expect(measure.svgWidth, 'SVG sizing at ' + width).toBeCloseTo(measure.displayedWidth, 0);
    expect(measure.ticks).toContain('100');
    expect(measure.colorLegendVisible).toBe(width < 600);
  }
});
