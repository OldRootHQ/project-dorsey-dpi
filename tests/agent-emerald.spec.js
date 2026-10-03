const { test, expect } = require('@playwright/test');

const BASE = 'http://127.0.0.1:8000';

test('Agent Emerald canon is propagated as the first Superior Human with creator artwork', async ({ page }) => {
  await page.goto(`${BASE}/characters.html`, { waitUntil: 'domcontentloaded' });
  const card = page.locator('.character-card[href="characters/agent-emerald/"]');
  await expect(card).toHaveCount(1);
  await expect(card).toContainText('Agent Emerald');
  await expect(card).toContainText('Remington James “Remy” Hampton');
  await expect(card).toContainText('Superior Human');
  await expect(card.locator('img')).toHaveAttribute('src', 'assets/characters/agent-emerald/agent-emerald-registry.webp');
  await expect.poll(() => card.locator('img').evaluate(img => img.naturalWidth)).toBeGreaterThan(0);

  await page.locator('#filterToggle').click();
  await page.locator('[data-filter-group="role"][value="vigilante"]').check();
  await page.locator('#filterApply').click();
  await expect(page.locator('.character-card:visible')).toHaveCount(1);
  await expect(card).toBeVisible();

  await page.locator('#filterToggle').click();
  await page.locator('#filterClear').click();
  await page.locator('[data-filter-group="power"][value="superior-human"]').check();
  await page.locator('#filterApply').click();
  await expect(page.locator('.character-card:visible')).toHaveCount(1);
  await expect(card).toBeVisible();

  await page.goto(`${BASE}/characters/agent-emerald/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('h1')).toHaveText('AGENT EMERALD');
  await expect(page.locator('.character-feature-art img')).toHaveAttribute('src', '../../assets/characters/agent-emerald/agent-emerald-primary.webp');
  const introLayout = await page.evaluate(() => {
    const identity = document.querySelector('.character-identity').getBoundingClientRect();
    const cover = document.querySelector('.agent-emerald-feature-cover').getBoundingClientRect();
    const image = document.querySelector('.agent-emerald-feature-cover img');
    return {
      identityTop: identity.top,
      identityBottom: identity.bottom,
      coverTop: cover.top,
      coverHeight: cover.height,
      imageFit: getComputedStyle(image).objectFit
    };
  });
  expect(introLayout.identityTop).toBeLessThan(introLayout.coverTop);
  expect(introLayout.identityBottom).toBeLessThanOrEqual(introLayout.coverTop);
  expect(introLayout.coverHeight).toBeLessThanOrEqual(500);
  expect(introLayout.imageFit).toBe('contain');
  await expect(page.locator('.character-infobox img')).toHaveAttribute('src', '../../assets/characters/agent-emerald/agent-emerald-registry.webp');
  await expect(page.locator('.dossier-illustration img')).toHaveCount(5);
  await expect(page.locator('.logo-slot')).toContainText('DESIGN NOT ESTABLISHED');
  await expect(page.locator('.character-infobox')).toContainText('Executive Vice President of Advanced Systems & Prototyping');
  await expect(page.locator('.character-infobox')).toContainText('Superior Human');
  await expect(page.locator('.dpi-row').filter({ hasText: 'Senses' }).locator('.dpi-value')).toHaveText('11.7');
  await expect(page.locator('.conditional-box')).toContainText('Senses — Precision Pill Active: 16.1');
  await expect(page.locator('.wiki-section').filter({ hasText: 'OldRoot Power Index' })).toContainText('50.0 — Theoretical ceiling');
  await expect(page.locator('.wiki-section').filter({ hasText: 'OldRoot Power Index' })).toContainText('No overall OPI score is published');

  const values = await page.locator('.dpi-row').evaluateAll(rows => Object.fromEntries(rows.map(row => [
    row.querySelector('.dpi-name').textContent.trim(),
    Number(row.querySelector('.dpi-value').textContent.trim())
  ])));
  expect(values).toEqual({
    Strength:7.7,
    Durability:10.9,
    Speed:8.1,
    Agility:12.0,
    Regeneration:5.5,
    Senses:11.7,
    Offense:18.5,
    Intellect:14.8,
    Combat:19.0,
    Mobility:15.3,
    Stamina:9.2
  });

  await page.goto(`${BASE}/dpi.html`, { waitUntil: 'networkidle' });
  const records = await page.evaluate(() => window.OLDROOT_CHARACTERS);
  const remy = records.find(c => c.codename === 'Agent Emerald');
  expect(remy).toBeTruthy();
  expect(remy.civilian).toBe('Remington James “Remy” Hampton');
  expect(remy.classification).toBe('Vigilante');
  expect(remy.role).toBe('Vigilante');
  expect(remy.powerClass).toBe('Superior Human');
  expect(remy.ascendantStatus).toBeNull();
  expect(remy.location).toBe('Seattle, Washington / Puget Sound');
  expect(remy.locationKey).toBe('Seattle');
  expect(remy.affiliation).toBe('Dunamis Dynamics');
  expect(remy.image).toBe('assets/characters/agent-emerald/agent-emerald-registry.webp');
  expect(remy.age).toBe(25);
  expect(remy.heightIn).toBe(73);
  expect(remy.weightLb).toBe(185);
  expect(remy.baseline).toEqual({
    Strength:7.7,
    Durability:10.9,
    Speed:8.1,
    Agility:12.0,
    Regeneration:5.5,
    Senses:11.7,
    Offense:18.5,
    Intellect:14.8,
    Combat:19.0,
    Mobility:15.3,
    Stamina:9.2
  });
  expect(remy.conditional).toEqual([{ category:'Senses', condition:'Precision Pill Active', value:16.1 }]);

  await page.locator('#filter-open').click();
  await page.locator('[data-filter-key="powerClass"][value="Superior Human"]').check();
  await page.locator('#filter-apply').click();
  await expect(page.locator('#count')).toHaveText('1 CHARACTER');
  await expect(page.locator('#detail')).toContainText('Agent Emerald');

  await page.goto(`${BASE}/locations.html#seattle`, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-location="seattle"]').click();
  await expect(page.locator('#locationName')).toHaveText('Seattle / Puget Sound');
  await expect(page.locator('#locationCharacter a[href="characters/agent-emerald/"]')).toHaveText('Agent Emerald');
  await expect(page.locator('#locationExplore')).toHaveAttribute('href', 'locations/seattle/');

  await page.goto(`${BASE}/locations/seattle/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('h1')).toHaveText('SEATTLE / PUGET SOUND');
  await expect(page.locator('a[href="../../characters/agent-emerald/"]')).toHaveCount(2);
  await expect(page.locator('.known-character-card[href="../../characters/agent-emerald/"] img')).toHaveAttribute('src', '../../assets/characters/agent-emerald/agent-emerald-registry.webp');

  await page.goto(`${BASE}/locations/st-dorsey/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.location-main')).toContainText('specialized sonar and submarine systems');
  await expect(page.locator('.location-main')).toContainText('not the separate Seattle / Puget Sound logistics and fabrication annex');

  await page.goto(`${BASE}/organizations.html`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.org-card[href="organizations/dunamis-dynamics/"]')).toContainText('Dunamis Dynamics');
  await page.locator('[data-org-filter="corporate"]').click();
  await expect(page.locator('.org-card:visible')).toHaveCount(1);
  await expect(page.locator('.org-card[href="organizations/dunamis-dynamics/"]')).toBeVisible();

  await page.goto(`${BASE}/organizations/dunamis-dynamics/`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('h1')).toHaveText('DUNAMIS DYNAMICS');
  await expect(page.locator('.dossier-facts')).toContainText('Mark Hampton');
  await expect(page.locator('.org-main')).toContainText('VX-11 belongs to Remy personally');
  await expect(page.locator('.known-character-card[href="../../characters/agent-emerald/"] img')).toHaveAttribute('src', '../../assets/characters/agent-emerald/agent-emerald-registry.webp');

  await page.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.hero-signal-row')).toContainText(/Characters\s*07/);
  await expect(page.locator('.hero-signal-row')).toContainText(/Places\s*06/);
  await expect(page.locator('[data-home-character="agent-emerald"]')).toHaveCount(1);
  const agentHome = page.locator('[data-home-slide="agent-emerald"] img');
  await expect(agentHome).toHaveAttribute('src', 'assets/characters/agent-emerald/agent-emerald-featured.webp');
  await page.locator('[data-home-character="agent-emerald"]').click();
  await expect(agentHome).toBeVisible();
  await expect.poll(() => agentHome.evaluate(img => img.naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator('#homeCharacterCounter')).toHaveText('6 / 7');

  await page.goto(`${BASE}/start-here.html`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.start-stat-panel')).toContainText('7 active records');
  await expect(page.locator('a[href="characters/agent-emerald/"]')).toHaveCount(1);
});

test('Agent Emerald pages stay inside a phone viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/characters/agent-emerald/', '/locations/seattle/', '/organizations/dunamis-dynamics/']) {
    await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
    const dims = await page.evaluate(() => ({
      viewport: innerWidth,
      html: document.documentElement.scrollWidth,
      body: document.body.scrollWidth
    }));
    expect(dims.html, path).toBeLessThanOrEqual(dims.viewport + 2);
    expect(dims.body, path).toBeLessThanOrEqual(dims.viewport + 2);
    if (path === '/characters/agent-emerald/') {
      const coverHeight = await page.locator('.agent-emerald-feature-cover').evaluate(el => el.getBoundingClientRect().height);
      expect(coverHeight).toBeLessThanOrEqual(390);
    }
  }
});