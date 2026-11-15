const {test,expect}=require('@playwright/test');
const fs=require('fs');
const crypto=require('crypto');
const BASE='http://127.0.0.1:8000';
const ASSETS='assets/characters/flying-saucer/';
const MARK=ASSETS+'flying-saucer-emblem.svg?v=2';
const ratings={Strength:6.1,Durability:7.2,Speed:11.6,Agility:14.1,Regeneration:5.4,Senses:8.1,Offense:18.7,Intellect:9.0,Combat:17.9,Mobility:13.7,Stamina:11.2};

test('Triple Strike has genuine alpha and all seven illustrations are real WebP files',async()=>{
 const svg=fs.readFileSync(ASSETS+'flying-saucer-emblem.svg','utf8');
 expect(svg).toContain('Triple Strike');
 expect(svg).toContain('viewBox="0 0 1254 1254"');
 expect(svg).toContain('data:image/webp;base64,');
 const buffer=fs.readFileSync(ASSETS+'flying-saucer-emblem.webp');
 expect(buffer.toString('ascii',0,4)).toBe('RIFF');
 expect(buffer.toString('ascii',8,12)).toBe('WEBP');
 expect(buffer.includes(Buffer.from('ALPH'))).toBe(true);
 const master=fs.readFileSync(ASSETS+'flying-saucer-sticker-master.png');
 expect(master.subarray(0,8).toString('hex')).toBe('89504e470d0a1a0a');
 expect(master.readUInt32BE(16)).toBe(1254);
 expect(master.readUInt32BE(20)).toBe(1254);
 expect(crypto.createHash('sha256').update(master).digest('hex')).toBe('84bc691344df5cd428a299a6a7a12336fcba2765ca3ff0c217654637f4d07463');
 expect(buffer.length).toBeGreaterThan(400000);
 expect(svg).toContain('white die-cut outline');
 for(const asset of ['rain-combat','sunset-jump','pizza','cascade','snow','harbor','workshop']){
  const b=fs.readFileSync(ASSETS+'flying-saucer-'+asset+'.webp');
  expect(b.length,asset).toBeGreaterThan(25000);
  expect(b.toString('ascii',0,4),asset).toBe('RIFF');
  expect(b.toString('ascii',8,12),asset).toBe('WEBP');
 }
});

test('Flying Saucer dossier includes canon, original visuals and no spoiler revelation',async({page})=>{
 await page.goto(BASE+'/characters/flying-saucer/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('h1')).toHaveText('FLYING SAUCER');
 await expect(page.locator('.logo-slot.has-logo .character-logo')).toHaveAttribute('src','../../'+MARK);
 await expect(page.locator('.character-feature-art img')).toHaveAttribute('src','../../'+ASSETS+'flying-saucer-sunset-jump.webp');
 await expect(page.locator('.dossier-illustration img')).toHaveCount(6);
 const publicText=await page.locator('main').innerText();
 for(const phrase of ['Nikki Knotts','Trank Knotts','Agent Emerald','Seattle','pizza','Deuce','eight','disc','13.7']){
   expect(publicText.toLowerCase()).toContain(phrase.toLowerCase());
 }
 for(const spoiler of ['hidden cult','ritualized conditioning','secret military','enforcer','exosuit upgrade']){
   expect(publicText.toLowerCase()).not.toContain(spoiler);
 }
 const images=page.locator('main img');
 for(const image of await images.all()){
  await image.scrollIntoViewIfNeeded();
  await expect.poll(()=>image.evaluate(node=>node.complete&&node.naturalWidth>0)).toBe(true);
 }
});

test('Nikki joins the 14-person registry with her emblem below her portrait, not over it',async({page})=>{
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  await page.setViewportSize(viewport);
  await page.goto(BASE+'/characters.html',{waitUntil:'domcontentloaded'});
  await expect(page.locator('.character-card')).toHaveCount(14);
  const card=page.locator('.character-card[href="characters/flying-saucer/"]');
  await expect(card).toHaveAttribute('data-release-order','14');
  await expect(card.locator('.character-card-mark')).toHaveAttribute('src',MARK);
  const result=await card.evaluate(el=>{
   const img=el.querySelector('.character-thumb').getBoundingClientRect();
   const mark=el.querySelector('.character-card-mark').getBoundingClientRect();
   const text=el.querySelector('.character-identity-copy').getBoundingClientRect();
   return {below:mark.top>=img.bottom+1,beside:mark.left>=text.right-1,inside:mark.right<=el.getBoundingClientRect().right+1};
  });
  expect(result).toEqual({below:true,beside:true,inside:true});
 }
});

test('Nikki propagates to Start Here, Seattle, Agent Emerald, Deuce, homepage and OPI',async({page})=>{
 await page.goto(BASE+'/start-here.html',{waitUntil:'domcontentloaded'});
 await expect(page.locator('a.discovery-card[href="characters/flying-saucer/"] .start-character-mark')).toHaveAttribute('src',MARK);
 await expect(page.locator('.start-stat-panel')).toContainText('14 active records');
 await page.goto(BASE+'/locations/seattle/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('a.known-character-card[href="../../characters/flying-saucer/"]')).toHaveCount(1);
 await page.goto(BASE+'/characters/agent-emerald/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.character-network a[href="../flying-saucer/"]')).toHaveCount(1);
 await page.goto(BASE+'/characters/deuce/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.character-links a[href="../flying-saucer/"]')).toHaveCount(1);
 await page.goto(BASE+'/',{waitUntil:'domcontentloaded'});
 expect(await page.evaluate(()=>window.OLDROOT_HOME.characterSpotlights['Flying Saucer'].mark)).toBe(MARK);
 expect(await page.evaluate(()=>window.OLDROOT_LOCATIONS.seattle.characters.map(x=>x.name))).toContain('Flying Saucer');
 await page.goto(BASE+'/dpi.html',{waitUntil:'domcontentloaded'});
 await expect(page.locator('#count')).toHaveText('11 CHARACTERS');
 const record=await page.evaluate(()=>window.OLDROOT_CHARACTERS.find(x=>x.codename==='Flying Saucer'));
 expect(record).toBeTruthy();
 expect(record.baseline).toEqual(ratings);
 expect(record).not.toHaveProperty('suppressAggregate');
 expect(record).not.toHaveProperty('officialOPI');
 expect(record.mark).toBe(MARK);
});

test('Flying Saucer remains phone-width safe',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 for(const url of ['/characters/flying-saucer/','/characters.html','/start-here.html','/locations/seattle/','/dpi.html']){
  await page.goto(BASE+url,{waitUntil:'domcontentloaded'});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth),url).toBeLessThanOrEqual(392);
 }
});
