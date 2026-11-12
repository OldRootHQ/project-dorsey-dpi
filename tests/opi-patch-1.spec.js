const { test, expect } = require('@playwright/test');
const BASE='http://127.0.0.1:8000';
const EXPECTED=['Minimal','Limited','Standard','Elevated','Advanced','Exceptional','Extreme','Apex','Zenith'];
const BOUNDS=[0,3,5,10,20,35,50,70,90];
test('Patch 1.0 applies one neutral band scale to all 11 scored dossiers',async({page})=>{
  await page.goto(BASE+'/dpi.html',{waitUntil:'domcontentloaded'});
  const labels=await page.locator('.opi-band-list b').allTextContents();
  expect(labels).toEqual(EXPECTED);
  const evaluated=await page.evaluate(()=>{
    const c=window.OLDROOT_CHARACTERS;
    return {
      records:c.filter(x=>!x.opiExcluded).length,
      amari:c.find(x=>x.codename==='Amari Razman'),
      gila:c.find(x=>x.codename==='Gila Monster'),
      anchorage:c.find(x=>x.codename==='Anchorage'),
      liontone:c.find(x=>x.codename==='Liontone')
    };
  });
  expect(evaluated.records).toBe(11);
  expect(evaluated.amari.opiExcluded).toBe(true);
  expect(evaluated.amari.baseline).toBeUndefined();
  expect(evaluated.gila.conditional.find(x=>x.condition==='Nocturnal').value).toBe(34.5);
  expect(evaluated.gila.conditional.find(x=>x.condition==='Desert').value).toBe(30.1);
  expect(evaluated.anchorage.baseline.Speed).toBe(4.3);
  expect(evaluated.anchorage.baseline.Agility).toBe(4.7);
  expect(evaluated.liontone.baseline.Strength).toBe(13.1);
  await page.locator('#search').fill('Anchorage');
  await expect(page.locator('#detail')).toContainText('Apex');
});
test('Dossier category inspector keeps raw category names while showing bands',async({page})=>{
 await page.goto(BASE+'/characters/gila-monster/',{waitUntil:'domcontentloaded'});
 const rows=page.locator('.dpi-row');
 await expect(rows).toHaveCount(11);
 const first=rows.first().locator('.dpi-name');
 await expect(first).toHaveText('Strength');
 await expect(first).toHaveAttribute('data-band','Elevated');
 await page.locator('.dossier-opi-inspect').first().click();
 await expect(page.locator('.dossier-opi-readout')).toContainText('Strength / 17.1');
});
test('Amari OPI removed without removing her public dossier and Remedie retains manual magnet use',async({page})=>{
 await page.goto(BASE+'/characters/amari-razman/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('h1')).toHaveText('AMARI RAZMAN');
 await expect(page.locator('.dpi-row')).toHaveCount(0);
 await expect(page.locator('main')).not.toContainText('10.02');
 await page.goto(BASE+'/characters/remedie/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('main')).toContainText('magnetic polarity system can actively intercept');
 await expect(page.locator('main')).toContainText('does not automatically detect an incoming hit');
});
