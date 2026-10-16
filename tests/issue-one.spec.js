const { test, expect } = require('@playwright/test');
const BASE='http://127.0.0.1:8000';

test('Under Observation is announced as OldRoot Issue 1 without revealing story cast',async({page})=>{
  await page.goto(BASE+'/',{waitUntil:'domcontentloaded'});
  const reveal=page.locator('#issue-one-announcement');
  await expect(reveal).toBeVisible();
  await expect(reveal).toContainText('UNDER');
  await expect(reveal).toContainText('OBSERVATION');
  await expect(reveal).toContainText('ISSUE #1');
  await expect(reveal).toContainText('IN DEVELOPMENT');
  await expect(reveal).not.toContainText('Kincast');
  await expect(reveal).not.toContainText('Micah');
  await expect(reveal).not.toContainText('Naomi');
  await expect(reveal.locator('a')).toHaveAttribute('href','library/oldroot-book-1/');

  const poll=page.locator('#community-vote');
  await expect(poll).toContainText('WHO GETS THE');
  await expect(poll).toContainText('NEXT ISSUE?');
  await expect(poll).toContainText('VOTING OPENS SOON');
  await expect(poll.locator('button,iframe,input')).toHaveCount(0);

  await page.goto(BASE+'/library/oldroot-book-1/',{waitUntil:'domcontentloaded'});
  await expect(page.locator('h1')).toHaveText('Under Observation — Issue #1');
  await expect(page.locator('.library-status').first()).toHaveText('IN DEVELOPMENT');
  await expect(page.locator('main')).not.toContainText('Kincast');
  await expect(page.locator('main')).not.toContainText('Micah');
  await expect(page.locator('main')).not.toContainText('Naomi');

  await page.goto(BASE+'/marketplace.html',{waitUntil:'domcontentloaded'});
  await expect(page.locator('main')).toContainText('Under Observation — Issue #1');
  await expect(page.locator('[data-market-sticker]')).toHaveCount(10);
  await expect(page.locator('a[href="stickers/kokio/"]')).toHaveCount(0);

  await page.goto(BASE+'/news.html',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#issue-one-under-observation')).toContainText('Under Observation');
  await expect(page.locator('#issue-one-under-observation')).not.toContainText('Kincast');
  await expect(page.locator('#issue-one-under-observation')).not.toContainText('Micah');
});

test('retired character and location no longer appear on the public site',async({page})=>{
  await page.goto(BASE+'/characters.html',{waitUntil:'domcontentloaded'});
  await expect(page.locator('.character-card')).toHaveCount(13);
  await page.goto(BASE+'/locations.html',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#techGlobe .location-node')).toHaveCount(8);
  await page.goto(BASE+'/',{waitUntil:'domcontentloaded'});
  const state=await page.evaluate(()=>window.OLDROOT_HOME_STATE);
  expect(state.characterPool).toHaveLength(11);
  expect(state.locationPool).toHaveLength(6);
  expect(state.selectedCharacters).toHaveLength(3);
  const retiredRoutes=['/characters/kokio/','/stickers/kokio/','/locations/hilo/'];
  for(const route of retiredRoutes){
    const response=await page.request.get(BASE+route,{failOnStatusCode:false});
    expect(response.status(),route).toBe(404);
  }
});
