const {test,expect}=require('@playwright/test');
const fs=require('fs');
const crypto=require('crypto');
const BASE='http://127.0.0.1:8000';
const MARK='assets/characters/kokio/kokio-emblem.svg?v=1';

test('Kokio emblem preserves the approved transparent hibiscus and glyph-marked hatchets artwork',async({page})=>{
  const svg=fs.readFileSync('assets/characters/kokio/kokio-emblem.svg','utf8');
  expect(svg).toContain('viewBox="0 0 720 720"');
  expect(svg).toContain('Kokio official emblem');
  expect(svg).toContain('white hibiscus');
  const m=svg.match(/data:image\/png;base64,([A-Za-z0-9+/=]+)/);
  expect(m).not.toBeNull();
  const bytes=Buffer.from(m[1],'base64');
  expect(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))).toBe(true);
  expect(bytes.includes(Buffer.from('tRNS'))).toBe(true);
  expect(bytes.length).toBe(8325);
  expect(crypto.createHash('sha256').update(bytes).digest('hex')).toBe('eb6c140300951176e03db874eed9f5851319ff7c576a15c7e2e11dcba82073e8');
  const response=await page.request.get(BASE+'/assets/characters/kokio/kokio-emblem.svg');
  expect(response.ok()).toBe(true);
});

test('Kokio dossier shows the character mark and keeps all existing combat artwork',async({page})=>{
  await page.goto(BASE+'/characters/kokio/',{waitUntil:'domcontentloaded'});
  const emblem=page.locator('.logo-slot.has-logo .character-logo');
  await expect(emblem).toHaveAttribute('src','../../'+MARK);
  await expect.poll(()=>emblem.evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
  await expect(page.locator('.character-feature-art img')).toHaveAttribute('src','../../assets/characters/kokio/kokio-combat-01.webp');
  await expect(page.locator('.character-infobox img')).toHaveAttribute('src','../../assets/characters/kokio/kokio-combat-07.webp');
  await expect(page.locator('.info-row').filter({hasText:'Official emblem'})).toContainText('Crossed ritual hatchets');
});

test('Kokio registry mark sits beside name below portrait, never over image',async({page})=>{
  await page.goto(BASE+'/characters.html',{waitUntil:'domcontentloaded'});
  const card=page.locator('.character-card[href="characters/kokio/"]');
  await expect(card.locator('.character-card-mark')).toHaveAttribute('src',MARK);
  await expect(card.locator('.character-thumb')).toHaveAttribute('src','assets/characters/kokio/kokio-casual.webp');
  const placement=await card.evaluate(node=>{
    const picture=node.querySelector('.character-thumb').getBoundingClientRect();
    const copy=node.querySelector('.character-identity-copy').getBoundingClientRect();
    const mark=node.querySelector('.character-card-mark');
    const badge=mark.getBoundingClientRect();
    return {below:badge.top>=picture.bottom+1,beside:badge.left>=copy.right-1,static:getComputedStyle(mark).position==='static'};
  });
  expect(placement).toEqual({below:true,beside:true,static:true});
});

test('Kokio emblem propagates to Start Here, Hilo, homepage spotlight, and OPI Analytics',async({page})=>{
  await page.goto(BASE+'/start-here.html',{waitUntil:'domcontentloaded'});
  await expect(page.locator('a[href="characters/kokio/"] .start-character-mark')).toHaveAttribute('src',MARK);
  await page.goto(BASE+'/locations/hilo/',{waitUntil:'domcontentloaded'});
  await expect(page.locator('.known-character-card[href="../../characters/kokio/"] img')).toHaveAttribute('src','../../'+MARK);
  await page.goto(BASE+'/',{waitUntil:'domcontentloaded'});
  expect(await page.evaluate(()=>window.OLDROOT_HOME.characterSpotlights.Kokio.mark)).toBe(MARK);
  await page.goto(BASE+'/dpi.html',{waitUntil:'domcontentloaded'});
  const record=await page.evaluate(()=>window.OLDROOT_CHARACTERS.find(c=>c.codename==='Kokio'));
  expect(record.mark).toBe(MARK);
  expect(record).not.toHaveProperty('officialOPI');
  await page.locator('#search').fill('Kokio');
  await expect(page.locator('.detail-mark')).toHaveAttribute('src',MARK);
});

test('Kokio emblem stays fully contained across core phone-width pages',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  for(const url of ['/characters.html','/characters/kokio/','/start-here.html','/locations/hilo/','/dpi.html']){
    await page.goto(BASE+url,{waitUntil:'domcontentloaded'});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth),url).toBeLessThanOrEqual(392);
  }
});
