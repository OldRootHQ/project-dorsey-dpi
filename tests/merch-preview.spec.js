const {test,expect}=require('@playwright/test');
const BASE='http://127.0.0.1:8000';
const wave=['gila-monster','commotion','latch','kokio'];
const reserve=['aftermark','kincast','anchorage','agent-emerald','remedie'];
test('sticker preview shows four first-wave products and five reserved designs, never a fake checkout', async({page})=>{
  await page.goto(BASE+'/merch.html',{waitUntil:'domcontentloaded'});
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/);
  await expect(page.locator('[data-merch-wave="first"] [data-merch-character]')).toHaveCount(4);
  await expect(page.locator('[data-merch-wave="reserve"] [data-merch-character]')).toHaveCount(5);
  await expect(page.locator('[data-merch-character]')).toHaveCount(9);
  await expect(page.locator('body')).toContainText('NO ORDERS OR PAYMENTS ACCEPTED');
  await expect(page.locator('body')).toContainText('Deuce');
  await expect(page.locator('[data-merch-character="deuce"]')).toHaveCount(0);
  await expect(page.locator('main button')).toHaveCount(0);
  await expect(page.locator('main a[href*="checkout"],main a[href*="cart.html"],main [data-buy]')).toHaveCount(0);
  for(const slug of [...wave,...reserve]){
    const card=page.locator('[data-merch-character="'+slug+'"]');
    await expect(card.locator('img')).toHaveAttribute('src',new RegExp('^assets/characters/'+slug+'/.*-emblem\\.svg$'));
    await expect(card.locator('a')).toHaveAttribute('href','characters/'+slug+'/');
    await expect.poll(()=>card.locator('img').evaluate(el=>el.naturalWidth)).toBeGreaterThan(0);
  }
});
test('prelaunch collection retains mobile layout without overflow',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto(BASE+'/merch.html',{waitUntil:'domcontentloaded'});
  const d=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
  expect(d.scroll).toBeLessThanOrEqual(d.width+2);
  await expect(page.locator('[data-merch-wave="first"] [data-merch-character]')).toHaveCount(4);
});
