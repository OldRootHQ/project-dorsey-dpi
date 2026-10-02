const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE = 'http://127.0.0.1:8000';

test('Agent Emerald and Aftermark artwork is assigned to the intended site surfaces', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));

  await page.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded' });
  const afterHome = page.locator('[data-home-slide="aftermark"] img');
  const agentHome = page.locator('[data-home-slide="agent-emerald"] img');
  await expect(afterHome).toHaveAttribute('src', 'assets/characters/aftermark/aftermark-featured.webp');
  await page.locator('[data-home-character="aftermark"]').click();
  await expect(afterHome).toBeVisible();
  await expect.poll(() => afterHome.evaluate(img => img.naturalWidth)).toBeGreaterThan(0);
  await expect(agentHome).toHaveAttribute('src', 'assets/characters/agent-emerald/agent-emerald-featured.webp');
  await page.locator('[data-home-character="agent-emerald"]').click();
  await expect(agentHome).toBeVisible();
  await expect.poll(() => agentHome.evaluate(img => img.naturalWidth)).toBeGreaterThan(0);

  await page.goto(`${BASE}/characters.html`, { waitUntil: 'domcontentloaded' });
  const afterRegistry = page.locator('.character-card[href="characters/aftermark/"] img');
  const agentRegistry = page.locator('.character-card[href="characters/agent-emerald/"] img');
  await expect(afterRegistry).toHaveAttribute('src', 'assets/characters/aftermark/aftermark-registry.webp');
  await expect(agentRegistry).toHaveAttribute('src', 'assets/characters/agent-emerald/agent-emerald-registry.webp');
  await expect.poll(() => afterRegistry.evaluate(img => img.naturalWidth)).toBeGreaterThan(0);
  await expect.poll(() => agentRegistry.evaluate(img => img.naturalWidth)).toBeGreaterThan(0);

  await page.goto(`${BASE}/characters/aftermark/`, { waitUntil: 'domcontentloaded' });
  const afterCover = page.locator('.character-feature-art img');
  await expect(afterCover).toHaveAttribute('src', '../../assets/characters/aftermark/aftermark-cover.webp');
  await expect(page.locator('.character-feature-art [data-lightbox]')).toHaveAttribute('data-full-src', '../../assets/characters/aftermark/aftermark-cover.webp');
  await expect(page.locator('.character-infobox img')).toHaveAttribute('src', '../../assets/characters/aftermark/aftermark-primary.webp');
  await expect(page.locator('.dossier-illustration img')).toHaveCount(1);
  await expect(page.locator('.dossier-illustration img')).toHaveAttribute('src', '../../assets/characters/aftermark/aftermark-dossier-01.webp');
  const afterCoverShape = await afterCover.evaluate(img => ({ width: img.naturalWidth, height: img.naturalHeight }));
  expect(afterCoverShape.width).toBeGreaterThan(afterCoverShape.height);
  await afterCover.click();
  await expect(page.locator('.image-lightbox')).toHaveClass(/open/);
  await page.locator('.image-lightbox-close').click();

  await page.goto(`${BASE}/characters/agent-emerald/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.character-feature-art img')).toHaveAttribute('src', '../../assets/characters/agent-emerald/agent-emerald-primary.webp');
  await expect(page.locator('.character-infobox img')).toHaveAttribute('src', '../../assets/characters/agent-emerald/agent-emerald-registry.webp');
  const agentDossier = page.locator('.dossier-illustration img');
  await expect(agentDossier).toHaveCount(5);
  const agentSources = await agentDossier.evaluateAll(imgs => imgs.map(img => img.getAttribute('src')));
  expect(agentSources).toEqual([
    '../../assets/characters/agent-emerald/agent-emerald-dossier-04.webp',
    '../../assets/characters/agent-emerald/agent-emerald-dossier-01.webp',
    '../../assets/characters/agent-emerald/agent-emerald-dossier-02.webp',
    '../../assets/characters/agent-emerald/agent-emerald-dossier-03.webp',
    '../../assets/characters/agent-emerald/agent-emerald-dossier-05.webp'
  ]);
  for (let i = 0; i < 5; i += 1) {
    await agentDossier.nth(i).scrollIntoViewIfNeeded();
    await expect.poll(() => agentDossier.nth(i).evaluate(img => img.naturalWidth)).toBeGreaterThan(0);
  }

  await page.goto(`${BASE}/dpi.html`, { waitUntil: 'networkidle' });
  const records = await page.evaluate(() => window.OLDROOT_CHARACTERS);
  expect(records.find(c => c.codename === 'Aftermark').image).toBe('assets/characters/aftermark/aftermark-opi-cover.webp');
  expect(records.find(c => c.codename === 'Agent Emerald').image).toBe('assets/characters/agent-emerald/agent-emerald-registry.webp');

  await page.goto(`${BASE}/locations/san-juan/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.known-character-card[href="../../characters/aftermark/"] img')).toHaveAttribute('src', '../../assets/characters/aftermark/aftermark-location-cover.webp');

  await page.goto(`${BASE}/locations/seattle/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.known-character-card[href="../../characters/agent-emerald/"] img')).toHaveAttribute('src', '../../assets/characters/agent-emerald/agent-emerald-registry.webp');

  await page.goto(`${BASE}/organizations/dunamis-dynamics/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.known-character-card[href="../../characters/agent-emerald/"] img')).toHaveAttribute('src', '../../assets/characters/agent-emerald/agent-emerald-registry.webp');

  expect(errors, `Unexpected page errors: ${errors.join(' | ')}`).toEqual([]);
});

test('Aftermark horizontal artwork stays on cover-card surfaces and the filler is gone', async () => {
  const root = process.cwd();
  const filler = path.join(root, 'assets/characters/aftermark-full.png');
  expect(fs.existsSync(filler)).toBe(false);

  const genericUploads = fs.readdirSync(root).filter(name => /^ChatGPT Image Oct 1, 2026, 07_57_/.test(name));
  expect(genericUploads).toEqual([]);

  function pngDimensions(file) {
    const b = fs.readFileSync(file);
    expect(b.toString('ascii', 1, 4)).toBe('PNG');
    return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  }

  const afterSource = path.join(root, 'assets/characters/aftermark/source');
  const horizontal = [
    'aftermark-cover-source.png',
    'aftermark-featured-source.png',
    'aftermark-registry-source.png',
    'aftermark-opi-cover-source.png',
    'aftermark-location-cover-source.png'
  ];
  for (const name of horizontal) {
    const { width, height } = pngDimensions(path.join(afterSource, name));
    expect(width, name).toBeGreaterThan(height);
  }
  for (const name of ['aftermark-primary-source.png', 'aftermark-dossier-01-source.png']) {
    const { width, height } = pngDimensions(path.join(afterSource, name));
    expect(height, name).toBeGreaterThan(width);
  }

  const afterDossier = fs.readFileSync(path.join(root, 'characters/aftermark/index.html'), 'utf8');
  expect(afterDossier).toContain('aftermark-cover.webp');
  expect(afterDossier).toContain('aftermark-primary.webp');
  expect(afterDossier).toContain('aftermark-dossier-01.webp');
  for (const coverOnly of [
    'aftermark-featured.webp',
    'aftermark-registry.webp',
    'aftermark-opi-cover.webp',
    'aftermark-location-cover.webp'
  ]) {
    expect(afterDossier).not.toContain(coverOnly);
  }

  const production = [
    'assets/characters/agent-emerald/agent-emerald-registry.webp',
    'assets/characters/agent-emerald/agent-emerald-primary.webp',
    'assets/characters/agent-emerald/agent-emerald-featured.webp',
    'assets/characters/agent-emerald/agent-emerald-dossier-01.webp',
    'assets/characters/agent-emerald/agent-emerald-dossier-02.webp',
    'assets/characters/agent-emerald/agent-emerald-dossier-03.webp',
    'assets/characters/agent-emerald/agent-emerald-dossier-04.webp',
    'assets/characters/agent-emerald/agent-emerald-dossier-05.webp',
    'assets/characters/aftermark/aftermark-cover.webp',
    'assets/characters/aftermark/aftermark-primary.webp',
    'assets/characters/aftermark/aftermark-featured.webp',
    'assets/characters/aftermark/aftermark-registry.webp',
    'assets/characters/aftermark/aftermark-opi-cover.webp',
    'assets/characters/aftermark/aftermark-location-cover.webp',
    'assets/characters/aftermark/aftermark-dossier-01.webp'
  ];
  for (const relative of production) {
    const file = path.join(root, relative);
    expect(fs.existsSync(file), relative).toBe(true);
    expect(fs.statSync(file).size, relative).toBeLessThan(600000);
  }
});
