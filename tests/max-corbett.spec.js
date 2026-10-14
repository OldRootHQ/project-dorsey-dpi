const { test, expect } = require('@playwright/test');
const fs = require('fs');
const BASE = 'http://127.0.0.1:8000';

test('Max Corbett is a discoverable supporting character with no emblem', async ({ page }) => {
  await page.goto(BASE + '/characters.html', { waitUntil: 'domcontentloaded' });
  const card = page.locator('.character-card[href="characters/max-corbett/"]');
  await expect(card).toHaveCount(1);
  await expect(card).toHaveAttribute('data-release-order', '13');
  await expect(card).toContainText('Supporting Character');
  await expect(card).toContainText('No OPI Rating');
  await expect(card.locator('img.character-card-mark')).toHaveCount(0);
  await expect(card.locator('img.max-corbett-thumb')).toHaveAttribute('src','assets/characters/max-corbett/max-registry.webp');
  await expect.poll(()=>card.locator('img.max-corbett-thumb').evaluate(el=>el.complete&&el.naturalWidth>0)).toBe(true);
  await page.locator('#filterToggle').click();
  await page.locator('[data-filter-group="role"][value="support"]').check();
  await page.locator('#filterApply').click();
  await expect(card).toBeVisible();
  await expect(page.locator('.character-card:visible')).toHaveCount(2);
});

test("Max's dossier uses civilian biography, grounded engineering and no fabricated OPI", async ({ page }) => {
  await page.goto(BASE + '/characters/max-corbett/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('h1')).toHaveText('MAX CORBETT');
  await expect(page.locator('.character-kicker')).toContainText('SUPPORTING CHARACTER');
  await expect(page.locator('.character-infobox')).toContainText('31');
  await expect(page.locator('.character-infobox')).toContainText('Not rated');
  await expect(page.locator('.character-infobox')).toContainText('None');
  await expect(page.locator('.character-logo, .logo-slot')).toHaveCount(0);
  const feature=page.locator('.character-feature-art img');
  await expect(feature).toHaveAttribute('src','../../assets/characters/max-corbett/max-registry.webp');
  await expect.poll(()=>feature.evaluate(el=>el.complete&&el.naturalWidth>0)).toBe(true);
  const artwork=['max-workbench.webp','max-diagnostics.webp','max-rooftop.webp','max-night-workshop.webp'];
  for(const name of artwork){
    const image=page.locator('.max-gallery-grid img[src$="'+name+'"]');
    await expect(image).toHaveCount(1);
    const response=await page.request.get(BASE+'/assets/characters/max-corbett/'+name);
    expect(response.ok(),name).toBe(true);
    expect(Number(response.headers()['content-length']||0),name).toBeGreaterThan(60000);
  }
  await expect(page.locator('.max-gallery-grid button[data-lightbox]')).toHaveCount(4);
  await expect(page.locator('.character-network a[href="../remedie/"]')).toHaveCount(1);
  expect(fs.readFileSync('data.js','utf8')).not.toContain('codename:"Max Corbett"');
});

test('Max is connected in Start Here and Remedie dossier', async ({ page }) => {
  await page.goto(BASE + '/start-here.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('a.discovery-card[href="characters/max-corbett/"]')).toHaveCount(1);
  await expect(page.locator('.start-stat-panel')).toContainText('14 active records');
  await page.goto(BASE + '/characters/remedie/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('a[href="../max-corbett/"]')).not.toHaveCount(0);
  expect(fs.readFileSync('sitemap.xml','utf8')).toContain('/characters/max-corbett/');
});

test("Max's dossier, registry and public entry are phone-width safe", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/characters/max-corbett/','/characters.html','/start-here.html']) {
    await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth), path).toBeLessThanOrEqual(392);
  }
});
