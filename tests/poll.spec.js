const { test, expect } = require('@playwright/test');
const fs = require('fs');
const BASE = 'http://127.0.0.1:8000';
const characters = ['Gila Monster', 'Latch', 'Anchorage', 'Flying Saucer'];

test('Reader\'s Choice shows compact side-by-side bubbles and never records pretend votes', async ({page}) => {
  for (const viewport of [{width:1440,height:900,cols:4},{width:390,height:844,cols:2}]) {
    await page.setViewportSize(viewport);
    await page.goto(BASE+'/', {waitUntil:'domcontentloaded'});
    const options = page.locator('#oldrootPollForm label.poll-option');
    await expect(options).toHaveCount(4);
    await expect(page.locator('#oldrootPollSubmit')).toBeDisabled();
    await expect(page.locator('#oldrootPollStatus')).toContainText('No votes are being collected');
    const r = await options.evaluateAll(els=>els.map(el=>({x:el.getBoundingClientRect().x,y:el.getBoundingClientRect().y,h:el.getBoundingClientRect().height,w:el.getBoundingClientRect().width})));
    expect(new Set(r.map(x=>Math.round(x.y))).size).toBe(4/viewport.cols);
    expect(Math.max(...r.map(x=>x.h))).toBeLessThan(90);
    const pollBounds=await page.locator('#next-issue-poll').evaluate(el=>({right:el.getBoundingClientRect().right,left:el.getBoundingClientRect().left}));
    expect(pollBounds.left).toBeGreaterThanOrEqual(0);
    expect(pollBounds.right).toBeLessThanOrEqual(viewport.width+2);
    if(viewport.width<900)expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width+2);
    await expect(page.locator('.poll-option img')).toHaveCount(4);
  }
  await page.locator('input[value="Latch"]').check();
  await expect(page.locator('input[value="Latch"]')).toBeChecked();
});

test('Reader\'s Choice submits confirmed votes only when live backend responds', async ({page}) => {
  let received = null;
  await page.route('**/poll-config.js*', route => route.fulfill({status:200,contentType:'text/javascript',body:"window.OLDROOT_POLL_CONFIG={apiBase:'https://poll.test.invalid'};"}));
  await page.route('https://poll.test.invalid/**', async route => {
    const url = route.request().url();
    const headers = {'Access-Control-Allow-Origin':'*','Content-Type':'application/json'};
    if (url.endsWith('/api/status')) return route.fulfill({status:200,headers,body:JSON.stringify({open:true})});
    if (url.endsWith('/api/vote')) {
      received = JSON.parse(route.request().postData());
      return route.fulfill({status:201,headers,body:JSON.stringify({status:'recorded'})});
    }
    return route.fulfill({status:404,headers,body:'{}'});
  });
  await page.goto(BASE+'/',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#oldrootPollSubmit')).toBeEnabled();
  await page.locator('input[value="Flying Saucer"]').check();
  await page.locator('#oldrootPollSubmit').click();
  await expect(page.locator('#oldrootPollStatus')).toContainText('Vote confirmed');
  expect(received.choice).toBe('Flying Saucer');
  expect(received.voterId).toMatch(/^[a-f0-9-]{36}$/i);
  await expect(page.locator('#oldrootPollSubmit')).toBeDisabled();
});

test('owner poll dashboard is noindex, totals require authorization, and token is not stored', async ({page}) => {
  await page.goto(BASE+'/poll-results.html',{waitUntil:'domcontentloaded'});
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/);
  await expect(page.locator('#pollResultsTotal')).toHaveText('—');
  await expect(page.locator('#pollAdminStatus')).toContainText('not been deployed');
  expect(await page.evaluate(()=>Object.keys(localStorage).filter(k=>/admin|token/i.test(k)))).toEqual([]);
  const src=fs.readFileSync('poll-results.js','utf8');
  expect(src).not.toMatch(/localStorage|sessionStorage/);
  expect(src).toContain("setInterval(load, 30000)");
});

test('worker only exposes private totals behind owner secret and stores no raw IP', async () => {
  const src=fs.readFileSync('poll-backend/src/worker.js','utf8');
  expect(src).toContain("'/api/admin/results'");
  expect(src).toContain("'Authorization'");
  expect(src).toContain('safeEq(provided,env.ADMIN_TOKEN)');
  expect(src).toContain("await hmac(env.VOTE_PEPPER,'ip:'+ip)");
  expect(src).toContain("'INSERT OR IGNORE INTO votes");
  expect(src).not.toContain('Access-Control-Allow-Origin\':\'*');
});
