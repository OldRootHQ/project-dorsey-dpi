const {test,expect}=require('@playwright/test');
const fs=require('fs');
const BASE='http://127.0.0.1:8000';
const MARK='assets/characters/agent-emerald/agent-emerald-emblem.svg?v=1';
const ROOT='/assets/characters/agent-emerald/';

test('Agent Emerald dossier renders the approved visor and twin Vector Talons emblem',async({page})=>{
  await page.goto(BASE+'/characters/agent-emerald/',{waitUntil:'domcontentloaded'});
  await expect(page.locator('h1')).toHaveText('AGENT EMERALD');
  const emblem=page.locator('.logo-slot.has-logo .character-logo');
  await expect(emblem).toHaveAttribute('src','../../'+MARK);
  await expect.poll(()=>emblem.evaluate(img=>img.naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator('.character-feature-art img')).toHaveAttribute('src','../../assets/characters/agent-emerald/agent-emerald-primary.webp');
  await expect(page.locator('.character-infobox img')).toHaveAttribute('src','../../assets/characters/agent-emerald/agent-emerald-registry.webp');
});

test('Agent Emerald emblem propagates without replacing artwork, including Seattle and Dunamis Dynamics',async({page})=>{
  await page.goto(BASE+'/characters.html',{waitUntil:'domcontentloaded'});
  const card=page.locator('.character-card[href="characters/agent-emerald/"]');
  await expect(card.locator('.character-card-mark')).toHaveAttribute('src',MARK);
  await expect(card.locator('.character-thumb')).toHaveAttribute('src','assets/characters/agent-emerald/agent-emerald-registry.webp');
  await expect(card.locator('.character-identity-row')).toHaveCount(1);
  const placement=await card.evaluate(card=>{
    const photo=card.querySelector('.character-thumb').getBoundingClientRect();
    const identity=card.querySelector('.character-identity-copy').getBoundingClientRect();
    const mark=card.querySelector('.character-card-mark');
    const badge=mark.getBoundingClientRect();
    return {belowPortrait:badge.top>=photo.bottom+1,rightOfText:badge.left>=identity.right-1,
       static:getComputedStyle(mark).position==='static'};
  });
  expect(placement).toEqual({belowPortrait:true,rightOfText:true,static:true});
  await page.goto(BASE+'/start-here.html',{waitUntil:'domcontentloaded'});
  await expect(page.locator('a[href="characters/agent-emerald/"] .start-character-mark')).toHaveAttribute('src',MARK);
  for(const url of ['/locations/seattle/','/organizations/dunamis-dynamics/']){
    await page.goto(BASE+url,{waitUntil:'domcontentloaded'});
    await expect(page.locator('.known-character-card[href="../../characters/agent-emerald/"] img')).toHaveAttribute('src','../../'+MARK);
  }
});

test('Agent Emerald emblem is provided by homepage and OPI Analytics with original photos unchanged',async({page})=>{
  await page.goto(BASE+'/',{waitUntil:'domcontentloaded'});
  expect(await page.evaluate(()=>window.OLDROOT_HOME.characterSpotlights['Agent Emerald'].mark)).toBe(MARK);
  expect(await page.evaluate(()=>window.OLDROOT_HOME.characterSpotlights['Agent Emerald'].image)).toBe('assets/characters/agent-emerald/agent-emerald-featured.webp');
  await page.goto(BASE+'/dpi.html',{waitUntil:'domcontentloaded'});
  expect(await page.evaluate(()=>window.OLDROOT_CHARACTERS.find(c=>c.codename==='Agent Emerald').mark)).toBe(MARK);
  await page.locator('#search').fill('Agent Emerald');
  await expect(page.locator('.detail-mark')).toHaveAttribute('src',MARK);
  await expect(page.locator('.detail-portrait')).toHaveAttribute('src','assets/characters/agent-emerald/agent-emerald-registry.webp');
});

test('the approved transparent emblem is a valid, available WebP image embedded in SVG',async({page})=>{
  const svg=fs.readFileSync('assets/characters/agent-emerald/agent-emerald-emblem.svg','utf8');
  expect(svg).toContain('viewBox="0 0 720 720"');
  expect(svg).toContain('Vector Talons');
  const match=svg.match(/data:image\/webp;base64,([A-Za-z0-9+/=]+)/);
  expect(match).not.toBeNull();
  const bytes=Buffer.from(match[1],'base64');
  expect(bytes.toString('ascii',0,4)).toBe('RIFF');
  expect(bytes.toString('ascii',8,12)).toBe('WEBP');
  expect(bytes.includes(Buffer.from('ALPH'))).toBe(true);
  expect(bytes.length).toBe(8748);
  const res=await page.request.get(BASE+ROOT+'agent-emerald-emblem.svg');
  expect(res.ok()).toBe(true);
  await page.goto(BASE+'/characters/agent-emerald/',{waitUntil:'domcontentloaded'});
  await expect.poll(()=>page.locator('.character-logo').evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
});

test('Agent Emerald emblem and neighboring pages remain within narrow mobile viewport',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  for(const path of ['/characters.html','/characters/agent-emerald/','/start-here.html','/locations/seattle/','/organizations/dunamis-dynamics/','/dpi.html']){
    await page.goto(BASE+path,{waitUntil:'domcontentloaded'});
    const scroll=await page.evaluate(()=>document.documentElement.scrollWidth);
    expect(scroll,path).toBeLessThanOrEqual(392);
  }
});
