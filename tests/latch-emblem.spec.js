const {test,expect}=require('@playwright/test');
const fs=require('fs');
const crypto=require('crypto');
const BASE='http://127.0.0.1:8000';
const MARK='assets/characters/latch/latch-emblem.svg?v=1';

test('Latch official emblem is the approved alpha-transparent image',async({page})=>{
  const svg=fs.readFileSync('assets/characters/latch/latch-emblem.svg','utf8');
  expect(svg).toContain('viewBox="0 0 720 720"');
  expect(svg).toContain('Latch emblem');
  const m=svg.match(/data:image\/webp;base64,([A-Za-z0-9+/=]+)/);
  expect(m).not.toBeNull();
  const image=Buffer.from(m[1],'base64');
  expect(image.toString('ascii',0,4)).toBe('RIFF');
  expect(image.toString('ascii',8,12)).toBe('WEBP');
  expect(image.includes(Buffer.from('ALPH'))).toBe(true);
  expect(crypto.createHash('sha256').update(image).digest('hex')).toBe('5d3ed6e62dce26aa788b5727bf86c772e641eb196c22030790768446e62e75c4');
  const response=await page.request.get(BASE+'/assets/characters/latch/latch-emblem.svg');
  expect(response.ok()).toBe(true);
});

test('Latch dossier displays emblem, without replacing established cover art',async({page})=>{
  await page.goto(BASE+'/characters/latch/',{waitUntil:'domcontentloaded'});
  const mark=page.locator('.logo-slot.has-logo .character-logo');
  await expect(mark).toHaveAttribute('src','../../'+MARK);
  await expect.poll(()=>mark.evaluate(el=>el.complete&&el.naturalWidth>0)).toBe(true);
  await expect(page.locator('.character-feature-art img')).toHaveAttribute('src','../../assets/characters/latch/latch-header.webp');
});

test('Latch registry emblem stays below artwork beside identity copy',async({page})=>{
  await page.goto(BASE+'/characters.html',{waitUntil:'domcontentloaded'});
  const card=page.locator('.character-card[href="characters/latch/"]');
  await expect(card.locator('.character-card-mark')).toHaveAttribute('src',MARK);
  await expect(card.locator('.character-thumb')).toHaveAttribute('src','assets/characters/latch/latch-registry.webp');
  const metrics=await card.evaluate(card=>{
    const picture=card.querySelector('.character-thumb').getBoundingClientRect();
    const copy=card.querySelector('.character-identity-copy').getBoundingClientRect();
    const badge=card.querySelector('.character-card-mark');
    const b=badge.getBoundingClientRect();
    return {below:b.top>=picture.bottom+1,beside:b.left>=copy.right-1,static:getComputedStyle(badge).position==='static'};
  });
  expect(metrics).toEqual({below:true,beside:true,static:true});
});

test('Latch mark propagates to Start Here, homepage and OPI Analytics',async({page})=>{
  await page.goto(BASE+'/start-here.html',{waitUntil:'domcontentloaded'});
  await expect(page.locator('a[href="characters/latch/"] .start-character-mark')).toHaveAttribute('src',MARK);
  await page.goto(BASE+'/',{waitUntil:'domcontentloaded'});
  expect(await page.evaluate(()=>window.OLDROOT_HOME.characterSpotlights.Latch.mark)).toBe(MARK);
  await page.goto(BASE+'/dpi.html',{waitUntil:'domcontentloaded'});
  const profile=await page.evaluate(()=>window.OLDROOT_CHARACTERS.find(c=>c.codename==='Latch'));
  expect(profile.mark).toBe(MARK);
  expect(profile.officialOPI).toBe(10.15);
  await page.locator('#search').fill('Latch');
  await expect(page.locator('.detail-mark')).toHaveAttribute('src',MARK);
});

test('Latch emblem layouts remain contained on phone screens',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  for(const url of ['/characters.html','/characters/latch/','/start-here.html','/dpi.html']){
    await page.goto(BASE+url,{waitUntil:'domcontentloaded'});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth),url).toBeLessThanOrEqual(392);
  }
});
