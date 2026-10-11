const {test,expect}=require('@playwright/test');
const fs=require('fs');
const BASE='http://127.0.0.1:8000';
const MARK='assets/characters/remedie/remedie-emblem.svg?v=1';

test('Remedie dossier displays the creator-approved dark-gold sticker emblem without replacing her original artwork',async({page})=>{
  await page.goto(BASE+'/characters/remedie/',{waitUntil:'networkidle'});
  const emblem=page.locator('.logo-slot.has-logo .character-logo');
  await expect(emblem).toHaveAttribute('src','../../'+MARK);
  await expect(emblem).toHaveAttribute('width','720');
  await expect.poll(()=>emblem.evaluate(img=>img.naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator('.character-feature-art img')).toHaveAttribute('src','../../assets/characters/remedie/remedie-featured.webp');
  await expect(page.locator('.character-portrait img')).toHaveAttribute('src','../../assets/characters/remedie/remedie-registry.webp');
  await expect(page.locator('.dossier-art-gallery .dossier-illustration')).toHaveCount(7);
});

test('Remedie emblem appears in character registry and Start Here with original portrait preserved',async({page})=>{
  await page.goto(BASE+'/characters.html');
  const card=page.locator('.character-card[href="characters/remedie/"]');
  await expect(card.locator('.character-card-mark')).toHaveAttribute('src',MARK);
  const place=await card.evaluate(el=>{
    const photo=el.querySelector('.character-thumb').getBoundingClientRect();
    const row=el.querySelector('.character-identity-row').getBoundingClientRect();
    const mark=el.querySelector('.character-card-mark').getBoundingClientRect();
    return {belowPhoto:mark.top>=photo.bottom+1,
      inTextRow:mark.top>=row.top-1&&mark.bottom<=row.bottom+1,
      sameLine:Math.abs(mark.top-row.top)<2,
      iconOnRight:mark.left>row.left+row.width/2};
  });
  expect(place).toEqual({belowPhoto:true,inTextRow:true,sameLine:true,iconOnRight:true});
  await expect(card.locator('.character-identity-row')).toHaveCount(1);
  await expect(card.locator('.remedie-art-frame')).toHaveCount(0);
  await expect(card.locator('.character-art-shell')).toHaveCount(0);
  await expect(card.locator('.character-thumb')).toHaveAttribute('src','assets/characters/remedie/remedie-registry.webp');
  await page.goto(BASE+'/start-here.html');
  await expect(page.locator('a[href="characters/remedie/"] .start-character-mark')).toHaveAttribute('src',MARK);
});

test('Remedie emblem is offered by the homepage spotlight and OPI Analytics',async({page})=>{
  await page.goto(BASE+'/');
  expect(await page.evaluate(()=>window.OLDROOT_HOME.characterSpotlights.Remedie.mark)).toBe(MARK);
  await page.goto(BASE+'/dpi.html');
  expect(await page.evaluate(()=>window.OLDROOT_CHARACTERS.find(c=>c.codename==='Remedie').mark)).toBe(MARK);
  await page.locator('#search').fill('Remedie');
  await expect(page.locator('.detail-mark')).toHaveAttribute('src',MARK);
  await expect(page.locator('.detail-portrait')).toHaveAttribute('src','assets/characters/remedie/remedie-registry.webp');
});

test('Remedie SVG contains alpha-transparent approved sticker artwork and fits phone widths',async({page})=>{
  const svg=fs.readFileSync('assets/characters/remedie/remedie-emblem.svg','utf8');
  expect(svg).toContain('viewBox="0 0 720 720"');
  expect(svg).toContain('mustard turtleneck');
  const match=svg.match(/data:image\/webp;base64,([A-Za-z0-9+/=]+)/);
  expect(match).not.toBeNull();
  const bytes=Buffer.from(match[1],'base64');
  expect(bytes.toString('ascii',0,4)).toBe('RIFF');
  expect(bytes.toString('ascii',8,12)).toBe('WEBP');
  expect(bytes.includes(Buffer.from('ALPH'))).toBe(true);
  const res=await page.request.get(BASE+'/assets/characters/remedie/remedie-emblem.svg');
  expect(res.ok()).toBe(true);
  await page.setViewportSize({width:390,height:844});
  for(const path of ['/characters/remedie/','/characters.html','/start-here.html','/dpi.html']){
    await page.goto(BASE+path,{waitUntil:'domcontentloaded'});
    const dims=await page.evaluate(()=>({viewport:innerWidth,scroll:document.documentElement.scrollWidth}));
    expect(dims.scroll,path).toBeLessThanOrEqual(dims.viewport+2);
  }
});


test('all nine registry emblems occupy the same below-image text position on desktop and mobile',async({page})=>{
  const names=['Gila Monster','Commotion','Aftermark','Anchorage','Kincast','Remedie','Agent Emerald','Latch','Kokio'];
  for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
    await page.setViewportSize(viewport);
    await page.goto(BASE+'/characters.html',{waitUntil:'networkidle'});
    const cards=await page.locator('.character-card:has(.character-card-mark)').evaluateAll(nodes=>nodes.map(card=>{
      const img=card.querySelector('.character-thumb');
      const badge=card.querySelector('.character-card-mark');
      const row=card.querySelector('.character-identity-row');
      const copy=card.querySelector('.character-identity-copy');
      if(!row||!copy||!img||!badge)return {name:card.querySelector('h3')?.textContent.trim(),missing:true};
      const photo=img.getBoundingClientRect(),b=badge.getBoundingClientRect(),r=row.getBoundingClientRect(),t=copy.getBoundingClientRect();
      return {name:card.querySelector('h3')?.textContent.trim(),
        missing:false,
        withinRow:badge.parentElement===row&&copy.parentElement===row,
        static: getComputedStyle(badge).position==='static',
        belowImage:b.top>=photo.bottom+1,
        besideText:b.left>=t.right-1,
        aboveCardBottom:b.bottom<=card.getBoundingClientRect().bottom+1,
        rightAligned:Math.abs(b.right-r.right)<2,
        topAligned:Math.abs(b.top-r.top)<2,
        width:Math.round(b.width),height:Math.round(b.height),
        portraitSource:img.getAttribute('src')};
    }));
    expect(cards.map(x=>x.name).sort()).toEqual([...names].sort());
    for(const c of cards){
      expect(c.missing,c.name).toBe(false);
      expect(c.withinRow,c.name+' identity row').toBe(true);
      expect(c.static,c.name+' emblem must NOT be an image overlay').toBe(true);
      expect(c.belowImage,c.name+' emblem must be below the portrait').toBe(true);
      expect(c.besideText,c.name+' emblem must sit beside identity text').toBe(true);
      expect(c.rightAligned,c.name+' same right alignment').toBe(true);
      expect(c.topAligned,c.name+' same vertical alignment').toBe(true);
      expect(c.aboveCardBottom,c.name+' contained by card').toBe(true);
      expect(c.width,c.name+' shared icon width').toBe(viewport.width<600?56:68);
      expect(c.height,c.name+' shared icon height').toBe(viewport.width<600?56:68);
    }
    expect(cards.find(c=>c.name==='Remedie').portraitSource).toBe('assets/characters/remedie/remedie-registry.webp');
    fs.mkdirSync('artifacts/visual-qa',{recursive:true});
    for(const name of ['Remedie','Kincast','Gila Monster']){
      const card=page.locator('.character-card').filter({has:page.locator('h3', {hasText:name})}).first();
      await card.scrollIntoViewIfNeeded();
      await expect.poll(()=>card.locator('.character-thumb').evaluate(img=>img.naturalWidth)).toBeGreaterThan(0);
      await card.screenshot({path:'artifacts/visual-qa/below-image-'+name.toLowerCase().replace(/\s+/g,'-')+'-'+viewport.width+'.png',animations:'disabled'});
    }
  }
});
