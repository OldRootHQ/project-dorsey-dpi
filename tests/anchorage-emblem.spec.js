const {test,expect}=require('@playwright/test');
const fs=require('fs');
const BASE='http://127.0.0.1:8000';
const MARK='assets/characters/anchorage/anchorage-emblem.svg?v=1';

test('Anchorage dossier uses the creator-approved blue and ivory emblem',async({page})=>{
  await page.goto(BASE+'/characters/anchorage/',{waitUntil:'domcontentloaded'});
  await expect(page.locator('h1')).toHaveText('ANCHORAGE');
  await expect(page.locator('.logo-slot.has-logo .character-logo')).toHaveAttribute('src','../../'+MARK);
  await expect.poll(()=>page.locator('.character-logo').evaluate(img=>img.naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator('.character-feature-art img')).toHaveAttribute('src','../../assets/characters/anchorage/anchorage-primary.png');
  await expect(page.locator('.character-infobox img')).toHaveAttribute('src','../../assets/characters/anchorage/anchorage-registry.png');
});

test('Anchorage emblem propagates to registry, Start Here and Baltimore',async({page})=>{
  await page.goto(BASE+'/characters.html');
  const card=page.locator('.character-card[href="characters/anchorage/"]');
  await expect(card.locator('.character-card-mark')).toHaveAttribute('src',MARK);
  await expect(card.locator('.character-thumb')).toHaveAttribute('src','assets/characters/anchorage/anchorage-registry.png');
  await page.goto(BASE+'/start-here.html');
  await expect(page.locator('a[href="characters/anchorage/"] .start-character-mark')).toHaveAttribute('src',MARK);
  await page.goto(BASE+'/locations/baltimore/');
  await expect(page.locator('.known-character-card[href="../../characters/anchorage/"] img')).toHaveAttribute('src','../../'+MARK);
});

test('Anchorage emblem joins homepage spotlight and OPI Analytics',async({page})=>{
  await page.goto(BASE+'/');
  expect(await page.evaluate(()=>window.OLDROOT_HOME.characterSpotlights.Anchorage.mark)).toBe(MARK);
  await page.goto(BASE+'/dpi.html');
  expect(await page.evaluate(()=>window.OLDROOT_CHARACTERS.find(c=>c.codename==='Anchorage').mark)).toBe(MARK);
  await page.locator('#search').fill('Anchorage');
  await expect(page.locator('.detail-mark')).toHaveAttribute('src',MARK);
  await expect(page.locator('.detail-portrait')).toHaveAttribute('src','assets/characters/anchorage/anchorage-registry.png');
});

test('Anchorage emblem file is transparent and layouts fit mobile screens',async({page})=>{
  const svg=fs.readFileSync('assets/characters/anchorage/anchorage-emblem.svg','utf8');
  expect(svg).toContain('viewBox="0 0 720 720"');
  const match=svg.match(/data:image\/webp;base64,([A-Za-z0-9+/=]+)/);
  expect(match).not.toBeNull();
  const bytes=Buffer.from(match[1],'base64');
  expect(bytes.toString('ascii',0,4)).toBe('RIFF');
  expect(bytes.toString('ascii',8,12)).toBe('WEBP');
  expect(bytes.includes(Buffer.from('ALPH'))).toBe(true);
  const res=await page.request.get(BASE+'/assets/characters/anchorage/anchorage-emblem.svg');
  expect(res.ok()).toBe(true);
  await page.setViewportSize({width:390,height:844});
  for(const path of ['/characters/anchorage/','/characters.html','/start-here.html','/locations/baltimore/','/dpi.html']){
    await page.goto(BASE+path,{waitUntil:'domcontentloaded'});
    const dims=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
    expect(dims.scroll,path).toBeLessThanOrEqual(dims.width+2);
  }
});
