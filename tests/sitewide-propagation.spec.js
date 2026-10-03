const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE = 'http://127.0.0.1:8000';

test('public registry is propagated across discovery surfaces and the homepage has six slides', async ({ page }) => {
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-home-character]')).toHaveCount(7);
  await expect(page.locator('[data-home-slide]')).toHaveCount(7);
  await expect(page.locator('#homeCharacterTrack')).toHaveCount(1);
  const carouselLayout = await page.evaluate(() => {
    const featured = document.querySelector('.home-featured');
    const discover = [...document.querySelectorAll('.section-band')].find(section => section.textContent.includes('DISCOVER OLDROOT'));
    const track = document.querySelector('#homeCharacterTrack');
    return {
      featuredBeforeDiscover: Boolean(featured && discover && (featured.compareDocumentPosition(discover) & Node.DOCUMENT_POSITION_FOLLOWING)),
      scrollable: Boolean(track && track.scrollWidth > track.clientWidth)
    };
  });
  expect(carouselLayout.featuredBeforeDiscover).toBe(true);
  expect(carouselLayout.scrollable).toBe(true);
  await expect(page.locator('[data-home-character="anchorage"]')).toHaveCount(1);
  const featuredArt = page.locator('[data-home-slide="anchorage"] img');
  await expect(featuredArt).toHaveAttribute('src', 'assets/characters/anchorage/anchorage-featured.png');
  await expect(page.locator('#homeCharacterCounter')).toHaveText('1 / 7');
  await page.locator('#homeCharacterNext').click();
  await expect(page.locator('#homeCharacterCounter')).toHaveText('2 / 7');
  await expect.poll(() => page.locator('#homeCharacterTrack').evaluate(el => el.scrollLeft)).toBeGreaterThan(0);
  await page.locator('[data-home-character="anchorage"]').click();
  await expect(page.locator('[data-home-slide="anchorage"]')).toHaveClass(/active/);
  await expect.poll(() => featuredArt.evaluate(img => img.naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator('[data-home-slide="anchorage"] a[href="characters/anchorage/"]')).toHaveCount(1);
  await expect(page.locator('.home-world-grid a[href="locations/baltimore/"]')).toContainText('Anchorage');

  await page.goto(BASE + '/start-here.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.start-stat-panel')).toContainText('6 active records');
  await expect(page.locator('a[href="characters/anchorage/"]')).toHaveCount(1);
  await expect(page.locator('text=Six ways into the cast.')).toHaveCount(1);

  await page.goto(BASE + '/locations.html', { waitUntil: 'domcontentloaded' });
  await page.locator('[data-location="baltimore"]').click();
  await expect(page.locator('#locationCharacter a[href="characters/anchorage/"]')).toHaveCount(1);
  await expect(page.locator('.location-dossier-cards a[href="locations/baltimore/"]')).toContainText('Anchorage');

  await page.goto(BASE + '/locations/baltimore/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('a[href="../../characters/anchorage/"]')).toHaveCount(2);

  await page.goto(BASE + '/dpi.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#count')).toHaveText('6 CHARACTERS');
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
