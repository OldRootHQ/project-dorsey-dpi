const { test, expect } = require('@playwright/test');
const BASE='http://127.0.0.1:8000';
const products=['gila-monster','commotion','latch','kokio'];

test('Market stickers open product pages, with character links still present',async({page})=>{
  await page.goto(BASE+'/marketplace.html',{waitUntil:'domcontentloaded'});
  for(const slug of products){
    const card=page.locator('[data-market-sticker="'+slug+'"]');
    await expect(card.locator('a.market-sticker-product')).toHaveAttribute('href','stickers/'+slug+'/');
    await expect(card.locator('a[href="characters/'+slug+'/"]')).toHaveCount(1);
  }
  await page.locator('[data-market-sticker="gila-monster"] a.market-sticker-product').click();
  await expect(page).toHaveURL(/\/stickers\/gila-monster\/$/);
  await expect(page.locator('h1')).toContainText('Emblem Sticker');
});
test('Rotating sticker features open matching sticker products without changing book routes',async({page})=>{
  await page.goto(BASE+'/marketplace.html',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#marketplaceFeaturedGrid [data-feature-kind="sticker"]')).toHaveCount(3);
  await expect(page.locator('#marketplaceFeaturedGrid [data-feature-kind="book"]')).toHaveCount(2);
  const hrefs=await page.locator('#marketplaceFeaturedGrid [data-feature-kind="sticker"]').evaluateAll(xs=>xs.map(el=>el.getAttribute('href')));
  for(const href of hrefs)expect(href).toMatch(/^stickers\/(gila-monster|commotion|latch|kokio)\/$/);
});
for(const slug of products){
  test(slug+' shows a clickable picture, functional lightbox and disabled purchasing',async({page})=>{
    await page.goto(BASE+'/stickers/'+slug+'/',{waitUntil:'domcontentloaded'});
    await expect(page.locator('main[data-sticker-product="'+slug+'"]')).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/);
    const trigger=page.getByRole('button',{name:'Enlarge '+({ 'gila-monster':'Gila Monster','commotion':'Commotion','latch':'Latch','kokio':'Kokio'}[slug])+' sticker preview'});
    await expect(trigger.locator('img')).toBeVisible();
    await expect.poll(()=>trigger.locator('img').evaluate(img=>img.naturalWidth)).toBeGreaterThan(0);
    await trigger.click();
    const modal=page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await expect(modal.locator('img')).toHaveAttribute('src',new RegExp(slug+'-emblem\\.svg$'));
    await page.keyboard.press('Escape');
    await expect(modal).toBeHidden();
    await expect(trigger).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(modal).toBeVisible();
    await modal.getByRole('button',{name:'Close full image'}).click();
    await expect(modal).toBeHidden();
    await expect(page.getByRole('button',{name:'Samples in Preparation'})).toBeDisabled();
    await expect(page.locator('main a[href*="checkout"]')).toHaveCount(0);
    await expect(page.locator('main a[href="../../characters/'+slug+'/"]')).toHaveCount(1);
  });
  test(slug+' product page remains usable on mobile',async({page})=>{
    await page.setViewportSize({width:390,height:844});
    await page.goto(BASE+'/stickers/'+slug+'/',{waitUntil:'domcontentloaded'});
    const d=await page.evaluate(()=>({w:innerWidth,html:document.documentElement.scrollWidth,body:document.body.scrollWidth}));
    expect(d.html).toBeLessThanOrEqual(d.w+2);
    expect(d.body).toBeLessThanOrEqual(d.w+2);
    await expect(page.locator('.sticker-picture-trigger')).toBeVisible();
  });
}
