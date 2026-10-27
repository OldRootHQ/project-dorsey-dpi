const { test, expect } = require('@playwright/test');
const fs = require('fs');

const BASE = 'http://127.0.0.1:8000';

for (const [mode,width,height] of [['desktop',1440,900],['mobile',390,844]]) {
  test(`Issue #1 graffiti lives only inside the promo and remains readable (${mode})`,async({page})=>{
    test.setTimeout(90000);
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.setViewportSize({width,height});
    await page.goto(BASE+'/',{waitUntil:'networkidle'});
    const issue = page.locator('#issue-one');
    await expect(issue).toBeVisible();
    await expect(issue.locator('#issue-one-heading')).toContainText('UNDER OBSERVATION');
    await expect(issue).toContainText('IN DEVELOPMENT');
    await expect(issue.locator('.issue-street-art')).toHaveAttribute('aria-hidden','true');
    await expect(issue.locator('.issue-street-art__tag')).toContainText("WHO'S WATCHING?");
    await expect(issue.locator('.issue-launch-body a')).toHaveAttribute('href','marketplace.html');

    const values = await page.evaluate(()=>{
      const issue=document.querySelector('#issue-one');
      const decoration=issue.querySelector('.issue-street-art');
      const cta=issue.querySelector('.issue-launch-body a');
      const rect=issue.getBoundingClientRect();
      return {
        backdrop:getComputedStyle(document.body).backgroundImage,
        graffiti:getComputedStyle(issue).backgroundImage,
        contrast:getComputedStyle(issue.querySelector('h2')).color,
        decorationEvents:getComputedStyle(decoration).pointerEvents,
        ctaColor:getComputedStyle(cta).color,
        ctaBackground:getComputedStyle(cta).backgroundColor,
        issueWidth:rect.width,
        horizontalOverflow:document.documentElement.scrollWidth-innerWidth
      };
    });
    expect(values.backdrop).toContain('oldroot-cosmic-field.svg');
    expect(values.backdrop).not.toContain('issue-01-graffiti-accents.svg');
    expect(values.graffiti).toContain('issue-01-graffiti-accents.svg');
    expect(values.contrast).toBe('rgb(250, 255, 252)');
    expect(values.decorationEvents).toBe('none');
    expect(values.ctaColor).toBe('rgb(10, 28, 13)');
    expect(values.ctaBackground).toBe('rgb(183, 207, 138)');
    expect(values.issueWidth).toBeLessThanOrEqual(width+2);
    expect(values.horizontalOverflow).toBeLessThanOrEqual(3);

    fs.mkdirSync('artifacts/issue-one-review',{recursive:true});
    await issue.screenshot({
      path:`artifacts/issue-one-review/${mode}-issue-one.png`,
      animations:'disabled'
    });
    // Full-page review: load every approved portrait before Chromium's capture.
    const images=page.locator('.lc-face img');
    await expect(images).toHaveCount(8);
    await images.evaluateAll(imgs=>Promise.all(imgs.map(img=>img.decode().catch(()=>{}))));
    for(let i=0;i<8;i++) await page.locator('.lc-face').nth(i).scrollIntoViewIfNeeded();
    await page.evaluate(()=>{
      document.documentElement.style.scrollBehavior='auto';
      document.body.style.scrollBehavior='auto';
      scrollTo({top:0,left:0,behavior:'instant'});
    });
    await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);
    await page.screenshot({
      path:`artifacts/issue-one-review/${mode}-full-home.png`,
      fullPage:true,animations:'disabled'
    });
  });
}
