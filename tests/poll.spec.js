const { test, expect } = require('@playwright/test');
const fs = require('fs');
const BASE = 'http://127.0.0.1:8000';
const characters = ['Gila Monster', 'Agent Emerald', 'Kincast', 'Isiah Ivory', 'Liontone', 'Remedie'];
const LIVE_API='https://oldroot-reader-poll.mmerancio02.workers.dev';

test("Reader's Choice shows compact side-by-side bubbles and remains closed by backend switch", async ({page}) => {
  await page.route(LIVE_API+'/api/status',route=>route.fulfill({
    status:200,contentType:'application/json',
    headers:{'Access-Control-Allow-Origin':'http://127.0.0.1:8000'},
    body:JSON.stringify({open:false})
  }));
  for (const viewport of [{width:1440,height:900,cols:3},{width:390,height:844,cols:2}]) {
    await page.setViewportSize(viewport);
    await page.goto(BASE+'/', {waitUntil:'domcontentloaded'});
    const options = page.locator('#oldrootPollForm label.poll-option');
    await expect(options).toHaveCount(6);
    expect(await options.locator('input[name="nextIssue"]').evaluateAll(els=>els.map(el=>el.value))).toEqual(characters);
    await expect(page.locator('#oldrootPollSubmit')).toBeDisabled();
    await expect(page.locator('#oldrootPollStatus')).toContainText('Community voting is currently closed.');
    const r = await options.evaluateAll(els=>els.map(el=>({x:el.getBoundingClientRect().x,y:el.getBoundingClientRect().y,h:el.getBoundingClientRect().height,w:el.getBoundingClientRect().width})));
    expect(new Set(r.map(x=>Math.round(x.y))).size).toBe(6/viewport.cols);
    expect(Math.max(...r.map(x=>x.h))).toBeLessThan(90);
    const pollBounds=await page.locator('#next-issue-poll').evaluate(el=>({right:el.getBoundingClientRect().right,left:el.getBoundingClientRect().left}));
    expect(pollBounds.left).toBeGreaterThanOrEqual(0);
    expect(pollBounds.right).toBeLessThanOrEqual(viewport.width+2);
    if(viewport.width<900)expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width+2);
    await expect(page.locator('.poll-option img')).toHaveCount(6);
  }
  await page.locator('input[value="Isiah Ivory"]').check();
  await expect(page.locator('input[value="Isiah Ivory"]')).toBeChecked();
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
  await page.locator('input[value="Remedie"]').check();
  await page.locator('#oldrootPollSubmit').click();
  await expect(page.locator('#oldrootPollStatus')).toContainText('Vote confirmed');
  expect(received.choice).toBe('Remedie');
  expect(received.voterId).toMatch(/^[a-f0-9-]{36}$/i);
  await expect(page.locator('#oldrootPollSubmit')).toBeDisabled();
});

test('owner poll dashboard is noindex, totals require authorization, and token is not stored', async ({page}) => {
  await page.goto(BASE+'/poll-results.html',{waitUntil:'domcontentloaded'});
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/);
  await expect(page.locator('#pollResultsTotal')).toHaveText('—');
  await expect(page.locator('#pollAdminStatus')).toContainText('Checking vote service');
  expect(await page.evaluate(()=>Object.keys(localStorage).filter(k=>/admin|token/i.test(k)))).toEqual([]);
  const src=fs.readFileSync('poll-results.js','utf8');
  expect(src).not.toMatch(/localStorage|sessionStorage/);
  expect(src).toContain("setInterval(load, 30000)");
});

test('private dashboard loads totals only with owner token and never persists it', async ({page}) => {
  const sampleToken='test-owner-token-never-a-real-secret';
  let authorizedCalls=0;
  await page.route(LIVE_API+'/**',route=>{
    const url=route.request().url();
    const baseHeaders={
      'Access-Control-Allow-Origin':'http://127.0.0.1:8000',
      'Access-Control-Allow-Headers':'Authorization, Content-Type',
      'Access-Control-Allow-Methods':'GET, OPTIONS',
      'Content-Type':'application/json'
    };
    if(route.request().method()==='OPTIONS')return route.fulfill({status:204,headers:baseHeaders});
    if(url.endsWith('/api/admin/results')){
      if(route.request().headers()['authorization']!=='Bearer '+sampleToken){
        return route.fulfill({status:401,headers:baseHeaders,body:JSON.stringify({error:'Unauthorized'})});
      }
      authorizedCalls++;
      return route.fulfill({status:200,headers:baseHeaders,body:JSON.stringify({
        total:3,votes:[
          {choice:'Gila Monster',count:2},
          {choice:'Agent Emerald',count:0},
          {choice:'Kincast',count:0},
          {choice:'Isiah Ivory',count:0},
          {choice:'Liontone',count:0},
          {choice:'Remedie',count:1}
        ],updatedAt:new Date().toISOString()
      })});
    }
    return route.fulfill({status:404,headers:baseHeaders,body:'{}'});
  });
  await page.goto(BASE+'/poll-results.html',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#pollResultsTotal')).toHaveText('—');
  await page.locator('#pollAdminToken').fill(sampleToken);
  await page.locator('#pollResultsLogin button[type="submit"]').click();
  await expect(page.locator('#pollAdminStatus')).toHaveText('Private results connected.');
  await expect(page.locator('#pollResultsTotal')).toHaveText('3');
  await expect(page.locator('.result-row')).toHaveCount(6);
  expect(authorizedCalls).toBeGreaterThan(0);
  await expect(page.locator('#pollAdminToken')).toHaveValue('');
  expect(await page.evaluate(()=>Object.keys(localStorage).filter(k=>/admin|token/i.test(k)))).toEqual([]);
  await page.locator('#pollResultsLogout').click();
  await expect(page.locator('#pollResultsTotal')).toHaveText('—');
  await expect(page.locator('.result-row')).toHaveCount(0);
});

test('worker only exposes private totals behind owner secret and stores no raw IP', async () => {
  const src=fs.readFileSync('poll-backend/src/worker.js','utf8');
  expect(src).toContain("'/api/admin/results'");
  expect(src).toContain("'Authorization'");
  expect(src).toContain('safeEq(provided,env.ADMIN_TOKEN)');
  expect(src).toContain("await hmac(env.VOTE_PEPPER,'ip:'+ip)");
  expect(src).toContain("'INSERT OR IGNORE INTO votes_v2");
  expect(src).not.toContain('Access-Control-Allow-Origin\':\'*');
});

test('six-candidate voting schema is isolated and does not delete older records', async () => {
  const sql=fs.readFileSync('poll-backend/schema-v2.sql','utf8');
  const worker=fs.readFileSync('poll-backend/src/worker.js','utf8');
  expect(sql).toContain('CREATE TABLE IF NOT EXISTS votes_v2');
  for(const choice of characters){
    expect(sql).toContain("'" + choice + "'");
    expect(worker).toContain("'" + choice + "'");
  }
  expect(sql).not.toMatch(/DROP TABLE|DELETE FROM|TRUNCATE/i);
  expect(worker).toContain('FROM votes_v2 GROUP BY choice');
  expect(worker).toContain('INSERT OR IGNORE INTO votes_v2');
});
