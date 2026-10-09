const { test, expect } = require('@playwright/test');
const fs = require('fs');
const BASE='http://127.0.0.1:8000';
const dossiers=[
  ['gila-monster','GILA MONSTER'],
  ['commotion','COMMOTION'],
  ['aftermark','AFTERMARK'],
  ['kincast','KINCAST'],
  ['anchorage','ANCHORAGE'],
  ['agent-emerald','AGENT EMERALD'],
  ['latch','LATCH'],
  ['kokio','KOKIO']
];

test('all eight canonical dossiers gain cinematic chapters, original art and OPI inspector', async ({ page }) => {
  const pageErrors=[];
  page.on('pageerror', err=>pageErrors.push(err.message));
  for(const [slug,heading] of dossiers){
    await page.goto(BASE+'/characters/'+slug+'/',{waitUntil:'domcontentloaded'});
    const shell=page.locator('main.character-shell');
    await expect(shell).toHaveAttribute('data-dossier',slug);
    await expect(shell.locator('h1')).toHaveText(heading);
    await expect(shell.locator('.dossier-cinematic-hero')).toHaveCount(1);
    await expect(shell.locator('.dossier-cinematic-hero .character-identity')).toHaveCount(1);
    await expect(shell.locator('.dossier-cinematic-hero .character-feature-art')).toHaveCount(1);
    await expect(shell.locator('.dossier-chapter-index')).toHaveCount(1);
    await expect(shell.locator('.dossier-story-thread')).toHaveCount(1);
    expect(await shell.locator('.dossier-thread-stop').count(),slug).toBeGreaterThanOrEqual(3);
    const count=await shell.locator('.lore-column > .wiki-section').count();
    expect(count,slug).toBeGreaterThanOrEqual(6);
    await expect(shell.locator('.dossier-index-scroll a[href^="#chapter-"]')).toHaveCount(count);
    const first=page.locator('.dossier-index-scroll a[href="#chapter-01"]');
    await first.click();
    await expect(page).toHaveURL(/#chapter-01$/);
    await expect(page.locator('#chapter-01')).toHaveCount(1);
    await expect(shell.locator('.dpi-row .dpi-value')).toHaveCount(11);
    await expect(shell.locator('.dossier-opi-inspect')).toHaveCount(11);
    await shell.locator('.dossier-opi-inspect').first().click();
    await expect(shell.locator('.dossier-opi-readout')).toContainText('Strength');
    await expect(shell.locator('.dossier-art-archive')).toHaveCount(1);
    expect(await shell.locator('.dossier-art-tile').count(),slug).toBeGreaterThanOrEqual(2);
    await expect.poll(()=>shell.locator('.character-feature-art-trigger img').evaluate(img=>img.naturalWidth)).toBeGreaterThan(0);
  }
  expect(pageErrors).toEqual([]);
});

test('all eight dossiers preserve the authored profile, OPI baselines and source images', async () => {
  for(const [slug] of dossiers){
    const source=fs.readFileSync('characters/'+slug+'/index.html','utf8');
    expect(source).toContain('character.css?v=26');
    expect(source).toContain('dossier-experience.css?v=3');
    expect(source).toContain('dossier-experience.js?v=3');
    expect(source).toContain('class="dossier-grid"');
    expect(source).toContain('class="character-network"');
    expect(source).toContain('class="character-feature-art-trigger"');
    expect((source.match(/class="dpi-row"/g)||[]).length).toBe(11);
  }
});

test('every dossier keeps the cinematic hero and chapter controls within mobile viewport', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  for(const [slug] of dossiers){
    await page.goto(BASE+'/characters/'+slug+'/',{waitUntil:'domcontentloaded'});
    const width=await page.evaluate(()=>({viewport:innerWidth,
      document:document.documentElement.scrollWidth,body:document.body.scrollWidth}));
    expect(width.document,slug).toBeLessThanOrEqual(width.viewport+2);
    expect(width.body,slug).toBeLessThanOrEqual(width.viewport+2);
    await expect(page.locator('.dossier-hero-issue')).toBeVisible();
    await expect(page.locator('.dossier-chapter-index')).toBeVisible();
    await expect(page.locator('.dossier-art-archive')).toBeVisible();
  }
});

test('visual archive uses established image lightbox and returns focus on close', async ({ page }) => {
  await page.goto(BASE+'/characters/gila-monster/',{waitUntil:'domcontentloaded'});
  const tile=page.locator('.dossier-art-tile').first();
  await tile.click();
  await expect(page.locator('.image-lightbox')).toHaveClass(/open/);
  await page.keyboard.press('Escape');
  await expect(page.locator('.image-lightbox')).not.toHaveClass(/open/);
  await expect(tile).toBeFocused();
});

test('conditional OPI is an optional disclosed reading, never a changed baseline', async ({ page }) => {
  await page.goto(BASE+'/characters/gila-monster/',{waitUntil:'domcontentloaded'});
  const scores=await page.locator('.dpi-grid .dpi-value').allTextContents();
  expect(scores[5]).toBe('22.2');
  const conditional=page.locator('.conditional-box');
  await expect(conditional).toBeHidden();
  const toggle=page.locator('.dossier-condition-button');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded','true');
  await expect(conditional).toBeVisible();
  await expect(conditional).toContainText('Senses — Nocturnal: 31.7');
  expect(await page.locator('.dpi-grid .dpi-value').allTextContents()).toEqual(scores);
});
