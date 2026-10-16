const { test, expect } = require('@playwright/test');

async function assertNoPageErrors(page, errors) {
  expect(errors, `Unexpected page errors: ${errors.join(' | ')}`).toEqual([]);
}

test('Locations globe core interactions remain stable', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));

  await page.goto('http://127.0.0.1:8000/locations.html', { waitUntil: 'networkidle' });

  await expect(page.locator('#techGlobe .location-node')).toHaveCount(8);
  const sharedLocationData = await page.evaluate(() => window.OLDROOT_LOCATIONS);
  expect(Object.keys(sharedLocationData)).toHaveLength(8);
  expect(Object.values(sharedLocationData).filter(loc => loc.dossierUrl && !loc.reference)).toHaveLength(6);
  await expect(page.locator('#locationName')).toHaveText('Tucson, Arizona');
  await expect(page.locator('[data-location="tucson"]')).toHaveAttribute('aria-pressed', 'true');

  const cases = [
    ['chicago', 'Chicago, Illinois', /characters\/commotion\//],
    ['sanjuan', 'San Juan, Puerto Rico', /characters\/aftermark\//],
    ['seattle', 'Seattle / Puget Sound', /characters\/agent-emerald\//],
  ];

  for (const [key, name, characterHref] of cases) {
    await page.locator(`[data-location="${key}"]`).click();
    await expect(page.locator('#locationName')).toHaveText(name);
    await expect(page).toHaveURL(new RegExp(`#${key}$`));
    await expect(page.locator('#locationCharacter a').first()).toHaveAttribute('href', characterHref);
    if (key === 'seattle') {
      await expect(page.locator('#locationCharacter a')).toHaveCount(2);
      await expect(page.locator('#locationCharacter a').nth(1)).toHaveAttribute('href','characters/flying-saucer/');
      await expect(page.locator('#locationCharacter a').nth(1)).toHaveText('Flying Saucer');
    }
  }

  await page.locator('[data-location="baltimore"]').click();
  await expect(page.locator('#locationName')).toHaveText('Baltimore, Maryland');
  await expect(page.locator('#locationCharacter a')).toHaveCount(2);
  await expect(page.locator('#locationCharacter a').nth(0)).toHaveText('Kincast');
  await expect(page.locator('#locationCharacter a').nth(0)).toHaveAttribute('href', 'characters/kincast/');
  await expect(page.locator('#locationCharacter a').nth(1)).toHaveText('Anchorage');
  await expect(page.locator('#locationCharacter a').nth(1)).toHaveAttribute('href', 'characters/anchorage/');
  await expect(page.locator('#locationCharacterLabel')).toHaveText('Known characters');

  await page.locator('.location-node[data-key="chicago"]').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#locationName')).toHaveText('Chicago, Illinois');

  const dcCluster = page.locator('.location-cluster[data-keys*="stdorsey"][data-keys*="baltimore"][data-keys*="washington"]');
  await expect(dcCluster).toHaveCount(1);
  await expect(dcCluster.locator('.cluster-count')).toHaveText('3');

  await dcCluster.locator('.cluster-core').click();
  await expect(page.locator('#globeClusterPanel')).toBeVisible();
  await expect(page.locator('#clusterOptions .cluster-option')).toHaveCount(3);
  await expect(page.locator('#clusterOptions')).toContainText('St. Dorsey');
  await expect(page.locator('#clusterOptions')).toContainText('Baltimore');
  await expect(page.locator('#clusterOptions')).toContainText('Washington, D.C.');

  await page.locator('[data-cluster-location="stdorsey"]').click();
  await expect(page.locator('#locationName')).toHaveText('St. Dorsey Island');
  await expect(page.locator('#locationStatus')).toContainText('schematic');

  await page.locator('#clusterNext').click();
  await expect(page.locator('#locationName')).toHaveText('Baltimore, Maryland');

  await page.locator('#globeClusterPanel').dispatchEvent('wheel', { deltaY: 120 });
  await expect(page.locator('#locationName')).toHaveText('Washington, D.C.');
  await expect(page.locator('#locationStatus')).toHaveText('Reference');
  await expect(page.locator('#locationExplore')).toBeHidden();

  await page.locator('#globeClusterPanel').focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('#locationName')).toHaveText('St. Dorsey Island');

  await page.keyboard.press('Escape');
  await expect(page.locator('#globeClusterPanel')).toBeHidden();

  await page.goto('http://127.0.0.1:8000/locations.html#australia', { waitUntil: 'networkidle' });
  await expect(page.locator('#locationName')).toHaveText('Australia');
  await expect(page.locator('#locationStatus')).toHaveText('Reference');
  await expect(page.locator('#locationCharacter a')).toHaveText('Latch');
  await expect(page.locator('#locationCharacter a')).toHaveAttribute('href', 'characters/latch/');
  await expect(page.locator('#locationNote')).toContainText('Australia anchors Latch Boswell’s early military career');
  await expect(page.locator('#locationExplore')).toBeHidden();

  for (let i = 0; i < 20; i += 1) await page.locator('#zoomInGlobe').click();
  await expect(page.locator('#globeZoomReadout')).toContainText('ZOOM 2.2×');

  await page.locator('#spaceView').click();
  await expect(page.locator('#spaceView')).toHaveClass(/active/);
  await expect(page.locator('#globeStage')).toHaveClass(/space-view/);
  await expect(page.locator('#globeZoomReadout')).toContainText('SPACE');

  await page.locator('[data-location="stdorsey"]').click();
  await expect(page.locator('#locationName')).toHaveText('St. Dorsey Island');
  await expect(page.locator('#locationStatus')).toContainText('schematic');
  await expect(page.locator('#locationNote')).toContainText('exact public coordinates are not established');
  await expect(page.locator('.location-node[data-key="stdorsey"]')).toHaveClass(/approximate/);

  await page.locator('#resetGlobe').click();
  await expect(page.locator('#locationName')).toHaveText('Tucson, Arizona');
  await expect(page.locator('#globeZoomReadout')).toContainText('ZOOM 1.0×');

  await assertNoPageErrors(page, errors);
});

test('Tucson globe surfaces Ballestera as a Nogales-area regional connection, not a Tucson resident', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:8000/locations.html#tucson', { waitUntil: 'networkidle' });

  await expect(page.locator('#locationName')).toHaveText('Tucson, Arizona');
  await expect(page.locator('#locationCharacter a')).toHaveCount(1);
  await expect(page.locator('#locationCharacter a')).toHaveText('Gila Monster');
  await expect(page.locator('#locationRegional')).toBeVisible();
  await expect(page.locator('#locationRegional')).toContainText('Outside the Nogales area, south of Tucson');
  await expect(page.locator('#locationRegional')).toContainText('no published exact coordinates');
  await expect(page.locator('#locationRegional a')).toHaveText('Ballestera');
  await expect(page.locator('#locationRegional a')).toHaveAttribute('href', 'characters/ballestera/');

  // Regional story links never create invented globe locations or move city pins.
  await expect(page.locator('#techGlobe .location-node')).toHaveCount(8);
  await expect(page.locator('#techGlobe .location-node[data-key="ballestera"]')).toHaveCount(0);
  const data = await page.evaluate(() => window.OLDROOT_LOCATIONS);
  expect(data.tucson.regionalConnections).toHaveLength(1);
  expect(data.tucson.regionalConnections[0].name).toBe('Ballestera');

  await page.locator('[data-location="chicago"]').click();
  await expect(page.locator('#locationRegional')).toBeHidden();
  await expect(page.locator('#locationCharacter a')).toHaveText('Commotion');
  await page.locator('[data-location="tucson"]').click();
  await expect(page.locator('#locationRegional')).toBeVisible();
  await page.locator('#resetGlobe').click();
  await expect(page.locator('#locationRegional a')).toHaveAttribute('href', 'characters/ballestera/');

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('#locationRegional')).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(2);

  await page.goto('http://127.0.0.1:8000/locations/tucson/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.location-main')).toContainText('not in Tucson');
  await expect(page.locator('.location-facts a[href="../../characters/ballestera/"]')).toBeVisible();
  await expect(page.locator('.location-facts a[href="../../characters/gila-monster/"]')).toBeVisible();
  await assertNoPageErrors(page, errors);
});

test('Locations globe prefers local world topology when the remote fallback is unavailable', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/world-atlas@2.0.2/countries-110m.json', route => route.abort());

  await page.goto('http://127.0.0.1:8000/locations.html', { waitUntil: 'networkidle' });
  await expect(page.locator('#techGlobe .location-node')).toHaveCount(8);
  await expect(page.locator('#globeLoading')).toBeHidden();
  await expect(page.locator('.earth-land')).toHaveAttribute('d', /.+/);
  await assertNoPageErrors(page, errors);
});

test('Locations globe keeps location records usable when both topology sources fail', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/assets/data/world-110m.json', route => route.abort());
  await page.route('**/world-atlas@2.0.2/countries-110m.json', route => route.abort());

  await page.goto('http://127.0.0.1:8000/locations.html');
  await expect(page.locator('#techGlobe .location-node')).toHaveCount(8);
  await expect(page.locator('#globeLoading')).toContainText('MAP DETAIL UNAVAILABLE');
  await page.locator('[data-location="baltimore"]').click();
  await expect(page.locator('#locationName')).toHaveText('Baltimore, Maryland');
  await assertNoPageErrors(page, errors);
});

test('Locations globe supports mobile drag and pinch while preserving page scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:8000/locations.html', { waitUntil: 'networkidle' });

  const globe = page.locator('#techGlobe');
  const touchAction = await globe.evaluate(el => getComputedStyle(el).touchAction);
  expect(touchAction).toContain('pan-y');
  expect(touchAction).not.toContain('pinch-zoom');
  await expect(page.locator('.location-index button')).toHaveCount(7);

  const gridBeforeDrag = await page.locator('.earth-grid').getAttribute('d');
  await globe.dispatchEvent('pointerdown', {
    pointerId: 11, pointerType: 'touch', isPrimary: true, clientX: 90, clientY: 250, buttons: 1
  });
  await globe.dispatchEvent('pointermove', {
    pointerId: 11, pointerType: 'touch', isPrimary: true, clientX: 170, clientY: 252, buttons: 1
  });
  await globe.dispatchEvent('pointerup', {
    pointerId: 11, pointerType: 'touch', isPrimary: true, clientX: 170, clientY: 252, buttons: 0
  });
  const gridAfterDrag = await page.locator('.earth-grid').getAttribute('d');
  expect(gridAfterDrag).not.toBe(gridBeforeDrag);

  await page.locator('#resetGlobe').click();
  await expect(page.locator('#globeZoomReadout')).toContainText('ZOOM 1.0×');

  await globe.dispatchEvent('pointerdown', {
    pointerId: 21, pointerType: 'touch', isPrimary: true, clientX: 90, clientY: 240, buttons: 1
  });
  await globe.dispatchEvent('pointerdown', {
    pointerId: 22, pointerType: 'touch', isPrimary: false, clientX: 230, clientY: 240, buttons: 1
  });
  await globe.dispatchEvent('pointermove', {
    pointerId: 22, pointerType: 'touch', isPrimary: false, clientX: 330, clientY: 240, buttons: 1
  });

  await expect(page.locator('#globeZoomReadout')).not.toContainText('ZOOM 1.0×');

  await globe.dispatchEvent('pointerup', {
    pointerId: 22, pointerType: 'touch', isPrimary: false, clientX: 330, clientY: 240, buttons: 0
  });
  await globe.dispatchEvent('pointerup', {
    pointerId: 21, pointerType: 'touch', isPrimary: true, clientX: 90, clientY: 240, buttons: 0
  });

  await expect(page.locator('#globeStage')).not.toHaveClass(/is-pinching/);
});


test('Locations directory stays dark and exposes a globe-skip shortcut', async ({ page }) => {
  await page.goto('http://127.0.0.1:8000/locations.html', { waitUntil: 'domcontentloaded' });

  const jump = page.locator('.location-jumpbar a');
  await expect(jump).toHaveAttribute('href', '#indexed-places');
  await expect(jump).toContainText('Jump to Indexed Places');

  await expect(page.locator('.location-cosmic-panel')).toBeVisible();
  await expect(page.locator('.location-cosmic-image')).toHaveAttribute('src', 'assets/locations/oldroot-galaxy-mark.svg');
  await expect(page.locator('.location-cosmic-panel')).not.toContainText('UNRESOLVED HORIZON');
  await expect.poll(() => page.locator('.location-cosmic-image').evaluate(img => img.naturalWidth)).toBeGreaterThan(0);

  const directory = page.locator('#indexed-places');
  await expect(directory).toBeVisible();
  await expect(directory.locator('.place-card')).toHaveCount(7);

  const appearance = await directory.evaluate(el => {
    const s = getComputedStyle(el);
    const heading = getComputedStyle(el.querySelector('h2'));
    const card = getComputedStyle(el.querySelector('.place-card'));
    const cardTitle = getComputedStyle(el.querySelector('.place-card h3'));
    return {
      background: s.backgroundImage,
      color: s.color,
      headingColor: heading.color,
      cardBackground: card.backgroundImage,
      cardTitleColor: cardTitle.color
    };
  });

  expect(appearance.background).toContain('linear-gradient');
  expect(appearance.cardBackground).toContain('linear-gradient');
  expect(appearance.color).not.toBe('rgb(21, 21, 21)');
  expect(appearance.headingColor).not.toBe('rgb(23, 52, 40)');
  expect(appearance.cardTitleColor).not.toBe('rgb(23, 52, 40)');

  await jump.click();
  await expect(page).toHaveURL(/#indexed-places$/);
});
