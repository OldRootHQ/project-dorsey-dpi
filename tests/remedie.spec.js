const { test, expect } = require('@playwright/test');

const BASE = 'http://127.0.0.1:8000';

test('Remedie is a published Boston anti-hero with exact Prime categories', async ({ page }) => {
  await page.goto(BASE + '/dpi.html', { waitUntil: 'networkidle' });
  const record = await page.evaluate(() => window.OLDROOT_CHARACTERS.find(c => c.codename === 'Remedie'));
  expect(record).toBeTruthy();
  expect(record.civilian).toBe('Mandy Ledger');
  expect(record.age).toBe(28);
  expect(record.location).toBe('Boston, Massachusetts');
  expect(record.classification).toBe('Anti-Hero');
  expect(record.originType).toBe('Human / Technology');
  expect(record).not.toHaveProperty('ascendantStatus');
  expect(record).not.toHaveProperty('powerClass');
  expect(record.baseline).toEqual({
    Strength:16.4,Durability:14.7,Speed:12.3,Agility:12.5,Regeneration:5.2,
    Senses:19.4,Offense:21.6,Intellect:9.4,Combat:14.8,Mobility:17.9,Stamina:10.8
  });
  expect(record.officialOPI).toBeUndefined();
  await expect(page.locator('#count')).toHaveText('11 CHARACTERS');
});

test('Remedie has a full cinematic story, accurate power constraints and seven approved images', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(BASE + '/characters/remedie/', { waitUntil: 'networkidle' });
  const shell = page.locator('main.character-shell');
  await expect(shell).toHaveAttribute('data-dossier', 'remedie');
  await expect(shell.locator('h1')).toHaveText('REMEDIE');
  await expect(shell.locator('.dossier-cinematic-hero')).toHaveCount(1);
  await expect(shell.locator('.dossier-chapter-index')).toHaveCount(1);
  await expect(shell.locator('.dossier-story-thread')).toHaveCount(1);
  expect(await shell.locator('.dossier-thread-stop').count()).toBeGreaterThanOrEqual(5);
  expect(await shell.locator('.lore-column > .wiki-section').count()).toBeGreaterThanOrEqual(23);
  await expect(shell.locator('.dpi-row .dpi-value')).toHaveCount(11);
  await expect(shell.locator('.dossier-opi-inspect')).toHaveCount(11);
  await expect(shell.locator('.dossier-art-gallery .dossier-illustration')).toHaveCount(7);
  await expect(shell).toContainText('Gary Sodd');
  await expect(shell).toContainText('George Ledger');
  await expect(shell).toContainText('Counter-Punch');
  await expect(shell).toContainText('Counter-Combo');
  await expect(shell).toContainText('20 cumulative seconds');
  await expect(shell).toContainText('19.4 Senses');
  await expect(shell).toContainText('not combat autopilot');
  await expect(shell.locator('.logo-slot.has-logo .character-logo')).toHaveAttribute('src','../../'+ 'assets/characters/remedie/remedie-emblem.svg?v=1' +'');
  const imgs = shell.locator('img[src*="assets/characters/remedie/"]');
  expect(await imgs.count()).toBeGreaterThanOrEqual(9);
  const broken = await imgs.evaluateAll(elements => elements.filter(img => !img.complete || img.naturalWidth <= 0).map(img => img.src));
  expect(broken, 'all approved illustrations must be installed before publication').toEqual([]);
  expect(errors).toEqual([]);
});

test('Remedie registry is discoverable under the anti-hero filter but not future Hero status', async ({page}) => {
  await page.goto(BASE + '/characters.html', {waitUntil:'domcontentloaded'});
  await expect(page.locator('.character-card')).toHaveCount(12);
  await expect(page.locator('.character-card').filter({hasText:'Remedie'})).toHaveCount(1);
  await page.locator('#filterToggle').click();
  await page.locator('[data-filter-group="role"][value="anti-hero"]').check();
  await page.locator('#filterApply').click();
  await expect(page.locator('.character-card:visible h3')).toHaveText(['Remedie']);
});

test('Remedie dossier fits narrow mobile screens and preserves original artwork', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto(BASE + '/characters/remedie/', {waitUntil:'networkidle'});
  const dims=await page.evaluate(()=>({
    viewport:innerWidth,
    doc:document.documentElement.scrollWidth,
    body:document.body.scrollWidth
  }));
  expect(dims.doc).toBeLessThanOrEqual(dims.viewport+2);
  expect(dims.body).toBeLessThanOrEqual(dims.viewport+2);
  await expect(page.locator('.dossier-chapter-index')).toBeVisible();
  await expect(page.locator('.dossier-art-archive')).toBeVisible();
  await expect(page.locator('.character-feature-art img')).toBeVisible();
});
