const {test, expect} = require('@playwright/test');
const fs=require('fs');
const BASE='http://127.0.0.1:8000';

test('Retired character is absent from every active public discovery surface',async({page})=>{
  const pages=['/','/characters.html','/start-here.html','/news.html','/locations.html','/dpi.html'];
  for(const path of pages){
    await page.goto(BASE+path,{waitUntil:'domcontentloaded'});
    await expect(page.locator('body')).not.toContainText('Liontone');
    await expect(page.locator('body')).not.toContainText('Marlon McKenzie');
  }
  await page.goto(BASE+'/',{waitUntil:'domcontentloaded'});
  await expect(page.locator('.lc-face')).toHaveCount(8);
  await expect(page.locator('.lc-face[data-portrait="sakuro"]')).toHaveCount(1);
  await expect(page.locator('.poll-option')).toHaveCount(5);
  await expect(page.locator('input[name="nextIssue"][value="Liontone"]')).toHaveCount(0);
});

test('Retired profile, exclusive location and their artwork are no longer published',async({request})=>{
  const removed=[
    '/characters/liontone/',
    '/locations/montego-bay/',
    '/assets/characters/liontone/liontone-ruins.webp',
    '/assets/characters/liontone/liontone-harbor-combat.webp',
    '/assets/approved-home/liontone.webp',
    '/liontone.css'
  ];
  for(const path of removed){
    const r=await request.get(BASE+path);
    expect(r.status(),path).toBe(404);
  }
  const sitemap=fs.readFileSync('sitemap.xml','utf8');
  expect(sitemap).not.toMatch(/liontone|montego-bay/i);
  const data=fs.readFileSync('data.js','utf8');
  expect(data).not.toMatch(/Liontone|Marlon McKenzie/i);
  const worker=fs.readFileSync('poll-backend/src/worker.js','utf8');
  expect(worker).not.toContain("'Liontone'");
});

test('Sakuro remains unchanged and public records have consistent counts',async({page})=>{
  await page.goto(BASE+'/dpi.html',{waitUntil:'domcontentloaded'});
  const records=await page.evaluate(()=>window.OLDROOT_CHARACTERS);
  expect(records).toHaveLength(12);
  expect(records.filter(c=>!c.opiExcluded)).toHaveLength(11);
  const sakuro=records.find(c=>c.codename==='Sakuro');
  expect(sakuro?.civilian).toBe('Kenji Kuroda');
  expect(sakuro?.baseline.Offense).toBe(44.8);
  expect(sakuro?.baseline.Combat).toBe(42.4);
  await page.goto(BASE+'/locations.html',{waitUntil:'domcontentloaded'});
  await expect(page.locator('.location-index button')).toHaveCount(7);
});
