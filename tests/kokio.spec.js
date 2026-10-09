const { test, expect } = require('@playwright/test');

const BASE = 'http://127.0.0.1:8000';

test('Kokio is promoted across public character discovery surfaces', async ({ page }) => {
  await page.goto(BASE + '/characters.html', { waitUntil: 'domcontentloaded' });
  const card = page.locator('.character-card[href="characters/kokio/"]');
  await expect(card).toHaveCount(1);
  await expect(card).toContainText('Kalani Kane');
  await expect(card).toContainText('Demi-God');
  await expect(card).toHaveAttribute('data-release-order', '8');
  await expect(card.locator('img')).toHaveAttribute('src', 'assets/characters/kokio/kokio-casual.webp');

  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  const kokioHome = await page.evaluate(() => ({
    spotlight: window.OLDROOT_HOME.characterSpotlights.Kokio,
    pool: window.OLDROOT_HOME_STATE.characterPool,
    upcomingPool: window.OLDROOT_HOME_STATE.upcomingPool
  }));
  expect(kokioHome.pool).toContain('Kokio');
  expect(kokioHome.upcomingPool).not.toContain('Kokio');
  expect(kokioHome.spotlight.image).toBe('assets/characters/kokio/kokio-combat-01.webp');
  expect(kokioHome.spotlight.teaser).toContain('Hilo warrior');

  await page.goto(BASE + '/news.html#upcoming-characters', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#upcoming-characters')).not.toContainText('Kalani');
  await expect(page.locator('#upcoming-characters')).toContainText('Duke');

  await page.goto(BASE + '/start-here.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('a[href="characters/kokio/"]').filter({ hasText: 'Kokio' })).toHaveCount(1);
});

test('Kokio dossier preserves locked canon, art package, and narrative boundaries', async ({ page }) => {
  await page.goto(BASE + '/characters/kokio/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('h1')).toHaveText('KOKIO');
  await expect(page.locator('.character-subtitle')).toHaveText('Kalani Kane');
  await expect(page.locator('.logo-slot')).toContainText('Mythic hero dossier');
  await expect(page.locator('.character-feature-art img')).toHaveAttribute('src', '../../assets/characters/kokio/kokio-combat-01.webp');
  await expect(page.locator('.character-infobox > img')).toHaveAttribute('src', '../../assets/characters/kokio/kokio-combat-07.webp');

  const required = [
    'kokio-casual.webp','kokio-combat-01.webp','kokio-combat-03.webp',
    'kokio-combat-04.webp','kokio-combat-05.webp','kokio-combat-07.webp'
  ];
  const sources = await page.locator('img').evaluateAll(images => images.map(img => img.getAttribute('src') || ''));
  for (const asset of required) expect(sources.some(src => src.endsWith(asset)), asset).toBe(true);

  await expect(page.locator('body')).toContainText('Takaro is not inside Kalani');
  await expect(page.locator('body')).toContainText('final direct interaction');
  await expect(page.locator('body')).toContainText('does not fly');
  await expect(page.locator('body')).toContainText('does not permit limb severance or organ removal');
  await expect(page.locator('body')).toContainText('exact forest and hidden community remain fictionalized');
  await expect(page.locator('body')).not.toContainText('remain intentionally undefined');
});

test('Kokio exact OPI profile is published without a canonical overall score', async ({ page }) => {
  await page.goto(BASE + '/dpi.html', { waitUntil: 'networkidle' });
  const kokio = await page.evaluate(() => window.OLDROOT_CHARACTERS.find(c => c.codename === 'Kokio'));
  expect(kokio).toBeTruthy();
  expect(kokio.civilian).toBe('Kalani Kane');
  expect(kokio.powerClass).toBe('Demi-God');
  expect(kokio.location).toBe('Hilo, Hawaiʻi Island');
  expect(kokio.locationKey).toBe('Hilo');
  expect(kokio.ascendantStatus).toBeNull();
  expect(kokio.affiliation).toBeNull();
  expect(kokio.age).toBe(26);
  expect(kokio.heightIn).toBe(67);
  expect(kokio.weightLb).toBe(175);
  expect(kokio.baseline).toEqual({
    Strength:33.0,Durability:32.1,Speed:28.4,Agility:26.7,Regeneration:13.1,Senses:13.8,
    Offense:35.6,Intellect:6.2,Combat:23.7,Mobility:16.7,Stamina:26.8
  });

  await page.goto(BASE + '/characters/kokio/', { waitUntil: 'domcontentloaded' });
  const values = await page.locator('.dpi-row').evaluateAll(rows => Object.fromEntries(rows.map(row => [
    row.querySelector('.dpi-name').textContent.trim(), Number(row.querySelector('.dpi-value').textContent.trim())
  ])));
  expect(values).toEqual(kokio.baseline);
  await expect(page.locator('.wiki-section').filter({ hasText: 'OldRoot Power Index' })).toContainText('analytics mean is a reference calculation');
});

test('Kokio and Hilo remain contained at phone width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/characters/kokio/', '/locations/hilo/']) {
    await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
    const dims = await page.evaluate(() => ({
      viewport: innerWidth,
      html: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
      mast: document.querySelector('.masthead').getBoundingClientRect().width
    }));
    expect(dims.html, path).toBeLessThanOrEqual(dims.viewport + 2);
    expect(dims.body, path).toBeLessThanOrEqual(dims.viewport + 2);
    expect(dims.mast, path).toBeLessThanOrEqual(dims.viewport + 1);
  }
});

test('Kokio release connects Hilo, README, and sitemap', async ({ page }) => {
  await page.goto(BASE + '/index.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.hero-signal-row')).toHaveCount(0);

  await page.goto(BASE + '/locations.html#hilo', { waitUntil: 'networkidle' });
  await page.locator('[data-location="hilo"]').click();
  await expect(page.locator('#locationName')).toHaveText('Hilo, Hawaiʻi Island');
  await expect(page.locator('#locationCharacter a[href="characters/kokio/"]')).toHaveText('Kokio');
  await expect(page.locator('#locationExplore')).toHaveAttribute('href', 'locations/hilo/');

  const sitemap = await (await page.request.get(BASE + '/sitemap.xml')).text();
  expect(sitemap).toContain('/characters/kokio/');
  expect(sitemap).toContain('/locations/hilo/');
  expect(sitemap).not.toContain('\\n');

  const readme = await (await page.request.get(BASE + '/README.md')).text();
  expect(readme).toContain('- Kokio / Kalani Kane');
});
