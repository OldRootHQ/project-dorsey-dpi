const { test, expect } = require('@playwright/test');

const BASE = 'http://127.0.0.1:8000';

test('Discovery of Abyron has its own complete HVA-01 lore record', async ({ page }) => {
  await page.goto(BASE + '/lore/abyron-discovery/', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('h1')).toHaveText('DISCOVERY OF ABYRON');
  await expect(page.locator('main')).toContainText('HVA-01');
  await expect(page.locator('#first-clue')).toContainText('bubbles travel downward');
  await expect(page.locator('#invisible-liquid')).toContainText('nearly transparent');
  await expect(page.locator('#sinking-bubbles')).toContainText('does not reverse gravity');
  await expect(page.locator('#recovery')).toContainText('vacuum and filtration submarine');
  await expect(page.locator('#first-bloom')).toContainText('first volumetric bloom happens by accident');
  await expect(page.locator('#submarine-failure')).toContainText('effective weight response');
  await expect(page.locator('#return-to-depth')).toContainText('orange ceramic is gone');
  await expect(page.locator('#more-than-before')).toContainText('appears to be more Abyron');
  await expect(page.locator('#control')).toContainText('controlled process becomes the basis of Abyron manufacturing');
});

test('Genesis has its own full lore record without resolving the open trigger', async ({ page }) => {
  await page.goto(BASE + '/lore/genesis/', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('h1')).toHaveText('GENESIS');
  await expect(page.locator('#before-genesis')).toContainText('600–700 kilograms');
  await expect(page.locator('#trigger')).toContainText('exact villain, weapon, and final attack mechanism');
  await expect(page.locator('#three-seconds')).toContainText('One second. Two seconds. Three seconds.');
  await expect(page.locator('#genesis-state')).toContainText('brilliant orange');
  await expect(page.locator('#black-front')).toContainText('The wave is black. The gas is orange.');
  await expect(page.locator('#surface-bound')).toContainText('surface-bound geometry');
  await expect(page.locator('#seventy-seven')).toContainText('Exactly seventy-seven');
  await expect(page.locator('#domains')).toContainText('Genesis grants a domain, not merely a trick.');
  await expect(page.locator('#first-power')).toContainText('first thing the brain figures out');
  await expect(page.locator('#dust')).toContainText('cannot establish a new true Ascendant domain');
  await expect(page.locator('#replication')).toContainText('cannot reliably reproduce the original Genesis event');
  await expect(page.locator('#boundary')).toContainText('one major origin branch in OldRoot');
});

test('Lore Index routes Discovery and Genesis into their dedicated lore pages', async ({ page }) => {
  await page.goto(BASE + '/lore.html', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('#hva-01')).toContainText('Discovery of Abyron');
  await expect(page.locator('#hva-01 a')).toHaveAttribute('href', 'lore/abyron-discovery/');
  await expect(page.locator('#genesis a')).toHaveAttribute('href', 'lore/genesis/');
  await expect(page.locator('#genesis-dust a')).toHaveAttribute('href', 'lore/genesis/#dust');
});

test('Abyron dossier remains intact and points to both deep dives', async ({ page }) => {
  await page.goto(BASE + '/lore/abyron/', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('#identity')).toContainText('Element 126');
  await expect(page.locator('#bloom')).toContainText('volumetric bloom');
  await expect(page.locator('#umwr')).toContainText('Unstable Maximum Weight Response');
  await expect(page.locator('a[href="../abyron-discovery/"]')).toHaveCount(2);
  await expect(page.locator('a[href="../genesis/"]')).toHaveCount(2);
});

test('Events remains the concise summary and routes deep reading to Genesis lore', async ({ page }) => {
  await page.goto(BASE + '/events.html#genesis', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('#genesis a[href="lore/genesis/"]')).toHaveText('Full Genesis Lore →');
  await expect(page.locator('#genesis')).toContainText('exact villain, weapon, and final attack mechanism remain unrevealed');
});
