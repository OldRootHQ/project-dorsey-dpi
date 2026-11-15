const {test,expect} = require('@playwright/test');
const BASE='http://127.0.0.1:8000';
const OPI={Strength:12.9,Durability:11.8,Speed:10.4,Agility:14.6,Regeneration:5.5,Senses:16.3,Offense:44.8,Intellect:11.6,Combat:42.4,Mobility:15.6,Stamina:20.4};

test('Sakuro occupies his approved Eight Originals homepage slot',async({page})=>{
  await page.goto(BASE+'/index.html',{waitUntil:'networkidle'});
  const cards=page.locator('.lc-face-grid .lc-face');
  await expect(cards).toHaveCount(8);
  await expect(cards.filter({hasText:'Sakuro'})).toHaveCount(1);
  await expect(cards.filter({hasText:'Liontone'})).toHaveCount(0);
  const card=page.locator('.lc-face[data-portrait="sakuro"]');
  await expect(card).toHaveAttribute('href','characters/sakuro/');
  await expect(card.locator('img')).toHaveAttribute('src','assets/approved-home/sakuro.webp');
  await expect(card).toHaveAttribute('data-approved-art','true');
  const img=await card.locator('img').evaluate(x=>({loaded:x.complete&&x.naturalWidth>0,width:x.naturalWidth,height:x.naturalHeight}));
  expect(img.loaded).toBe(true);
  expect(img.width).toBeGreaterThan(300);
  expect(img.height).toBeGreaterThan(300);
});

test('Sakuro has one approved profile illustration and the exact revised 0-100 OPI',async({page})=>{
  await page.goto(BASE+'/characters/sakuro/',{waitUntil:'networkidle'});
  await expect(page.locator('h1')).toHaveText('SAKURO');
  await expect(page.locator('.character-subtitle')).toHaveText('Kenji Kuroda');
  await expect(page.locator('.character-feature-art img')).toHaveAttribute('src','../../assets/characters/sakuro/sakuro-profile.webp');
  await expect(page.locator('.character-feature-art img')).toHaveJSProperty('complete',true);
  const artWidth=await page.locator('.character-feature-art img').evaluate(img=>img.naturalWidth);
  expect(artWidth).toBeGreaterThan(500);
  const rows=await page.locator('.dpi-row').evaluateAll(elements=>elements.map(row=>({
    name:row.querySelector('.dpi-name').textContent.trim(),
    score:Number(row.querySelector('.dpi-value').textContent),
    bar:Number(row.querySelector('.dpi-fill').style.getPropertyValue('--score').replace('%',''))
  })));
  expect(rows.map(x=>x.name)).toEqual(Object.keys(OPI));
  for(const row of rows){expect(row.score).toBe(OPI[row.name]);expect(row.bar).toBe(OPI[row.name]);}
  const total=rows.reduce((sum,x)=>sum+x.score,0);
  expect(total).toBeCloseTo(206.3,2);
  await expect(page.locator('.dpi-summary')).toContainText('18.75');
  await expect(page.locator('main')).toContainText('288 feet');
});

test('Sakuro remains in public analytics and registry after roster retirement',async({page})=>{
  await page.goto(BASE+'/dpi.html',{waitUntil:'domcontentloaded'});
  const hero=await page.evaluate(()=>window.OLDROOT_CHARACTERS.find(c=>c.codename==='Sakuro'));
  expect(hero.civilian).toBe('Kenji Kuroda');
  expect(hero.baseline).toEqual(OPI);
  expect(hero.conditional).toEqual([]);
  await page.goto(BASE+'/characters.html',{waitUntil:'domcontentloaded'});
  await expect(page.locator('.character-card:has(h3:text-is("Sakuro"))')).toHaveCount(1);
  await expect(page.locator('.character-card:has(h3:text-is("Liontone"))')).toHaveCount(0);
  const removed = await page.request.get(BASE+'/characters/liontone/');
  expect(removed.status()).toBe(404);
});
