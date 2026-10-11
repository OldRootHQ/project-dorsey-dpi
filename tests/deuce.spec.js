const {test,expect}=require('@playwright/test');
const fs=require('fs');
const crypto=require('crypto');

const BASE='http://127.0.0.1:8000';
const images=[
 ['deuce-registry','0b4ada4b67867e9b95ed07f6937a371f53ed22a42b371bc093d1c99b4b413856'],
 ['deuce-hq-tray','15ac52d4a73aa780c2164751706e0c8a11acf9566f1e4184b61e02bd28dae7d2'],
 ['deuce-featured','3e1b650bce4fe5d0fd0d32c9584c4064cff2dcc767ca371c2304fadbad875f3e'],
 ['deuce-briefing','de3454be31030e10109348da360d940b1ecbd1734eb8ac7a9ff4594a741e350f'],
 ['deuce-support','1c0c765e922a7d6c90c37f40895b1ed3cabb5da8ab94f42025c5e0b77797906c']
];

test('all five creator-provided Deuce art assets survive optimized transparent-wrapper transfer',async({page})=>{
 for(const [name,expected] of images){
  const svg=fs.readFileSync('assets/characters/deuce/'+name+'.svg','utf8');
  const m=svg.match(/data:image\/webp;base64,([A-Za-z0-9+/=]+)/);
  expect(m,name).not.toBeNull();
  const buf=Buffer.from(m[1],'base64');
  expect(buf.toString('ascii',0,4)).toBe('RIFF');
  expect(buf.toString('ascii',8,12)).toBe('WEBP');
  expect(crypto.createHash('sha256').update(buf).digest('hex'),name).toBe(expected);
  const response=await page.request.get(BASE+'/assets/characters/deuce/'+name+'.svg');
  expect(response.ok(),name).toBe(true);
 }
});

test('approved Deuce emblem has transparent WebP data and renders on his dossier',async({page})=>{
 const MARK='assets/characters/deuce/deuce-emblem.svg?v=1';
 const svg=fs.readFileSync('assets/characters/deuce/deuce-emblem.svg','utf8');
 expect(svg).toContain('viewBox="0 0 720 720"');
 const match=svg.match(/data:image\/webp;base64,([A-Za-z0-9+/=]+)/);
 expect(match).not.toBeNull();
 const data=Buffer.from(match[1],'base64');
 expect(data.toString('ascii',0,4)).toBe('RIFF');
 expect(data.toString('ascii',8,12)).toBe('WEBP');
 expect(data.includes(Buffer.from('ALPH'))).toBe(true);
 expect(data.length).toBe(83780);
 expect(crypto.createHash('sha256').update(data).digest('hex')).toBe('00b4e6c318095de440b2eab9f9a81121a11c017a84076c2b37d16c2f4c71ca8e');
 await page.goto(BASE+'/characters/deuce/',{waitUntil:'domcontentloaded'});
 const emblem=page.locator('.logo-slot.has-logo .character-logo');
 await expect(emblem).toHaveAttribute('src','../../'+MARK);
 await expect.poll(()=>emblem.evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
});

test('Deuce registry and Start Here mark stay beneath portrait and beside name',async({page})=>{
 const MARK='assets/characters/deuce/deuce-emblem.svg?v=1';
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  await page.setViewportSize(viewport);
  await page.goto(BASE+'/characters.html',{waitUntil:'domcontentloaded'});
  const card=page.locator('.character-card[href="characters/deuce/"]');
  await expect(card.locator('.character-card-mark')).toHaveAttribute('src',MARK);
  const layout=await card.evaluate(card=>{
   const portrait=card.querySelector('.character-thumb').getBoundingClientRect();
   const copy=card.querySelector('.character-identity-copy').getBoundingClientRect();
   const mark=card.querySelector('.character-card-mark');
   const badge=mark.getBoundingClientRect();
   return {below:badge.top>=portrait.bottom+1,beside:badge.left>=copy.right-1,static:getComputedStyle(mark).position==='static'};
  });
  expect(layout).toEqual({below:true,beside:true,static:true});
  await page.goto(BASE+'/start-here.html',{waitUntil:'domcontentloaded'});
  await expect(page.locator('a[href="characters/deuce/"] .start-character-mark')).toHaveAttribute('src',MARK);
 }
});

test('Deuce supporting character dossier is linked, illustrated, canon-faithful, and entirely unscored',async({page})=>{
 await page.goto(BASE+'/characters/deuce/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('h1')).toHaveText('DEUCE');
 await expect(page.locator('.character-subtitle')).toContainText('Mono Russo');
 await expect(page.locator('.character-kicker')).toContainText('NO OPI');
 await expect(page.locator('.character-feature-art img')).toHaveAttribute('src','../../assets/characters/deuce/deuce-featured.svg');
 await expect(page.locator('.character-infobox img')).toHaveAttribute('src','../../assets/characters/deuce/deuce-registry.svg');
 await expect(page.locator('body')).toContainText('Virginia Engineering University (VEU)');
 await expect(page.locator('body')).toContainText('No direct medical cause is established');
 await expect(page.locator('body')).toContainText('major is intentionally unresolved');
 await expect(page.locator('body')).toContainText('not a confirmed romance');
 await expect(page.locator('body')).toContainText('no official power scaling or combat ranking');
 await expect(page.locator('.character-network a[href="../latch/"]')).toHaveCount(1);
 await expect(page.locator('.character-network a[href="../amari-razman/"]')).toHaveCount(1);
 for(const name of images.map(x=>x[0])){
  await expect(page.locator('img[src$="'+name+'.svg"]').first()).toBeVisible();
 }
 expect(await page.locator('img[src*="/deuce/"]').count()).toBeGreaterThanOrEqual(6);
 await expect.poll(()=>page.locator('.character-feature-art img').evaluate(el=>el.complete&&el.naturalWidth>0)).toBe(true);
});

test('Deuce is a supporting character in public registry, but never in the OPI dataset',async({page})=>{
 await page.goto(BASE+'/characters.html',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.character-card')).toHaveCount(12);
 const card=page.locator('.character-card[href="characters/deuce/"]');
 await expect(card).toHaveCount(1);
 await expect(card).toContainText('Mono Russo');
 await expect(card).toContainText('No OPI Rating');
 await expect(card.locator('.character-thumb')).toHaveAttribute('src','assets/characters/deuce/deuce-registry.svg');
 await expect(card).toHaveAttribute('data-release-order','12');
 await page.locator('#filterToggle').click();
 await page.locator('[data-filter-group="role"][value="support"]').check();
 await page.locator('#filterApply').click();
 await expect(page.locator('.character-card:visible')).toHaveCount(1);
 await expect(card).toBeVisible();
 await page.goto(BASE+'/dpi.html',{waitUntil:'domcontentloaded'});
 const data=await page.evaluate(()=>({items:window.OLDROOT_CHARACTERS.map(x=>x.codename),count:window.OLDROOT_CHARACTERS.length}));
 expect(data.items).not.toContain('Deuce');
 expect(data.items).not.toContain('Mono Russo');
 expect(data.count).toBe(11);
});

test('Deuce is discoverable from Start Here, Dispatch, and sitemap',async({page})=>{
 await page.goto(BASE+'/start-here.html',{waitUntil:'domcontentloaded'});
 await expect(page.locator('a.discovery-card[href="characters/deuce/"]')).toHaveCount(1);
 await expect(page.locator('.start-stat-panel')).toContainText('12 active records');
 await page.goto(BASE+'/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('#homeLatestDispatch')).toContainText('OR-WEB-0084');
 await page.goto(BASE+'/news.html',{waitUntil:'domcontentloaded'});
 await expect(page.locator('#or-web-0084 a[href="characters/deuce/"]')).toHaveCount(1);
 expect(fs.readFileSync('sitemap.xml','utf8')).toContain('/characters/deuce/');
});

test('Deuce page and discovery surfaces remain phone-width safe',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 for(const p of ['/characters/deuce/','/characters.html','/start-here.html','/news.html']){
  await page.goto(BASE+p,{waitUntil:'domcontentloaded'});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth),p).toBeLessThanOrEqual(392);
 }
});
