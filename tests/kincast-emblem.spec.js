const {test,expect}=require('@playwright/test');
const fs=require('fs');
const BASE='http://127.0.0.1:8000';
const MARK='assets/characters/kincast/kincast-emblem.svg?v=1';

test('Kincast dossier uses creator-approved Micah and Naomi emblem without changing art', async({page})=>{
  await page.goto(BASE+'/characters/kincast/',{waitUntil:'domcontentloaded'});
  await expect(page.locator('h1')).toHaveText('KINCAST');
  const emblem=page.locator('.logo-slot.has-logo .character-logo');
  await expect(emblem).toHaveAttribute('src','../../'+MARK);
  await expect.poll(()=>emblem.evaluate(img=>img.naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator('.character-feature-art img')).toHaveAttribute('src','../../assets/characters/kincast/kincast-primary.webp');
  await expect(page.locator('.character-infobox img')).toHaveAttribute('src','../../assets/characters/kincast/kincast-registry.webp');
});

test('Kincast emblem is used in registry, Baltimore, Start Here and OPI',async({page})=>{
  await page.goto(BASE+'/characters.html');
  const card=page.locator('.character-card[href="characters/kincast/"]');
  await expect(card.locator('.character-card-mark')).toHaveAttribute('src',MARK);
  await expect(card.locator('.character-thumb')).toHaveAttribute('src','assets/characters/kincast/kincast-registry.webp');
  await page.goto(BASE+'/locations/baltimore/');
  await expect(page.locator('.known-character-card[href="../../characters/kincast/"] img')).toHaveAttribute('src','../../'+MARK);
  await page.goto(BASE+'/start-here.html');
  await expect(page.locator('a[href="characters/kincast/"] .start-character-mark')).toHaveAttribute('src',MARK);
  await page.goto(BASE+'/dpi.html');
  expect(await page.evaluate(()=>window.OLDROOT_CHARACTERS.find(c=>c.codename==='Kincast').mark)).toBe(MARK);
  await page.locator('#search').fill('Kincast');
  await expect(page.locator('.detail-mark')).toHaveAttribute('src',MARK);
  await expect(page.locator('.detail-portrait')).toHaveAttribute('src','assets/characters/kincast/kincast-registry.webp');
  await page.goto(BASE+'/');
  expect(await page.evaluate(()=>window.OLDROOT_HOME.characterSpotlights.Kincast.mark)).toBe(MARK);
});

test('approved Kincast image is alpha-transparent, loadable and mobile-safe',async({page})=>{
  const svg=fs.readFileSync('assets/characters/kincast/kincast-emblem.svg','utf8');
  expect(svg).toContain('viewBox="0 0 720 720"');
  expect(svg).toContain('Micah Ellison');
  expect(svg).toContain('Naomi');
  const match=svg.match(/data:image\/webp;base64,([A-Za-z0-9+/=]+)/);
  expect(match).not.toBeNull();
  const bytes=Buffer.from(match[1],'base64');
  expect(bytes.toString('ascii',0,4)).toBe('RIFF');
  expect(bytes.toString('ascii',8,12)).toBe('WEBP');
  expect(bytes.includes(Buffer.from('ALPH'))).toBe(true);
  expect((await page.request.get(BASE+'/assets/characters/kincast/kincast-emblem.svg')).ok()).toBe(true);
  await page.setViewportSize({width:390,height:844});
  for(const path of ['/characters.html','/characters/kincast/','/start-here.html','/locations/baltimore/','/dpi.html']){
    await page.goto(BASE+path,{waitUntil:'domcontentloaded'});
    const scroll=await page.evaluate(()=>document.documentElement.scrollWidth);
    expect(scroll,path).toBeLessThanOrEqual(392);
  }
});
