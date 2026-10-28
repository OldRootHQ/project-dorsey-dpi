const {test,expect}=require('@playwright/test');
const BASE='http://127.0.0.1:8000';

for(const width of [390, 1440]){
  test(`contact terminal uses soft avocado surface and readable green controls at ${width}px`, async ({page})=>{
    await page.setViewportSize({width,height:900});
    await page.goto(BASE+'/contact.html',{waitUntil:'networkidle'});
    const panel=page.locator('.contact-page .mail-console');
    await expect(panel).toBeVisible();
    const theme=await panel.evaluate(el=>{
      const css=getComputedStyle(el);
      const topbar=getComputedStyle(el.querySelector('.mail-topbar'));
      const label=getComputedStyle(el.querySelector('.mail-row span'));
      const message=getComputedStyle(el.querySelector('textarea'));
      const button=getComputedStyle(el.querySelector('.mail-actions button'));
      return {
        background:css.backgroundImage,
        border:css.borderTopColor,
        topbar:topbar.backgroundColor,
        label:label.color,
        textarea:message.backgroundColor,
        ink:message.color,
        button:button.backgroundColor,
        buttonInk:button.color,
        panelWidth:el.getBoundingClientRect().width,
        documentWidth:document.documentElement.scrollWidth,
        viewport:innerWidth
      };
    });
    expect(theme.background).toContain('183, 207, 138');
    expect(theme.background).not.toContain('48, 36, 30');
    expect(theme.border).toBe('rgb(220, 234, 198)');
    expect(theme.topbar).toBe('rgb(21, 59, 40)');
    expect(theme.label).toBe('rgb(36, 73, 45)');
    expect(theme.textarea).toBe('rgb(240, 246, 229)');
    expect(theme.ink).toBe('rgb(23, 54, 33)');
    expect(theme.button).toBe('rgb(21, 59, 40)');
    expect(theme.buttonInk).toBe('rgb(239, 247, 223)');
    expect(theme.documentWidth).toBeLessThanOrEqual(width+2);
    expect(theme.panelWidth).toBeLessThanOrEqual(width);
  });
}

test('contact form keeps verified studio email, real fields, and proper target',async({page})=>{
  await page.goto(BASE+'/contact.html',{waitUntil:'domcontentloaded'});
  const form=page.locator('.oldroot-mail-form');
  await expect(form).toHaveAttribute('action','https://formsubmit.co/contact@oldroothq.com');
  await expect(form).toHaveAttribute('method','POST');
  await expect(page.locator('.mail-row input[readonly]')).toHaveValue('contact@oldroothq.com');
  await expect(page.locator('a[href="mailto:contact@oldroothq.com"]')).toBeVisible();
  await expect(page.locator('.mail-actions button[type="submit"]')).toBeVisible();
  await expect(page.locator('input[name="email"]')).toHaveAttribute('required','');
  await expect(page.locator('textarea[name="message"]')).toHaveAttribute('required','');
  await expect(page.locator('#mailSuccess')).toBeHidden();
  await expect(page.locator('link[href="brand.css?v=18"]')).toHaveCount(1);
  await expect(page.locator('link[href="site.css?v=34"]')).toHaveCount(1);
});
