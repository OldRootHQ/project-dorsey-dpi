const {test,expect}=require('@playwright/test');
const fs=require('fs');
const BASE='http://127.0.0.1:8000';
for(const [mode,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
 test('inspect Remedie actual rendered website artwork '+mode,async({page})=>{
  test.setTimeout(120000);
  fs.mkdirSync('artifacts/visual-qa',{recursive:true});
  await page.setViewportSize({width,height});
  await page.goto(BASE+'/characters/remedie/',{waitUntil:'networkidle'});
  await page.locator('.logo-slot.has-logo').scrollIntoViewIfNeeded();
  await page.screenshot({path:'artifacts/visual-qa/'+mode+'-remedie-dossier.png',animations:'disabled',fullPage:false});
  const emblem=await page.locator('.logo-slot.has-logo img').evaluate(img=>{
    const a=img.getBoundingClientRect(),p=img.closest('.logo-slot').getBoundingClientRect();
    return {loaded:img.complete,width:img.naturalWidth,height:img.naturalHeight,box:{x:a.x,y:a.y,width:a.width,height:a.height},container:{x:p.x,y:p.y,width:p.width,height:p.height},src:img.src};
  });
  console.log('REMEDIE-DOSSIER-'+mode,JSON.stringify(emblem));
  await page.goto(BASE+'/characters.html',{waitUntil:'networkidle'});
  const card=page.locator('.character-card[href="characters/remedie/"]');
  await card.scrollIntoViewIfNeeded();
  await expect(card.locator('.character-thumb')).toHaveJSProperty('complete',true);
  await expect.poll(()=>card.locator('.character-thumb').evaluate(img=>img.naturalWidth)).toBeGreaterThan(0);
  await page.waitForTimeout(500);
  await card.screenshot({path:'artifacts/visual-qa/'+mode+'-remedie-card.png',animations:'disabled'});
  const cardInfo=await card.evaluate(el=>{
    const rect=e=>{const b=e.getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height,left:b.left,right:b.right,top:b.top,bottom:b.bottom}};
    const a=el.querySelector('.character-card-mark'),b=el.querySelector('.character-thumb');
    return {card:rect(el),mark:rect(a),portrait:rect(b),naturalPortrait:[b.naturalWidth,b.naturalHeight],markLoaded:a.complete,markNatural:[a.naturalWidth,a.naturalHeight],computed:{position:getComputedStyle(a).position,right:getComputedStyle(a).right,top:getComputedStyle(a).top}};
  });
  console.log('REMEDIE-CARD-'+mode,JSON.stringify(cardInfo));
  expect(cardInfo.mark.left).toBeGreaterThanOrEqual(cardInfo.card.left);
  expect(cardInfo.mark.right).toBeLessThanOrEqual(cardInfo.card.right+2);
  expect(cardInfo.portrait.width).toBeGreaterThan(200);
 });
}
