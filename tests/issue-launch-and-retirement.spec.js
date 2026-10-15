const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const BASE='http://127.0.0.1:8000';
const ROOT=process.cwd();

test('Under Observation is prominently announced as Issue #1 without revealing a protagonist',async({page})=>{
  await page.goto(BASE+'/',{waitUntil:'domcontentloaded'});
  const issue=page.locator('#issue-one');
  await expect(issue).toBeVisible();
  await expect(issue).toContainText('UNDER');
  await expect(issue).toContainText('OBSERVATION');
  await expect(issue).toContainText('NOW IN DEVELOPMENT');
  await expect(issue).toContainText('ISSUE 001');
  await expect(issue).not.toContainText(/Kincast|Micah|Naomi|Ellison/i);
  await expect(issue.locator('a[href="library/oldroot-book-1/"]')).toHaveCount(1);
  await expect(issue.locator('a[href="news.html#or-web-0099"]')).toHaveCount(1);
  const before=await page.evaluate(()=>Boolean(document.querySelector('#issue-one').compareDocumentPosition(document.querySelector('#character-spotlight'))&Node.DOCUMENT_POSITION_FOLLOWING));
  expect(before).toBe(true);

  const vote=page.locator('#community-poll');
  await expect(vote).toBeVisible();
  await expect(vote).toContainText('Who should get the');
  await expect(vote).toContainText('next issue?');
  await expect(vote).toContainText('VOTING OPENS SOON');
  await expect(vote.locator('button, input[type="radio"],iframe')).toHaveCount(0);
});

test('Issue #1 publishing record shows title but no invented cover, date or creative spoilers',async({page})=>{
  await page.goto(BASE+'/library/oldroot-book-1/',{waitUntil:'domcontentloaded'});
  await expect(page.locator('h1')).toHaveText('Under Observation');
  await expect(page.locator('.library-status')).toHaveText('ISSUE #1 · IN DEVELOPMENT');
  await expect(page.locator('.product-hero')).not.toContainText(/Kincast|Micah|Naomi|Ellison/i);
  await expect(page.getByRole('button',{name:'Coming Soon'})).toBeDisabled();
  await page.goto(BASE+'/marketplace.html',{waitUntil:'domcontentloaded'});
  await expect(page.locator('[data-market-sticker]')).toHaveCount(10);
  await expect(page.locator('.library-card[href="library/oldroot-book-1/"]')).toContainText('Under Observation');
  await page.goto(BASE+'/news.html',{waitUntil:'domcontentloaded'});
  const dispatch=page.locator('#or-web-0099');
  await expect(dispatch).toContainText('Under Observation');
  await expect(dispatch).not.toContainText(/Kincast|Micah|Naomi|Ellison/i);
  await expect(page.locator('#or-web-0097')).toHaveCount(0);
});

test('retired canon pages, products, images and geography are absent from current site',async({page})=>{
  const retired=/kokio|kalani|takaro/i;
  const excludes=new Set(['node_modules','.git','.github','tests','artifacts','test-results']);
  const files=[];
  const visit=(dir)=>{
    for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
      if(excludes.has(ent.name))continue;
      const filename=path.join(dir,ent.name);
      if(ent.isDirectory())visit(filename);
      else if(ent.isFile())files.push(filename);
    }
  };
  visit(ROOT);
  const leaks=[];
  for(const file of files){
    const relative=path.relative(ROOT,file);
    if(retired.test(relative))leaks.push(relative+' (path)');
    if(/\.(html|js|css|xml|txt|md|svg)$/i.test(relative)&&retired.test(fs.readFileSync(file,'utf8')))leaks.push(relative+' (content)');
  }
  expect(leaks).toEqual([]);
  await page.goto(BASE+'/characters.html',{waitUntil:'domcontentloaded'});
  await expect(page.locator('.character-card')).toHaveCount(13);
  await page.goto(BASE+'/dpi.html',{waitUntil:'domcontentloaded'});
  const characters=await page.evaluate(()=>window.OLDROOT_CHARACTERS);
  expect(characters).toHaveLength(11);
  await page.goto(BASE+'/locations.html',{waitUntil:'domcontentloaded'});
  const locations=await page.evaluate(()=>window.OLDROOT_LOCATIONS);
  expect(Object.values(locations).filter(x=>x.dossierUrl&&!x.reference)).toHaveLength(6);
  const sitemap=(await (await page.request.get(BASE+'/sitemap.xml')).text());
  expect((sitemap.match(/<loc>/g)||[]).length).toBe(39);
});

test('publishing reveal and community poll stay within mobile viewport',async({page})=>{
  for(const width of [390,760,1440]){
    await page.setViewportSize({width,height:900});
    await page.goto(BASE+'/',{waitUntil:'domcontentloaded'});
    const box=await page.evaluate(()=>{
      const issue=document.querySelector('#issue-one').getBoundingClientRect();
      const poll=document.querySelector('#community-poll').getBoundingClientRect();
      return {inner:innerWidth,scroll:document.documentElement.scrollWidth,issueX:issue.left,issueRight:issue.right,pollRight:poll.right};
    });
    expect(box.scroll).toBeLessThanOrEqual(box.inner+2);
    expect(box.issueX).toBeGreaterThanOrEqual(-2);
    expect(box.issueRight).toBeLessThanOrEqual(box.inner+2);
    expect(box.pollRight).toBeLessThanOrEqual(box.inner+2);
  }
});
