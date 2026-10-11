const {test,expect}=require('@playwright/test');
const fs=require('fs');
const crypto=require('crypto');
const BASE='http://127.0.0.1:8000';
const MARK='assets/characters/ballestera/ballestera-emblem.svg?v=1';
const EXPECTED_SHA='7c5c41be29f6f050b2a720621258caf4a24cdb7fcf79ceff46aa187e0e884cbd';

test('Ballestera approved transparent emblem survives transfer unchanged',async({page})=>{
 const svg=fs.readFileSync('assets/characters/ballestera/ballestera-emblem.svg','utf8');
 expect(svg).toContain('viewBox="0 0 720 720"');
 expect(svg).toContain('Ballestera official character emblem');
 const m=svg.match(/data:image\/webp;base64,([A-Za-z0-9+/=]+)/);
 expect(m).not.toBeNull();
 const bytes=Buffer.from(m[1],'base64');
 expect(bytes.toString('ascii',0,4)).toBe('RIFF');
 expect(bytes.toString('ascii',8,12)).toBe('WEBP');
 expect(bytes.includes(Buffer.from('ALPH'))).toBe(true);
 expect(bytes.length).toBe(180624);
 expect(crypto.createHash('sha256').update(bytes).digest('hex')).toBe(EXPECTED_SHA);
 const response=await page.request.get(BASE+'/assets/characters/ballestera/ballestera-emblem.svg');
 expect(response.ok()).toBe(true);
});

test('Ballestera dossier mark loads and existing cinematic images stay untouched',async({page})=>{
 await page.goto(BASE+'/characters/ballestera/',{waitUntil:'domcontentloaded'});
 const mark=page.locator('.logo-slot.has-logo .character-logo');
 await expect(mark).toHaveAttribute('src','../../'+MARK);
 await expect.poll(()=>mark.evaluate(el=>el.complete&&el.naturalWidth>0)).toBe(true);
 await expect(page.locator('.character-feature-art img')).toHaveAttribute('src','../../assets/characters/ballestera/ballestera-featured.webp');
 await expect(page.locator('.character-infobox img')).toHaveAttribute('src','../../assets/characters/ballestera/ballestera-registry.webp');
 await expect(page.locator('.dossier-illustration img')).toHaveCount(6);
});

test('Ballestera registry emblem stays below portrait beside identity text on desktop and mobile',async({page})=>{
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  await page.setViewportSize(viewport);
  await page.goto(BASE+'/characters.html',{waitUntil:'domcontentloaded'});
  const card=page.locator('.character-card[href="characters/ballestera/"]');
  await expect(card.locator('.character-card-mark')).toHaveAttribute('src',MARK);
  await expect(card.locator('.character-thumb')).toHaveAttribute('src','assets/characters/ballestera/ballestera-registry.webp');
  const placement=await card.evaluate(card=>{
   const cover=card.querySelector('.character-thumb').getBoundingClientRect();
   const copy=card.querySelector('.character-identity-copy').getBoundingClientRect();
   const mark=card.querySelector('.character-card-mark');
   const badge=mark.getBoundingClientRect();
   return {below:badge.top>=cover.bottom+1,beside:badge.left>=copy.right-1,static:getComputedStyle(mark).position==='static'};
  });
  expect(placement).toEqual({below:true,beside:true,static:true});
 }
});

test('Ballestera emblem reaches Start Here, homepage spotlight and OPI without creating a combined rating',async({page})=>{
 await page.goto(BASE+'/start-here.html',{waitUntil:'domcontentloaded'});
 await expect(page.locator('a[href="characters/ballestera/"] .start-character-mark')).toHaveAttribute('src',MARK);
 await page.goto(BASE+'/',{waitUntil:'domcontentloaded'});
 expect(await page.evaluate(()=>window.OLDROOT_HOME.characterSpotlights.Ballestera.mark)).toBe(MARK);
 await page.goto(BASE+'/dpi.html',{waitUntil:'domcontentloaded'});
 const record=await page.evaluate(()=>window.OLDROOT_CHARACTERS.find(x=>x.codename==='Ballestera'));
 expect(record.mark).toBe(MARK);
 expect(record.suppressAggregate).toBe(true);
 expect(record.officialOPI).toBeNull();
 expect(Object.keys(record.baseline)).toHaveLength(11);
 await page.locator('#search').fill('Ballestera');
 await expect(page.locator('.detail-mark')).toHaveAttribute('src',MARK);
});

test('Ballestera screens retain safe phone-width layouts',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 for(const path of ['/characters/ballestera/','/characters.html','/start-here.html','/dpi.html']){
  await page.goto(BASE+path,{waitUntil:'domcontentloaded'});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth),path).toBeLessThanOrEqual(392);
 }
});
