const {test,expect}=require('@playwright/test');
const fs=require('fs');
const BASE='http://127.0.0.1:8000';
const official={Strength:13.1,Durability:12.7,Speed:11.8,Agility:13.2,Regeneration:11.1,Senses:11.8,Offense:17.4,Intellect:10.5,Combat:18.8,Mobility:7.9,Stamina:14.1};

test('Liontone approved art and all eleven OPI ratings are preserved without an invented overall score',async({page})=>{
  for(const name of ['liontone-ruins','liontone-harbor-combat']){
    const b=fs.readFileSync('assets/characters/liontone/'+name+'.webp');
    expect(b.length).toBeGreaterThan(100000);
    expect(b.toString('ascii',0,4)).toBe('RIFF');
    expect(b.toString('ascii',8,12)).toBe('WEBP');
  }
  await page.goto(BASE+'/dpi.html',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#count')).toHaveText('12 CHARACTERS');
  const entry=await page.evaluate(()=>window.OLDROOT_CHARACTERS.find(c=>c.codename==='Liontone'));
  expect(entry).toBeTruthy();
  expect(entry.baseline).toEqual(official);
  expect(entry.officialOPI).toBeNull();
  expect(entry.suppressAggregate).toBe(true);
  expect(entry.image).toBe('assets/characters/liontone/liontone-ruins.webp');
  expect(entry.mark).toBeUndefined();
});

test('Liontone dossier presents his character bible with both full-size illustration views',async({page})=>{
  await page.goto(BASE+'/characters/liontone/',{waitUntil:'domcontentloaded'});
  await expect(page.locator('h1')).toHaveText('LIONTONE');
  const main=page.locator('main');
  for(const detail of ['Captain Marlon McKenzie','Montego Bay','October 9','240 lb','Kymani Reid','Lloyd Hylton','Javvoy Ghost','Jamaica Defence Force','18.8','11.1']){
    await expect(main).toContainText(detail);
  }
  await expect(main.locator('.dpi-row')).toHaveCount(11);
  await expect(main.locator('.dossier-illustration')).toHaveCount(2);
  await expect(main.locator('.character-portrait img')).toHaveAttribute('src','../../assets/characters/liontone/liontone-ruins.webp');
  await expect(main.locator('.logo-slot img')).toHaveCount(0);
  const body=(await main.innerText()).toLowerCase();
  for(const spoiler of ['corporate involvement','classified partnership','wife died in','secret patron','overall opi:'])expect(body).not.toContain(spoiler);
  for(const img of await main.locator('.dossier-illustration img,.character-portrait img').all()){
    await img.scrollIntoViewIfNeeded();
    await expect.poll(()=>img.evaluate(e=>e.complete&&e.naturalWidth>0)).toBe(true);
  }
  await main.locator('.dossier-illustration button').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('Liontone connects to registry, Start Here, homepage, indexed Montego Bay and sitemap',async({page})=>{
  await page.goto(BASE+'/characters.html',{waitUntil:'domcontentloaded'});
  await expect(page.locator('.character-card')).toHaveCount(14);
  await expect(page.locator('.character-card[href="characters/liontone/"]')).toHaveCount(1);
  await page.goto(BASE+'/start-here.html',{waitUntil:'domcontentloaded'});
  await expect(page.locator('.start-stat-panel')).toContainText('14 active records');
  await expect(page.locator('a.discovery-card[href="characters/liontone/"]')).toHaveCount(1);
  await page.goto(BASE+'/',{waitUntil:'domcontentloaded'});
  const state=await page.evaluate(()=>({characters:window.OLDROOT_HOME_STATE.characterPool,location:window.OLDROOT_HOME_STATE.locationPool,feature:window.OLDROOT_HOME.characterSpotlights.Liontone}));
  expect(state.characters).toContain('Liontone');
  expect(state.location).toContain('montegobay');
  expect(state.feature.image).toBe('assets/characters/liontone/liontone-ruins.webp');
  expect(state.feature.mark).toBeUndefined();
  await page.goto(BASE+'/locations.html#montegobay',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#locationName')).toHaveText('Montego Bay, Jamaica');
  await expect(page.locator('#locationCharacter a[href="characters/liontone/"]')).toHaveCount(1);
  await page.goto(BASE+'/locations/montego-bay/',{waitUntil:'domcontentloaded'});
  await expect(page.locator('h1')).toHaveText('MONTEGO BAY / JAMAICA');
  await expect(page.locator('.known-character-card[href="../../characters/liontone/"]')).toHaveCount(1);
  const sitemap=fs.readFileSync('sitemap.xml','utf8');
  expect(sitemap).toContain('https://oldroothq.com/characters/liontone/');
  expect(sitemap).toContain('https://oldroothq.com/locations/montego-bay/');
});

test('Liontone and Montego Bay remain mobile width safe',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  for(const route of ['/characters/liontone/','/locations/montego-bay/','/locations.html','/characters.html']){
    await page.goto(BASE+route,{waitUntil:'domcontentloaded'});
    const width=await page.evaluate(()=>({html:document.documentElement.scrollWidth,body:document.body.scrollWidth,viewport:innerWidth}));
    expect(width.html,route).toBeLessThanOrEqual(width.viewport+2);
    expect(width.body,route).toBeLessThanOrEqual(width.viewport+2);
  }
});
