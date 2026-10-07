const { test, expect } = require('@playwright/test');

const BASE = 'http://127.0.0.1:8000';

test('Abyron Powder publishes the locked Genesis-origin material rules', async ({ page }) => {
  await page.goto(BASE + '/lore/abyron-powder/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('h1')).toHaveText('ABYRON POWDER');
  await expect(page.locator('#identity')).toContainText('Crushing an Ax-126 plate produces broken ceramic Abyron, not genuine Powder');
  await expect(page.locator('#composition')).toContainText('bright orange');
  await expect(page.locator('#composition')).toContainText('blood-orange');
  await expect(page.locator('#material-behavior')).toContainText('cannot properly undergo');
  await expect(page.locator('#material-behavior')).toContainText('cannot be restored');
  await expect(page.locator('#material-behavior')).toContainText('fragmented and non-coherent');
});

test('Powder amplifies existing systems without creating true Ascendants', async ({ page }) => {
  await page.goto(BASE + '/lore/abyron-powder/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#biological-rule')).toContainText('does not give you something new');
  await expect(page.locator('#humans-powered')).toContainText('normal human remains fundamentally human');
  await expect(page.locator('#humans-powered')).toContainText('does not add an unrelated ability');
  await expect(page.locator('#ascendants')).toContainText('unusually strong affinity');
  await expect(page.locator('#ascendants')).toContainText('Powder did not create it');
  await expect(page.locator('#ascendants')).toContainText('cannot create a true Ascendant');
});

test('Powder exposure has a variable onset, 10–30 minute window, crash, dependency, and overdose risk', async ({ page }) => {
  await page.goto(BASE + '/lore/abyron-powder/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#exposure')).toContainText('seconds to a few minutes');
  await expect(page.locator('#exposure')).toContainText('10–30 minutes');
  await expect(page.locator('#crash')).toContainText('arrhythmia');
  await expect(page.locator('#tolerance')).toContainText('physiological and psychological dependency');
  await expect(page.locator('#overdose')).toContainText('power runaway');
});

test('Powder locks micro-crystallization and the Abyron Exposure Protocol without a universal antidote', async ({ page }) => {
  await page.goto(BASE + '/lore/abyron-powder/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#microcrystallization')).toContainText('microscopic orange deposits');
  await expect(page.locator('#microcrystallization')).toContainText('not Abyron armor plates');
  await expect(page.locator('#medical')).toContainText('Abyron Exposure Protocol');
  await expect(page.locator('#medical')).toContainText('There is no universal injection');
});

test('Powder quality, supply, weaponization, and naming remain distinct and finite', async ({ page }) => {
  await page.goto(BASE + '/lore/abyron-powder/', { waitUntil: 'domcontentloaded' });
  const quality = page.locator('#quality');
  await expect(quality).toContainText('Genesis-Origin Powder');
  await expect(quality).toContainText('Refined Genesis Powder');
  await expect(quality).toContainText('Synthetic Ax Powder');
  await expect(quality).toContainText('Cut Dust');
  await expect(page.locator('#weaponization')).toContainText('open-air weaponization is unreliable');
  await expect(page.locator('#weaponization')).toContainText('ordinary security equipment does not automatically detect Powder');
  await expect(page.locator('#supply')).toContainText('Genesis-Origin Powder is finite');
  await expect(page.locator('#supply')).toContainText('Los Moralistas');
  await expect(page.locator('#naming')).toContainText('Genesis Dust');
  await expect(page.locator('#naming')).toContainText('not a second substance');
});

test('Powder preserves the creator-open story hooks and remains phone-safe', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE + '/lore/abyron-powder/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#open')).toContainText('first criminal Powder user');
  await expect(page.locator('#open')).toContainText('exact stockpile sizes');
  await expect(page.locator('#open')).toContainText('universal milligram doses');
  const dims = await page.evaluate(() => ({ viewport: innerWidth, html: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
  expect(dims.html).toBeLessThanOrEqual(dims.viewport + 2);
  expect(dims.body).toBeLessThanOrEqual(dims.viewport + 2);
});
