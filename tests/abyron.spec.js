const { test, expect } = require('@playwright/test');
const fs = require('fs');

const BASE = 'http://127.0.0.1:8000';

test('Abyron dossier publishes the locked Element 126 identity and state system', async ({ page }) => {
  await page.goto(BASE + '/lore/abyron/', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('h1')).toHaveText('ABYRON');
  await expect(page.locator('main')).toContainText('Element 126');
  await expect(page.locator('main')).toContainText('Ax-126');
  await expect(page.locator('main')).toContainText('HVA-01');
  await expect(page.locator('main')).toContainText('Hydrothermal Vent Anomaly 01');
  await expect(page.locator('#discovery')).toContainText('bubbles move downward');
  await expect(page.locator('#states')).toContainText('Liquid Ax-126');
  await expect(page.locator('#states')).toContainText('Ceramic Ax-126');
  await expect(page.locator('#states')).toContainText('Normal gaseous Ax-126');
  await expect(page.locator('#states')).toContainText('Genesis-state Ax-126');
});

test('Abyron dossier preserves bloom, UMWR, engineering, and corrected Genesis chronology', async ({ page }) => {
  await page.goto(BASE + '/lore/abyron/', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('#bloom')).toContainText('volumetric bloom');
  await expect(page.locator('#bloom')).toContainText('permanently degrades');
  await expect(page.locator('#umwr')).toContainText('Unstable Maximum Weight Response');
  await expect(page.locator('#umwr')).toContainText('Nobody currently knows how to restore');
  await expect(page.locator('#engineering')).toContainText('concentrated blunt force');
  await expect(page.locator('#supply')).toContainText('Before Genesis');
  await expect(page.locator('#supply')).toContainText('Approximately five major known systems');
  await expect(page.locator('#genesis')).toContainText('compromised Saint Dorsey containment seal');
  await expect(page.locator('#genesis')).toContainText('Approximately three seconds');
  await expect(page.locator('#genesis')).toContainText('small finite group');
  await expect(page.locator('#powder')).toContainText('Abyron Powder');
  await expect(page.locator('#boundaries')).toContainText('Genesis itself is an accident');
});

test('active lore and Genesis surfaces use the rewritten accidental-event model', async ({ page }) => {
  await page.goto(BASE + '/lore.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#abyron')).toHaveCount(1);
  await expect(page.locator('#abyron')).toContainText('Element 126');
  await expect(page.locator('.lore-index a[href="lore/abyron/"]')).toHaveCount(2);
  await expect(page.locator('#hamptons-matter')).toHaveCount(0);
  await expect(page.locator('#abyron-powder')).toHaveCount(1);
  await expect(page.locator('#genesis-dust')).toHaveCount(0);

  await page.goto(BASE + '/events.html#genesis', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#genesis')).toContainText('Genesis begins as an accident');
  await expect(page.locator('#genesis')).toContainText('bright-orange Genesis-state Abyron');
  await expect(page.locator('#genesis')).toContainText('362');
  await expect(page.locator('#genesis')).not.toContainText('Exactly 77');
  await expect(page.locator('#genesis')).not.toContainText('600–700');

  await page.goto(BASE + '/locations/st-dorsey/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('main')).toContainText('not corporate headquarters');
  await expect(page.locator('main')).toContainText('HVA-01 / Abyron');
  await expect(page.locator('main')).toContainText('Dorsey New General Facility');
  await expect(page.locator('main')).toContainText('362');
  await expect(page.locator('main')).not.toContainText('Hampton’s Matter');
  await expect(page.locator('main')).not.toContainText('Status</dt><dd>Quarantined');
});

test('Abyron propagates to connected Hampton and Los Moralistas records', async ({ page }) => {
  await page.goto(BASE + '/characters/agent-emerald/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('main')).toContainText('HVA-01 / Ax-126 research');
  await expect(page.locator('main a[href="../../lore/abyron/"]')).toHaveCount(1);

  await page.goto(BASE + '/organizations/los-moralistas/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('main')).toContainText('Ax-126 Access');
  await expect(page.locator('main')).toContainText('international Ax-126 supply chain');
});

test('retired Hampton material and retired Genesis framing are absent from active source surfaces', async () => {
  const lore = fs.readFileSync('lore.html', 'utf8');
  const stDorsey = fs.readFileSync('locations/st-dorsey/index.html', 'utf8');
  const events = fs.readFileSync('events.html', 'utf8');
  const genesis = fs.readFileSync('lore/genesis/index.html', 'utf8');

  expect(lore).not.toContain('id="hamptons-matter"');
  expect(lore).not.toContain('reality-defying substance');
  expect(stDorsey).not.toContain('Hampton’s Matter');
  expect(events).not.toContain('Exactly 77');
  expect(events).not.toContain('600–700 kg');
  expect(stDorsey).not.toContain('Genesis Dust');
  expect(genesis).not.toContain('exact villain, weapon');
  expect(genesis).not.toContain('600–700 kilograms');
});
