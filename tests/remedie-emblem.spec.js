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
  const badgePosition=await card.evaluate(el=>{
    const cover=el.querySelector('.remedie-art-frame').getBoundingClientRect();
    const image=el.querySelector('.character-thumb').getBoundingClientRect();
    const badge=el.querySelector('.character-card-mark').getBoundingClientRect();
    return {insideCover:badge.left>=cover.left&&badge.top>=cover.top&&badge.right<=cover.right+1&&badge.bottom<=cover.bottom+1,
      insideImage:badge.left>=image.left&&badge.top>=image.top&&badge.right<=image.right+1&&badge.bottom<=image.bottom+1,
      inRightCorner:badge.left>=image.left+image.width/2};
  });
  expect(badgePosition).toEqual({insideCover:true,insideImage:true,inRightCorner:true});
  await expect(card.locator('.remedie-art-frame')).toHaveCount(1);
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


test('original badges stay at original card corners; Remedie alone overlays her portrait',async({page})=>{
  const original=['Gila Monster','Commotion','Aftermark','Anchorage'];
  for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
    await page.setViewportSize(viewport);
    await page.goto(BASE+'/characters.html',{waitUntil:'networkidle'});
    const badges=await page.locator('.character-card:has(.character-card-mark)').evaluateAll(cards=>cards.map(card=>{
      const image=card.querySelector('.character-thumb').getBoundingClientRect();
      const badge=card.querySelector('.character-card-mark');
      const mark=badge.getBoundingClientRect();
      const box=card.getBoundingClientRect();
      const css=getComputedStyle(badge);
      return {name:card.querySelector('h3')?.textContent.trim(),
        position:css.position,zIndex:parseInt(css.zIndex,10),
        hasBadGlobalWrapper:!!card.querySelector('.character-art-shell'),
        originalCardChild:badge.parentElement===card,
        remedieFrame:badge.parentElement.classList.contains('remedie-art-frame'),
        offsetTop:mark.top-box.top,markWidth:mark.width,
        withinPortrait:mark.left>=image.left-1&&mark.top>=image.top-1&&mark.right<=image.right+1&&mark.bottom<=image.bottom+1,
        portraitTop:image.top,cardTop:box.top};
    }));
    expect(badges).toHaveLength(6);
    for(const b of badges){
      expect(b.hasBadGlobalWrapper,b.name).toBe(false);
      expect(b.position,b.name+' must be absolutely positioned').toBe('absolute');
      expect(b.portraitTop-b.cardTop,b.name+' portrait position unaffected').toBeLessThan(85);
    }
    for(const name of original.concat(['Kincast'])){
      const b=badges.find(x=>x.name===name);
      expect(b,name).toBeTruthy();
      expect(b.originalCardChild,name+' must keep original markup').toBe(true);
      expect(b.remedieFrame).toBe(false);
      expect(b.offsetTop,name+' should retain original card top offset').toBeGreaterThanOrEqual(viewport.width<600?19:21);
      expect(b.offsetTop,name+' should retain original card top offset').toBeLessThanOrEqual(viewport.width<600?21:23);
      expect(b.markWidth,name+' should retain original mark size').toBe(viewport.width<600?56:68);
      expect(b.zIndex,name+' original layer').toBe(2);
    }
    const remedie=badges.find(x=>x.name==='Remedie');
    expect(remedie).toBeTruthy();
    expect(remedie.originalCardChild).toBe(false);
    expect(remedie.remedieFrame).toBe(true);
    expect(remedie.withinPortrait).toBe(true);
    expect(remedie.zIndex).toBe(20);
    expect(remedie.markWidth).toBe(viewport.width<600?68:88);
    fs.mkdirSync('artifacts/visual-qa',{recursive:true});
    const card=page.locator('.character-card[href="characters/remedie/"]');
    await card.scrollIntoViewIfNeeded();
    await expect.poll(()=>card.locator('.character-thumb').evaluate(img=>img.naturalWidth)).toBeGreaterThan(0);
    await card.screenshot({path:'artifacts/visual-qa/remedie-corrected-'+viewport.width+'.png',animations:'disabled'});
  }
});
