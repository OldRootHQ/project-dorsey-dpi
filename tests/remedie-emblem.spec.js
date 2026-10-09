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
  await expect(card.locator('.character-art-shell')).toHaveCount(1);
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


test('registry artwork and all official marks share the same card corner at desktop and phone sizes',async({page})=>{
  for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
    await page.setViewportSize(viewport);
    await page.goto(BASE+'/characters.html',{waitUntil:'networkidle'});
    const badges=await page.locator('.character-card:has(.character-card-mark)').evaluateAll(cards=>cards.map(card=>{
      const image=card.querySelector('.character-thumb');
      const badge=card.querySelector('.character-card-mark');
      const box=card.getBoundingClientRect();
      const cover=image.getBoundingClientRect();
      const mark=badge.getBoundingClientRect();
      const css=getComputedStyle(badge);
      return {name:card.querySelector('h3')?.textContent.trim(),
        withinArtShell:badge.closest('.character-art-shell')===image.parentElement,
        position:css.position,
        cardTop:box.top,coverTop:cover.top,coverRight:cover.right,coverBottom:cover.bottom,
        markTop:mark.top,markLeft:mark.left,markRight:mark.right,markBottom:mark.bottom,
        coverWidth:cover.width,markWidth:mark.width};
    }));
    expect(badges.length).toBeGreaterThanOrEqual(5);
    for(const b of badges){
      expect(b.withinArtShell,b.name+' badge must share its portrait container').toBe(true);
      expect(b.position,b.name+' badge must be absolutely positioned').toBe('absolute');
      expect(b.coverTop-b.cardTop,b.name+' portrait must remain first in the card').toBeLessThan(55);
      expect(b.markTop,b.name+' badge must overlay, not sit above portrait').toBeGreaterThanOrEqual(b.coverTop);
      expect(b.markTop-b.coverTop,b.name+' badge should sit near portrait top').toBeLessThan(32);
      expect(b.markLeft,b.name+' badge must sit in right image corner').toBeGreaterThanOrEqual(b.coverRight-145);
      expect(b.markRight,b.name+' badge must remain inside portrait edge').toBeLessThanOrEqual(b.coverRight+1);
      expect(b.markBottom,b.name+' badge should stay inside portrait').toBeLessThan(b.coverBottom);
      expect(b.coverWidth).toBeGreaterThan(230);
    }
    const remedie=badges.find(x=>x.name==='Remedie');
    expect(remedie).toBeTruthy();
    expect(remedie.markWidth).toBeGreaterThanOrEqual(viewport.width<600?65:85);
    fs.mkdirSync('artifacts/visual-qa',{recursive:true});
    const card=page.locator('.character-card[href="characters/remedie/"]');
    await card.scrollIntoViewIfNeeded();
    await expect.poll(()=>card.locator('.character-thumb').evaluate(img=>img.naturalWidth)).toBeGreaterThan(0);
    await card.screenshot({path:'artifacts/visual-qa/remedie-registry-fixed-'+viewport.width+'.png',animations:'disabled'});
  }
});
