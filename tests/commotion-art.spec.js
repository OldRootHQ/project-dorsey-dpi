const { test, expect } = require('@playwright/test');

const BASE = 'http://127.0.0.1:8000';

async function expectImageLoaded(locator) {
  await locator.scrollIntoViewIfNeeded();
  await expect.poll(async () => locator.evaluate(img => img.complete && img.naturalWidth > 0 && img.naturalHeight > 0)).toBe(true);
  await expect(locator).toBeVisible();
  return locator.evaluate(img => ({
    complete: img.complete,
    naturalWidth: img.naturalWidth,
    naturalHeight: img.naturalHeight,
    src: img.getAttribute('src')
  }));
}

test('Commotion artwork stays purposeful and distinct across the site', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));

  await page.goto(`${BASE}/characters/commotion/`, { waitUntil: 'networkidle' });

  const primary = page.locator('.character-feature-art img');
  const primaryState = await expectImageLoaded(primary);
  expect(primaryState.src).toBe('../../assets/characters/commotion/commotion-primary.webp');
  const primaryObjectPosition = await primary.evaluate(img => getComputedStyle(img).objectPosition);
  expect(primaryObjectPosition).toBe('50% 0%');

  const dossierArt = page.locator('.dossier-illustration img');
  await expect(dossierArt).toHaveCount(2);
  const dossierSources = await dossierArt.evaluateAll(images => images.map(img => img.getAttribute('src')));
  expect(dossierSources).toEqual([
    '../../assets/characters/commotion/commotion-combat-stairwell.webp',
    '../../assets/characters/commotion/commotion-jammer-crowd.webp'
  ]);
  for (const image of await dossierArt.all()) await expectImageLoaded(image);

  await expect(page.locator('.character-infobox .character-portrait')).toHaveCount(0);
  await expect(page.locator('.dossier-illustration').first()).toContainText('Combat illustration');
  await expect(page.locator('.dossier-illustration').last()).toContainText('Equipment illustration');

  await page.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-home-character="commotion"]').click();
  const featured = page.locator('[data-home-slide="commotion"] .home-character-art img');
  await expect(featured).toHaveAttribute('src', 'assets/characters/commotion/commotion-featured-rooftop.webp');
  await expectImageLoaded(featured);

  await page.goto(`${BASE}/characters.html`, { waitUntil: 'domcontentloaded' });
  const registry = page.locator('.character-card[href="characters/commotion/"] .character-thumb');
  await expect(registry).toHaveAttribute('src', 'assets/characters/commotion/commotion-primary.webp');
  await expectImageLoaded(registry);

  const dataText = await page.evaluate(async () => (await fetch('data.js')).text());
  expect(dataText).toContain('image:"assets/characters/commotion/commotion-primary.webp"');

  await page.goto(`${BASE}/locations/chicago/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('img[src*="assets/characters/commotion/"]')).toHaveCount(0);

  expect(errors, `Unexpected page errors: ${errors.join(' | ')}`).toEqual([]);
});
