const { test, expect } = require('@playwright/test');
const BASE='http://127.0.0.1:8000';
const FEATURED='#marketplaceFeaturedGrid [data-feature-id]';
test('Marketplace has five varied items before the preserved Library and stickers',async({page})=>{
  await page.goto(BASE+'/marketplace.html',{waitUntil:'domcontentloaded'});
  await expect(page.locator('h1')).toHaveText('THE MARKETPLACE');
  await expect(page.locator(FEATURED)).toHaveCount(5);
  await expect(page.locator('[data-feature-kind="sticker"]')).toHaveCount(3);
  await expect(page.locator('[data-feature-kind="book"]')).toHaveCount(2);
  const items=await page.locator(FEATURED).evaluateAll(xs=>xs.map(x=>x.dataset.featureId));
  expect(new Set(items).size).toBe(5);
  const order=await page.locator('main > section').evaluateAll(xs=>xs.map(x=>x.id));
  expect(order.indexOf('marketplace-featured')).toBeLessThan(order.indexOf('marketplace-library'));
  expect(order.indexOf('marketplace-library')).toBeLessThan(order.indexOf('marketplace-stickers'));
  await expect(page.locator('.library-card')).toHaveCount(10);
  await expect(page.locator('.feature-slide')).toHaveCount(8);
  await expect(page.locator('[data-market-sticker]')).toHaveCount(4);
  await expect(page.locator('main button:has-text("Buy"),main button:has-text("Checkout"),main button:has-text("Add to bag")')).toHaveCount(0);
  await expect(page.locator('main')).toContainText('No purchases or payments are available yet');
});
test('Featured five changes after refresh and never duplicates products',async({page})=>{
  await page.goto(BASE+'/marketplace.html',{waitUntil:'domcontentloaded'});
  const before=await page.locator(FEATURED).evaluateAll(xs=>xs.map(x=>x.dataset.featureId));
  await page.reload({waitUntil:'domcontentloaded'});
  const after=await page.locator(FEATURED).evaluateAll(xs=>xs.map(x=>x.dataset.featureId));
  expect(before).not.toEqual(after);
  expect(new Set(after).size).toBe(5);
});
test('Marketplace links resolve to real book records and published character pages',async({page})=>{
  await page.goto(BASE+'/marketplace.html',{waitUntil:'domcontentloaded'});
  const links=await page.locator(FEATURED).evaluateAll(xs=>xs.map(x=>x.getAttribute('href')));
  for(const href of links){expect(href).toMatch(/^(characters\/(gila-monster|commotion|latch|kokio)\/|library\/oldroot-book-(?:10|[1-9])\/)$/);const response=await page.request.get(BASE+'/'+href);expect(response.status(),href).toBe(200);}
  await expect(page.locator('.site-nav > a[href="marketplace.html"]')).toHaveText('Marketplace');
});
test('Marketplace is mobile safe and legacy Library is non-indexed',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto(BASE+'/marketplace.html',{waitUntil:'domcontentloaded'});
  const dims=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:window.innerWidth}));
  expect(dims.scroll).toBeLessThanOrEqual(dims.width+2);
  await page.goto(BASE+'/library.html',{waitUntil:'domcontentloaded'});
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://oldroothq.github.io/project-dorsey-dpi/marketplace.html');
});
