const { test, expect } = require('@playwright/test');

const BASE = 'http://127.0.0.1:8000';

test('Anchorage imports as a Baltimore Non-Ascendant villain without invented schema values', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));

  await page.goto(`${BASE}/characters.html`, { waitUntil: 'domcontentloaded' });
  const card = page.locator('.character-card[href="characters/anchorage/"]');
  await expect(card).toHaveCount(1);
  await expect(card).toContainText('Anchorage');
  await expect(card).toContainText('Villain');
  await expect(card).toContainText('Superhuman');
  await expect(card).toHaveAttribute('data-tags', /superhuman/);
  await expect(card.locator('img')).toHaveCount(1);
  await expect(card.locator('img')).toHaveAttribute('src', 'assets/characters/anchorage/anchorage-registry.png');
  await expect.poll(() => card.locator('img').evaluate(img => img.naturalWidth)).toBeGreaterThan(0);

  await page.locator('#filterToggle').click();
  await page.locator('[data-filter-group="role"][value="villain"]').check();
  await page.locator('#filterApply').click();
  await expect(page.locator('.character-card:visible')).toHaveCount(1);
  await expect(card).toBeVisible();

  await page.goto(`${BASE}/characters/anchorage/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('h1')).toHaveText('ANCHORAGE');
  await expect(page.locator('.character-kicker')).toContainText('VILLAIN');
  await expect(page.locator('.character-feature-art img')).toHaveAttribute('src', '../../assets/characters/anchorage/anchorage-primary.png');
  await expect(page.locator('.character-infobox img')).toHaveAttribute('src', '../../assets/characters/anchorage/anchorage-registry.png');
  await expect(page.locator('.dossier-illustration img')).toHaveCount(2);
  await expect.poll(() => page.locator('.character-feature-art img').evaluate(img => img.naturalWidth)).toBeGreaterThan(0);

  const framing = await page.evaluate(() => {
    const infobox = document.querySelector('.character-infobox');
    const side = document.querySelector('.anchorage-infobox-art');
    const abductionFigure = document.querySelector('.anchorage-abduction-art');
    const abduction = document.querySelector('.anchorage-abduction-art img');
    const sideRect = side.getBoundingClientRect();
    const infoboxRect = infobox.getBoundingClientRect();
    const abductionRect = abduction.getBoundingClientRect();
    const figureRect = abductionFigure.getBoundingClientRect();
    return {
      sideObjectFit: getComputedStyle(side).objectFit,
      sideObjectPosition: getComputedStyle(side).objectPosition,
      sideCenterDelta: Math.abs((sideRect.left + sideRect.width / 2) - (infoboxRect.left + infoboxRect.width / 2)),
      abductionObjectFit: getComputedStyle(abduction).objectFit,
      abductionObjectPosition: getComputedStyle(abduction).objectPosition,
      abductionCenterDelta: Math.abs((abductionRect.left + abductionRect.width / 2) - (figureRect.left + figureRect.width / 2))
    };
  });
  expect(framing.sideObjectFit).toBe('contain');
  expect(framing.sideObjectPosition).toBe('50% 50%');
  expect(framing.sideCenterDelta).toBeLessThanOrEqual(2);
  expect(framing.abductionObjectFit).toBe('contain');
  expect(framing.abductionObjectPosition).toBe('50% 50%');
  expect(framing.abductionCenterDelta).toBeLessThanOrEqual(2);
  await expect(page.locator('.info-list')).toContainText('Gilmer Simpson');
  await expect(page.locator('.info-list')).toContainText('Active');
  await expect(page.locator('.info-list')).toContainText('Superhuman');
  await expect(page.locator('.info-list')).toContainText('Non-Ascendant');
  await expect(page.locator('.info-list')).toContainText('Approximately 2 tons');
  await expect(page.locator('.info-list')).toContainText('approximately one year before Genesis');
  await expect(page.locator('.dpi-grid .dpi-row')).toHaveCount(11);
  await expect(page.locator('.wiki-section', { hasText: 'OldRoot Power Index' })).toContainText('No canonical overall power score is calculated or displayed');

  await page.goto(`${BASE}/dpi.html`, { waitUntil: 'networkidle' });
  await expect(page.locator('#count')).toHaveText('6 CHARACTERS');

  const records = await page.evaluate(() => window.OLDROOT_CHARACTERS);
  const anchorage = records.find(c => c.codename === 'Anchorage');
  const kincast = records.find(c => c.codename === 'Kincast');

  expect(anchorage).toBeTruthy();
  expect(anchorage.civilian).toBe('Gilmer Simpson');
  expect(anchorage.classification).toBe('Villain');
  expect(anchorage.role).toBe('Villain');
  expect(anchorage.powerClass).toBe('Superhuman');
  expect(anchorage.location).toBe('Baltimore, Maryland');
  expect(anchorage.locationKey).toBe('Baltimore');
  expect(anchorage.origin).toBe('Pre-Genesis experimental enhancement / Non-Ascendant');
  expect(anchorage.originType).toBe('Experimental Enhancement');
  expect(anchorage.ascendantStatus).toBe('Non-Ascendant');
  expect(anchorage.image).toBe('assets/characters/anchorage/anchorage-registry.png');
  expect(anchorage.age).toBe(37);
  expect(anchorage.heightIn).toBe(82);
  expect(anchorage.weightLb).toBeNull();
  expect(anchorage.baseline).toEqual({
    Strength:32.7,
    Durability:37.4,
    Speed:2.5,
    Agility:2.4,
    Regeneration:11.8,
    Senses:5.5,
    Offense:26.3,
    Intellect:6.7,
    Combat:17.1,
    Mobility:1.6,
    Stamina:9.7
  });
  expect(anchorage.conditional).toEqual([]);

  expect(kincast).toBeTruthy();
  expect(kincast.classification).toBe('Hero');
  expect(kincast.role).toBe('Hero');
  expect(kincast.location).toBe('Baltimore, Maryland');
  expect(kincast.ascendantStatus).toBe('Non-Ascendant');
  expect(kincast.baseline).toEqual({
    Strength:16.8,
    Durability:28.2,
    Speed:20.8,
    Agility:25.2,
    Regeneration:5.9,
    Senses:22.0,
    Offense:29.3,
    Intellect:14.6,
    Combat:31.6,
    Mobility:21.3,
    Stamina:16.4
  });

  await page.locator('#filter-open').click();
  await expect(page.locator('[data-filter-key="role"][value="Villain"]')).toHaveCount(1);
  await expect(page.locator('[data-filter-key="powerClass"][value="Superhuman"]')).toHaveCount(1);
  await expect(page.locator('[data-filter-key="originType"][value="Experimental Enhancement"]')).toHaveCount(1);

  await page.goto(`${BASE}/locations/baltimore/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('a[href="../../characters/anchorage/"]')).toHaveCount(2);
  await expect(page.locator('.dossier-facts')).toContainText('Primary hero');
  await expect(page.locator('.dossier-facts')).toContainText('Kincast');
  await expect(page.locator('.dossier-facts')).toContainText('Known villain');
  await expect(page.locator('.dossier-facts')).toContainText('Anchorage');
  const baltimoreArt = page.locator('.known-character-card[href="../../characters/anchorage/"] img');
  await expect(baltimoreArt).toHaveAttribute('src', '../../assets/characters/anchorage/anchorage-registry.png');
  await expect.poll(() => baltimoreArt.evaluate(img => img.naturalWidth)).toBeGreaterThan(0);

  expect(errors, `Unexpected page errors: ${errors.join(' | ')}`).toEqual([]);
});
