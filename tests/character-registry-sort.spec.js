const { test, expect } = require('@playwright/test');

const BASE = 'http://127.0.0.1:8000';
const ALPHABETICAL = ['Aftermark', 'Agent Emerald', 'Amari Razman', 'Anchorage', 'Ballestera', 'Commotion', 'Gila Monster', 'Kincast', 'Kokio', 'Latch', 'Remedie'];
const RELEASE = ['Gila Monster', 'Commotion', 'Aftermark', 'Kincast', 'Anchorage', 'Agent Emerald', 'Latch', 'Kokio', 'Amari Razman', 'Ballestera', 'Remedie'];
const NEWEST = [...RELEASE].reverse();

async function cardNames(page, visibleOnly = false) {
  const selector = visibleOnly ? '.character-card:visible h3' : '.character-card h3';
  return page.locator(selector).allTextContents();
}

test('Character Registry defaults to alphabetical order', async ({ page }) => {
  await page.goto(BASE + '/characters.html', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('#registrySort')).toHaveValue('alphabetical');
  expect(await cardNames(page)).toEqual(ALPHABETICAL);

  const orders = await page.locator('.character-card').evaluateAll(cards =>
    Object.fromEntries(cards.map(card => [
      card.querySelector('h3').textContent.trim(),
      Number(card.dataset.releaseOrder)
    ]))
  );
  expect(orders).toEqual({
    'Gila Monster': 1,
    'Commotion': 2,
    'Aftermark': 3,
    'Kincast': 4,
    'Anchorage': 5,
    'Agent Emerald': 6,
    'Latch': 7,
    'Kokio': 8,
    'Amari Razman': 9,
    'Ballestera': 10,
    'Remedie': 11
  });
});

test('Character Registry supports release order and newest-added order', async ({ page }) => {
  await page.goto(BASE + '/characters.html', { waitUntil: 'domcontentloaded' });

  await page.locator('#registrySort').selectOption('release');
  expect(await cardNames(page)).toEqual(RELEASE);

  await page.locator('#registrySort').selectOption('newest');
  expect(await cardNames(page)).toEqual(NEWEST);

  await page.locator('#registrySort').selectOption('alphabetical');
  expect(await cardNames(page)).toEqual(ALPHABETICAL);
});

test('Character Registry sorting stays active while filters are applied', async ({ page }) => {
  await page.goto(BASE + '/characters.html', { waitUntil: 'domcontentloaded' });

  await page.locator('#registrySort').selectOption('newest');
  await page.locator('#filterToggle').click();
  await page.locator('[data-filter-group="role"][value="hero"]').check();
  await page.locator('#filterApply').click();

  await expect(page.locator('#registrySort')).toHaveValue('newest');
  expect(await cardNames(page, true)).toEqual(['Amari Razman', 'Kokio', 'Latch', 'Kincast', 'Aftermark', 'Commotion', 'Gila Monster']);

  await page.locator('#registrySort').selectOption('release');
  expect(await cardNames(page, true)).toEqual(['Gila Monster', 'Commotion', 'Aftermark', 'Kincast', 'Latch', 'Kokio', 'Amari Razman']);
});

test('Character Registry sort controls remain phone-safe', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE + '/characters.html', { waitUntil: 'domcontentloaded' });

  const dims = await page.evaluate(() => {
    const sort = document.querySelector('.registry-sort').getBoundingClientRect();
    const row = document.querySelector('.registry-control-row').getBoundingClientRect();
    return {
      viewport: innerWidth,
      html: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
      sortWidth: sort.width,
      rowWidth: row.width
    };
  });

  expect(dims.html).toBeLessThanOrEqual(dims.viewport + 2);
  expect(dims.body).toBeLessThanOrEqual(dims.viewport + 2);
  expect(dims.sortWidth).toBeLessThanOrEqual(dims.viewport);
  expect(dims.rowWidth).toBeLessThanOrEqual(dims.viewport);
});


test('Amari’s approved portrait keeps her face in frame across desktop and phone registry cards', async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(BASE + '/characters.html', { waitUntil: 'domcontentloaded' });
    const image = page.locator('.character-thumb.amari-thumb');
    await expect(image).toBeVisible();
    await expect(image).toHaveAttribute('src', 'assets/characters/amari-razman/amari-registry.webp');
    await expect.poll(() => image.evaluate(img => img.naturalWidth)).toBeGreaterThan(0);
    const position = await image.evaluate(img => ({
      position: getComputedStyle(img).objectPosition,
      fit: getComputedStyle(img).objectFit
    }));
    expect(position.position).toBe('50% 0%');
    expect(position.fit).toBe('cover');
  }
});
