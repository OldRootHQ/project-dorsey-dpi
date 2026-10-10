const {test,expect}=require('@playwright/test');
const fs=require('fs');
const BASE='http://127.0.0.1:8000';
const URL=BASE+'/work-with-oldroot.html';
const INBOX='https://formsubmit.co/oldrootinquiries@gmail.com';

test('Work with OldRoot publicly describes unpaid co-writing and illustration interest without advertising employment',async({page})=>{
  await page.goto(URL,{waitUntil:'domcontentloaded'});
  await expect(page).toHaveTitle(/Work with OldRoot/);
  await expect(page.locator('h1')).toContainText('BUILD SOMETHING');
  await expect(page.locator('.work-discipline-card')).toHaveCount(2);
  await expect(page.locator('.work-discipline-card').nth(0)).toContainText('Co-Writers');
  await expect(page.locator('.work-discipline-card').nth(1)).toContainText('Illustrators');
  await expect(page.locator('.work-transparency')).toContainText('cannot pay');
  await expect(page.locator('.work-status')).toContainText('Currently unpaid');
  await expect(page.locator('.work-transparency')).toContainText('separate written agreement');
  await expect(page.locator('.work-process')).toContainText('No assignments');
  await expect(page.locator('.work-interest-heading')).toContainText('not an audition');
});

test('creative interest form routes to the existing inquiry inbox and requests consent',async({page})=>{
  await page.goto(URL,{waitUntil:'domcontentloaded'});
  const form=page.locator('#workInterestForm');
  await expect(form).toHaveAttribute('action',INBOX);
  await expect(form).toHaveAttribute('method','POST');
  await expect(form.locator('input[name="_subject"]')).toHaveValue('OldRoot Creative Collaboration Interest');
  await expect(form.locator('input[name="_next"]')).toHaveValue('https://oldroothq.github.io/project-dorsey-dpi/work-with-oldroot.html?sent=1');
  await expect(form.locator('input[name="name"]')).toHaveAttribute('required','');
  await expect(form.locator('input[name="email"]')).toHaveAttribute('required','');
  await expect(form.locator('textarea[name="message"]')).toHaveAttribute('required','');
  await expect(form.locator('input[name="unpaid_acknowledgement"]')).toHaveAttribute('required','');
  await expect(form.locator('input[name="portfolio_link"]')).toHaveAttribute('type','url');
  await expect(form.locator('input[name="_honey"]')).toHaveCount(1);
  await expect(page.locator('#workFormSuccess')).toBeHidden();
  await page.goto(URL+'?sent=1',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#workFormSuccess')).toBeVisible();
  // No production contact-form submissions are made during automated QA.
});

test('writer and illustrator interest links focus the correct inquiry option',async({page})=>{
  await page.goto(URL,{waitUntil:'domcontentloaded'});
  await page.locator('[data-discipline-link="Illustration"]').click();
  await expect(page.locator('#workDiscipline')).toHaveValue('Illustration');
  await page.locator('[data-discipline-link="Co-writing"]').click();
  await expect(page.locator('#workDiscipline')).toHaveValue('Co-writing');
  await expect(page.locator('.work-interest-form select option')).toHaveCount(4);
});

test('creative collaboration is discoverable from studio pages and footers without duplicating links',async({page})=>{
  for(const path of ['/','/about.html','/contact.html','/donate.html','/characters/kincast/','/work-with-oldroot.html']){
    await page.goto(BASE+path,{waitUntil:'domcontentloaded'});
    const footer=page.locator('.oldroot-footer .footer-links a[href$="work-with-oldroot.html"]');
    await expect(footer,path).toHaveCount(1);
    await expect(footer).toHaveText('Work with OldRoot');
  }
  await page.goto(BASE+'/',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#explore-oldroot a[href="work-with-oldroot.html"]')).toBeVisible();
  await page.goto(BASE+'/about.html',{waitUntil:'domcontentloaded'});
  await expect(page.locator('main a[href="work-with-oldroot.html"]').first()).toBeVisible();
});

test('responsive writing and illustration sections have no horizontal overflow',async({page})=>{
  for(const width of [1440,768,390,320]){
    await page.setViewportSize({width,height:900});
    await page.goto(URL,{waitUntil:'domcontentloaded'});
    await expect(page.locator('.work-discipline-card')).toHaveCount(2);
    await expect(page.locator('#workInterestForm')).toBeVisible();
    const layout=await page.evaluate(()=>({
      scroll:document.documentElement.scrollWidth,
      inner:window.innerWidth,
      h1:document.querySelector('.work-hero h1').getBoundingClientRect().width,
      form:document.querySelector('#workInterestForm').getBoundingClientRect().width
    }));
    expect(layout.scroll,'horizontal overflow at '+width).toBeLessThanOrEqual(layout.inner+2);
    expect(layout.h1).toBeGreaterThan(0);
    expect(layout.form).toBeGreaterThan(0);
  }
});

test('new page retains OldRoot site infrastructure',async({page,request})=>{
  await page.goto(URL,{waitUntil:'domcontentloaded'});
  await expect(page.locator('body')).toHaveClass(/oldroot-after-dark/);
  await expect(page.locator('.masthead .site-nav')).toHaveCount(1);
  await expect(page.locator('.site-nav [data-nav-toggle]')).toHaveCount(3);
  await expect(page.locator('.oldroot-footer')).toHaveCount(1);
  expect(fs.existsSync('work-with-oldroot.css')).toBe(true);
  expect((await request.get(BASE+'/work-with-oldroot.css?v=1')).ok()).toBe(true);
});
