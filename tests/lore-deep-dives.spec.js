const { test, expect } = require('@playwright/test');
const fs = require('fs');

const BASE = 'http://127.0.0.1:8000';

test('Discovery of Abyron preserves the first-voyage record and corrected timeline', async ({ page }) => {
  await page.goto(BASE + '/lore/abyron-discovery/', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('h1')).toHaveText('DISCOVERY OF ABYRON');
  await expect(page.locator('main')).toContainText('HVA-01');
  await expect(page.locator('#first-clue')).toContainText('bubbles travel downward');
  await expect(page.locator('#invisible-liquid')).toContainText('nearly transparent');
  await expect(page.locator('#sinking-bubbles')).toContainText('does not reverse gravity');
  await expect(page.locator('#first-bloom')).toContainText('gradual decompression');
  await expect(page.locator('#submarine-failure')).toContainText('effective weight response');
  await expect(page.locator('#return-to-depth')).toContainText('orange ceramic is gone');
  await expect(page.locator('#more-than-before')).toContainText('appears to be more Abyron');
  await expect(page.locator('#saint-dorsey')).toContainText('Genesis occurs extremely early');
  await expect(page.locator('#control')).toContainText('Control comes later');
  await expect(page.locator('#control')).toContainText('After Genesis');
});

test('Genesis publishes the accidental Saint Dorsey failure chain and hard aftermath', async ({ page }) => {
  await page.goto(BASE + '/lore/genesis/', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('h1')).toHaveText('GENESIS');
  await expect(page.locator('#accident')).toContainText('Genesis is an accident');
  await expect(page.locator('#accident')).toContainText('No alien force');
  await expect(page.locator('#before-genesis')).toContainText('not holding a giant premium stockpile');
  await expect(page.locator('#rally-point')).toContainText('Mark Hampton is in Washington state');
  await expect(page.locator('#rally-point')).toContainText('Hillfred');
  await expect(page.locator('#containment')).toContainText('compromised seal');
  await expect(page.locator('#containment')).toContainText('declining pressure');
  await expect(page.locator('#load-shift')).toContainText('effective weight response');
  await expect(page.locator('#energy-system')).toContainText('dark-orange');
  await expect(page.locator('#first-explosion')).toContainText('That explosion is not Genesis');
  await expect(page.locator('#three-seconds')).toContainText('Approximately three seconds');
  await expect(page.locator('#genesis-state')).toContainText('brilliant bright orange');
  await expect(page.locator('#black-front')).toContainText('nearly black advancing edge');
  await expect(page.locator('#orange-cloud')).toContainText('approximately 14 hours');
  await expect(page.locator('#orange-cloud')).toContainText('approximately two days');
  await expect(page.locator('#casualties')).toContainText('362');
  await expect(page.locator('#casualties')).toContainText('Ascendant blood test');
  await expect(page.locator('#ascendants')).toContainText('small, finite group');
  await expect(page.locator('#ascendants')).toContainText('months later');
  await expect(page.locator('#domains')).toContainText('The moment supplies the need');
  await expect(page.locator('#public-discovery')).toContainText('exact number remains unknown');
  await expect(page.locator('#hampton-response')).toContainText('Transparency does not erase responsibility');
  await expect(page.locator('#powder')).toContainText('Abyron Powder');
  await expect(page.locator('#second-search')).toContainText('approximately five known systems');
  await expect(page.locator('#dorsey-new-general')).toContainText('Dorsey New General Facility');
  await expect(page.locator('#dorsey-new-general')).toContainText('400 employees before Genesis');
  await expect(page.locator('#dorsey-new-general')).toContainText('4,000 after the rebuild');
  await expect(page.locator('main')).not.toContainText('Exactly 77');
  await expect(page.locator('main')).not.toContainText('600–700 kilograms');
});

test('Lore Index reflects the rewritten Ascendant, Genesis, and Abyron Powder records', async ({ page }) => {
  await page.goto(BASE + '/lore.html', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('#hva-01')).toContainText('Discovery of Abyron');
  await expect(page.locator('#hva-01 a')).toHaveAttribute('href', 'lore/abyron-discovery/');
  await expect(page.locator('#genesis a')).toHaveAttribute('href', 'lore/genesis/');
  await expect(page.locator('#genesis')).toContainText('accidental HVA-01 containment failure');
  await expect(page.locator('#ascendant')).toContainText('small, finite Genesis-only category');
  await expect(page.locator('#abyron-powder')).toContainText('Abyron Powder');
  await expect(page.locator('#abyron-powder a')).toHaveAttribute('href', 'lore/genesis/#powder');
  await expect(page.locator('#genesis-dust')).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText('exactly 77');
});

test('Abyron dossier remains intact while Genesis supply chronology moves post-event', async ({ page }) => {
  await page.goto(BASE + '/lore/abyron/', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('#identity')).toContainText('Element 126');
  await expect(page.locator('#bloom')).toContainText('volumetric bloom');
  await expect(page.locator('#umwr')).toContainText('Unstable Maximum Weight Response');
  await expect(page.locator('#supply')).toContainText('Before Genesis');
  await expect(page.locator('#supply')).toContainText('Genesis destroys or alters');
  await expect(page.locator('#genesis')).toContainText('compromised Saint Dorsey containment seal');
  await expect(page.locator('#powder')).toContainText('Abyron Powder');
  await expect(page.locator('a[href="../abyron-discovery/"]')).toHaveCount(2);
  await expect(page.locator('a[href="../genesis/"]')).toHaveCount(2);
});

test('Events stays concise and routes deeper reading to the rewritten Genesis lore', async ({ page }) => {
  await page.goto(BASE + '/events.html#genesis', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('#genesis a[href="lore/genesis/"]')).toHaveText('Full Genesis Lore →');
  await expect(page.locator('#genesis')).toContainText('Genesis begins as an accident');
  await expect(page.locator('#genesis')).toContainText('362');
  await expect(page.locator('#genesis')).toContainText('14 hours');
  await expect(page.locator('#genesis')).not.toContainText('Exactly 77');
  await expect(page.locator('#genesis')).not.toContainText('600–700');
});

test('active public Genesis surfaces do not regress to retired canon', async () => {
  const files = [
    'events.html',
    'start-here.html',
    'locations/st-dorsey/index.html',
    'lore.html',
    'lore/abyron/index.html',
    'lore/genesis/index.html'
  ];
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    expect(source).not.toContain('Exactly 77');
    expect(source).not.toContain('exactly seventy-seven');
    expect(source).not.toContain('600–700 kilograms');
    expect(source).not.toContain('id="genesis-dust"');
  }
});
