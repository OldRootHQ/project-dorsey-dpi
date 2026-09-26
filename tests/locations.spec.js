const { test, expect } = require('@playwright/test');

async function assertNoPageErrors(page, errors) {
  expect(errors, `Unexpected page errors: ${errors.join(' | ')}`).toEqual([]);
}

test('Locations globe core interactions remain stable', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));

  await page.goto('http://127.0.0.1:8000/locations.html', { waitUntil: 'networkidle' });

  await expect(page.locator('#techGlobe .location-node')).toHaveCount(5);
  await expect(page.locator('#locationName')).toHaveText('Tucson, Arizona');
  await expect(page.locator('[data-location="tucson"]')).toHaveAttribute('aria-pressed', 'true');

  const cases = [
    ['chicago', 'Chicago, Illinois', /characters\/commotion\//],
    ['sanjuan', 'San Juan, Puerto Rico', /characters\/aftermark\//],
    ['baltimore', 'Baltimore, Maryland', /characters\/kincast\//]
  ];

  for (const [key, name, characterHref] of cases) {
    await page.locator(`[data-location="${key}"]`).click();
    await expect(page.locator('#locationName')).toHaveText(name);
    await expect(page).toHaveURL(new RegExp(`#${key}$`));
    await expect(page.locator('#locationCharacter a')).toHaveAttribute('href', characterHref);
  }

  await page.locator('.location-node[data-key="chicago"]').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#locationName')).toHaveText('Chicago, Illinois');

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

test('Locations globe survives world-atlas failure', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/world-atlas@2/countries-110m.json', route => route.abort());

  await page.goto('http://127.0.0.1:8000/locations.html');
  await expect(page.locator('#techGlobe .location-node')).toHaveCount(5);
  await expect(page.locator('#globeLoading')).toContainText('MAP DETAIL UNAVAILABLE');
  await page.locator('[data-location="baltimore"]').click();
  await expect(page.locator('#locationName')).toHaveText('Baltimore, Maryland');
  await assertNoPageErrors(page, errors);
});

test('Locations globe preserves mobile page scrolling behavior', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:8000/locations.html', { waitUntil: 'domcontentloaded' });
  const touchAction = await page.locator('#techGlobe').evaluate(el => getComputedStyle(el).touchAction);
  expect(touchAction).toContain('pan-y');
  await expect(page.locator('.location-index button')).toHaveCount(5);
});
