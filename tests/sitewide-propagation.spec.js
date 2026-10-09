const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE = 'http://127.0.0.1:8000';

test('homepage samples the universe while complete registries remain intact', async ({ page }) => {
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('[data-home-character]')).toHaveCount(3);
  await expect(page.locator('[data-home-slide]')).toHaveCount(3);
  await expect(page.locator('[data-home-location]')).toHaveCount(3);
  await expect(page.locator('[data-home-upcoming]')).toHaveCount(3);
  await expect(page.locator('#homeCharacterCounter')).toHaveText('1 / 3');
  await expect(page.locator('.hero-signal-row')).toHaveCount(0);
  await expect(page.locator('#homePublicCharacterCount, #homeEstablishedPlaceCount, #homeOpiAxisCount')).toHaveCount(0);
  await expect(page.locator('.editorial-hero .hero-actions a')).toHaveCount(2);

  const state = await page.evaluate(() => window.OLDROOT_HOME_STATE);
  expect(state.characterPool).toHaveLength(11);
  expect(state.locationPool).toEqual(['tucson','chicago','sanjuan','stdorsey','baltimore','seattle','hilo']);
  expect(state.upcomingPool).toHaveLength(7);
  expect(state.selectedCharacters).toHaveLength(3);
  expect(state.selectedLocations).toHaveLength(3);
  expect(state.selectedUpcoming).toHaveLength(3);
  expect(new Set(state.selectedCharacters).size).toBe(3);
  expect(new Set(state.selectedLocations).size).toBe(3);
  expect(new Set(state.selectedUpcoming).size).toBe(3);
  for (const name of state.selectedCharacters) expect(state.characterPool).toContain(name);
  for (const key of state.selectedLocations) expect(state.locationPool).toContain(key);
  for (const name of state.selectedUpcoming) expect(state.upcomingPool).toContain(name);

  const layout = await page.evaluate(() => {
    const character = document.querySelector('#character-spotlight');
    const world = document.querySelector('#world-spotlight');
    const explore = document.querySelector('#explore-oldroot');
    const track = document.querySelector('#homeCharacterTrack');
    return {
      characterBeforeWorld: Boolean(character && world && (character.compareDocumentPosition(world) & Node.DOCUMENT_POSITION_FOLLOWING)),
      worldBeforeExplore: Boolean(world && explore && (world.compareDocumentPosition(explore) & Node.DOCUMENT_POSITION_FOLLOWING)),
      scrollable: Boolean(track && track.scrollWidth > track.clientWidth)
    };
  });
  expect(layout.characterBeforeWorld).toBe(true);
  expect(layout.worldBeforeExplore).toBe(true);
  expect(layout.scrollable).toBe(true);

  await page.locator('#homeCharacterNext').click();
  await expect(page.locator('#homeCharacterCounter')).toHaveText('2 / 3');
  await expect.poll(() => page.locator('#homeCharacterTrack').evaluate(el => el.scrollLeft)).toBeGreaterThan(0);

  await expect(page.locator('#explore-oldroot')).toContainText('Start Here');
  await expect(page.locator('#explore-oldroot')).toContainText('Characters');
  await expect(page.locator('#explore-oldroot')).toContainText('World');
  await expect(page.locator('#explore-oldroot')).toContainText('Lore & Systems');
  await expect(page.locator('#homeLatestDispatch')).toContainText('OR-WEB-0074');
  await expect(page.locator('#character-spotlight')).toContainText('Faces from across OldRoot.');
  await expect(page.locator('#world-spotlight')).toContainText('Places where the story is already moving.');
  await expect(page.locator('#explore-oldroot')).toContainText('Find your way in.');
  await expect(page.locator('#upcoming-characters')).toContainText('What’s taking shape next.');
  await expect(page.locator('main')).not.toContainText('Three faces from the OldRoot universe.');
  await expect(page.locator('main')).not.toContainText('Three places from the living index.');
  await expect(page.locator('main')).not.toContainText('Three names still taking shape.');
  await expect(page.locator('.home-library-teaser')).toHaveCount(1);

  await page.goto(BASE + '/characters.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.character-card')).toHaveCount(11);
  await expect(page.locator('.character-card').filter({ hasText: 'Anchorage' })).toHaveCount(1);
  await expect(page.locator('.character-card').filter({ hasText: 'Kokio' })).toHaveCount(1);

  await page.goto(BASE + '/start-here.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.start-stat-panel')).toContainText('11 active records');
  await expect(page.locator('a[href="characters/anchorage/"]')).toHaveCount(1);
  await expect(page.locator('text=Meet the expanding cast.')).toHaveCount(1);

  await page.goto(BASE + '/locations.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.location-index button')).toHaveCount(7);
  await page.locator('[data-location="baltimore"]').click();
  await expect(page.locator('#locationCharacter a[href="characters/anchorage/"]')).toHaveCount(1);

  await page.goto(BASE + '/dpi.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#count')).toHaveText('11 CHARACTERS');
});

test('homepage hero uses the compact OR-WEB-0046 scale on desktop and mobile', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });

  const desktop = await page.evaluate(() => {
    const hero = document.querySelector('.editorial-hero').getBoundingClientRect();
    const title = getComputedStyle(document.querySelector('.editorial-hero h1'));
    return { heroHeight: hero.height, titleSize: parseFloat(title.fontSize) };
  });
  expect(desktop.heroHeight).toBeLessThan(650);
  expect(desktop.titleSize).toBeLessThanOrEqual(112.5);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  const mobile = await page.evaluate(() => {
    const title = getComputedStyle(document.querySelector('.editorial-hero h1'));
    return {
      titleSize: parseFloat(title.fontSize),
      width: document.documentElement.scrollWidth,
      viewport: innerWidth
    };
  });
  expect(mobile.titleSize).toBeLessThanOrEqual(60.5);
  expect(mobile.width).toBeLessThanOrEqual(mobile.viewport + 2);
  await expect(page.locator('link[href="home.css?v=5"]')).toHaveCount(1);
});

test('every masthead exposes an explicit Home tab with the correct relative path', async () => {
  const root = process.cwd();
  const htmlFiles = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === '.git' || entry.name === 'node_modules') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith('.html')) htmlFiles.push(full);
    }
  }
  walk(root);

  const missing = [];
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    if (!html.includes('class="masthead"')) continue;
    const relative = path.relative(root, file).replace(/\\/g, '/');
    const expected = relative.includes('/') ? 'href="../../index.html">Home</a>' : 'href="index.html">Home</a>';
    const homeActive = relative === 'index.html' && html.includes('class="active" href="index.html">Home</a>');
    const projectRootHome = relative === '404.html' && html.includes('href="/project-dorsey-dpi/">Home</a>');
    if (!html.includes(expected) && !homeActive && !projectRootHome) missing.push(relative);
  }
  expect(missing).toEqual([]);
});
