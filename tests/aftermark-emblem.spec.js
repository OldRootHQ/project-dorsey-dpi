const { test, expect } = require('@playwright/test');
const fs = require('fs');
const BASE = 'http://127.0.0.1:8000';
const MARK = 'assets/characters/aftermark/aftermark-emblem.svg?v=1';

test('Aftermark dossier displays the approved uploaded mask mark', async ({ page }) => {
  await page.goto(BASE + '/characters/aftermark/', {waitUntil:'domcontentloaded'});
  await expect(page.locator('h1')).toHaveText('AFTERMARK');
  await expect(page.locator('.logo-slot.has-logo .character-logo')).toHaveAttribute('src','../../' + MARK);
  await expect.poll(() => page.locator('.character-logo').evaluate(img => img.naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator('.character-feature-art img')).toHaveAttribute('src','../../assets/characters/aftermark/aftermark-location-cover.webp');
});

test('Aftermark emblem is visible in registry, Start Here, and San Juan', async ({ page }) => {
  await page.goto(BASE + '/characters.html');
  const card=page.locator('.character-card[href="characters/aftermark/"]');
  await expect(card.locator('.character-card-mark')).toHaveAttribute('src',MARK);
  await expect(card.locator('.character-thumb')).toHaveAttribute('src','assets/characters/aftermark/aftermark-opi-cover.webp');
  await page.goto(BASE + '/start-here.html');
  await expect(page.locator('a[href="characters/aftermark/"] .start-character-mark')).toHaveAttribute('src',MARK);
  await page.goto(BASE + '/locations/san-juan/');
  await expect(page.locator('.known-character-card[href="../../characters/aftermark/"] img')).toHaveAttribute('src','../../' + MARK);
});

test('Aftermark emblem carries to spotlight and OPI detail', async ({ page }) => {
  await page.goto(BASE + '/');
  expect(await page.evaluate(()=>window.OLDROOT_HOME.characterSpotlights.Aftermark.mark)).toBe(MARK);
  await page.goto(BASE + '/dpi.html');
  expect(await page.evaluate(()=>window.OLDROOT_CHARACTERS.find(c=>c.codename==='Aftermark').mark)).toBe(MARK);
  await page.locator('#search').fill('Aftermark');
  await expect(page.locator('.detail-mark')).toHaveAttribute('src',MARK);
});

test('Aftermark emblem is a real transparent embedded web image', async ({page}) => {
  const svg=fs.readFileSync('assets/characters/aftermark/aftermark-emblem.svg','utf8');
  expect(svg).toContain('viewBox="0 0 720 720"');
  expect(svg).not.toContain('<rect');
  const b64=svg.match(/data:image\/webp;base64,([A-Za-z0-9+/=]+)/);
  expect(b64).not.toBeNull();
  const webp=Buffer.from(b64[1],'base64');
  expect(webp.toString('ascii',0,4)).toBe('RIFF');
  expect(webp.toString('ascii',8,12)).toBe('WEBP');
  expect(webp.includes(Buffer.from('ALPH'))).toBe(true);
  const result=await page.request.get(BASE+'/assets/characters/aftermark/aftermark-emblem.svg');
  expect(result.ok()).toBe(true);
  await page.setViewportSize({width:390,height:844});
  await page.goto(BASE+'/characters/aftermark/');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(392);
});
