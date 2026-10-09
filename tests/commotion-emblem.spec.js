const {test,expect}=require('@playwright/test');
const fs=require('fs');
const BASE='http://127.0.0.1:8000';
const MARK='assets/characters/commotion/commotion-emblem.svg?v=1';

test('Commotion dossier displays approved mask-and-dreadlock insignia',async({page})=>{
  await page.goto(BASE+'/characters/commotion/',{waitUntil:'domcontentloaded'});
  await expect(page.locator('h1')).toHaveText('COMMOTION');
  await expect(page.locator('.logo-slot.has-logo .character-logo')).toHaveAttribute('src','../../'+MARK);
  await expect.poll(()=>page.locator('.character-logo').evaluate(img=>img.naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator('.character-feature-art img')).toHaveAttribute('src','../../assets/characters/commotion/commotion-primary.webp');
});

test('Commotion emblem appears in character registry, Start Here, and Chicago',async({page})=>{
  await page.goto(BASE+'/characters.html');
  const card=page.locator('.character-card[href="characters/commotion/"]');
  await expect(card.locator('.character-thumb')).toHaveAttribute('src','assets/characters/commotion/commotion-primary.webp');
  await expect(card.locator('.character-card-mark')).toHaveAttribute('src',MARK);
  await page.goto(BASE+'/start-here.html');
  await expect(page.locator('a[href="characters/commotion/"] .start-character-mark')).toHaveAttribute('src',MARK);
  await page.goto(BASE+'/locations/chicago/');
  await expect(page.locator('.known-character-card[href="../../characters/commotion/"] img')).toHaveAttribute('src','../../'+MARK);
});

test('Commotion mark is included in homepage and OPI character data',async({page})=>{
  await page.goto(BASE+'/');
  expect(await page.evaluate(()=>window.OLDROOT_HOME.characterSpotlights.Commotion.mark)).toBe(MARK);
  await page.goto(BASE+'/dpi.html');
  expect(await page.evaluate(()=>window.OLDROOT_CHARACTERS.find(c=>c.codename==='Commotion').mark)).toBe(MARK);
  await page.locator('#search').fill('Commotion');
  await expect(page.locator('.detail-mark')).toHaveAttribute('src',MARK);
});

test('Commotion emblem source stays transparent and fits phone viewport',async({page})=>{
  const svg=fs.readFileSync('assets/characters/commotion/commotion-emblem.svg','utf8');
  expect(svg).toContain('viewBox="0 0 720 720"');
  const data=svg.match(/data:image\/png;base64,([A-Za-z0-9+/=]+)/);
  expect(data).not.toBeNull();
  const bytes=Buffer.from(data[1],'base64');
  expect(bytes.subarray(0,8).toString('hex')).toBe('89504e470d0a1a0a');
  expect(bytes.readUInt32BE(16)).toBe(192);
  expect(bytes.readUInt32BE(20)).toBe(192);
  expect(bytes.includes(Buffer.from('tRNS'))).toBe(true);
  const response=await page.request.get(BASE+'/assets/characters/commotion/commotion-emblem.svg');
  expect(response.ok()).toBe(true);
  await page.setViewportSize({width:390,height:844});
  for(const path of ['/characters/commotion/','/characters.html','/start-here.html','/locations/chicago/','/dpi.html']){
    await page.goto(BASE+path);
    const dims=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
    expect(dims.scroll,path).toBeLessThanOrEqual(dims.width+2);
  }
});
