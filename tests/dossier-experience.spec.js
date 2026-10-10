const { test, expect } = require('@playwright/test');
const fs = require('fs');
const BASE='http://127.0.0.1:8000';
const dossiers=[
  ['gila-monster','GILA MONSTER'],
  ['commotion','COMMOTION'],
  ['aftermark','AFTERMARK'],
  ['kincast','KINCAST'],
  ['anchorage','ANCHORAGE'],
  ['agent-emerald','AGENT EMERALD'],
  ['latch','LATCH'],
  ['kokio','KOKIO']
];

test('all eight canonical dossiers gain cinematic chapters, original art and OPI inspector', async ({ page }) => {
  const pageErrors=[];
  page.on('pageerror', err=>pageErrors.push(err.message));
  for(const [slug,heading] of dossiers){
    await page.goto(BASE+'/characters/'+slug+'/',{waitUntil:'domcontentloaded'});
    const shell=page.locator('main.character-shell');
    await expect(shell).toHaveAttribute('data-dossier',slug);
    await expect(shell.locator('h1')).toHaveText(heading);
    await expect(shell.locator('.dossier-cinematic-hero')).toHaveCount(1);
    await expect(shell.locator('.dossier-cinematic-hero .character-identity')).toHaveCount(1);
    await expect(shell.locator('.dossier-cinematic-hero .character-feature-art')).toHaveCount(1);
    await expect(shell.locator('.dossier-chapter-index')).toHaveCount(1);
    await expect(shell.locator('.dossier-story-thread')).toHaveCount(1);
    expect(await shell.locator('.dossier-thread-stop').count(),slug).toBeGreaterThanOrEqual(3);
    const count=await shell.locator('.lore-column > .wiki-section').count();
    expect(count,slug).toBeGreaterThanOrEqual(6);
    await expect(shell.locator('.dossier-index-scroll a[href^="#chapter-"]')).toHaveCount(count);
    const first=page.locator('.dossier-index-scroll a[href="#chapter-01"]');
    await first.click();
    await expect(page).toHaveURL(/#chapter-01$/);
    await expect(page.locator('#chapter-01')).toHaveCount(1);
    await expect(shell.locator('.dpi-row .dpi-value')).toHaveCount(11);
    await expect(shell.locator('.dossier-opi-inspect')).toHaveCount(11);
    await shell.locator('.dossier-opi-inspect').first().click();
    await expect(shell.locator('.dossier-opi-readout')).toContainText('Strength');
    await expect(shell.locator('.dossier-art-archive')).toHaveCount(1);
    expect(await shell.locator('.dossier-art-tile').count(),slug).toBeGreaterThanOrEqual(2);
    await expect.poll(()=>shell.locator('.character-feature-art-trigger img').evaluate(img=>img.naturalWidth)).toBeGreaterThan(0);
  }
  expect(pageErrors).toEqual([]);
});

test('all eight dossiers preserve the authored profile, OPI baselines and source images', async () => {
  for(const [slug] of dossiers){
    const source=fs.readFileSync('characters/'+slug+'/index.html','utf8');
    expect(source).toContain('character.css?v=27');
    expect(source).toContain('dossier-experience.css?v=4');
    expect(source).toContain('dossier-experience.js?v=4');
    expect(source).toContain('class="dossier-grid"');
    expect(source).toContain('class="character-network"');
    expect(source).toContain('class="character-feature-art-trigger"');
    expect((source.match(/class="dpi-row"/g)||[]).length).toBe(11);
  }
});

test('every dossier keeps the cinematic hero and chapter controls within mobile viewport', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  for(const [slug] of dossiers){
    await page.goto(BASE+'/characters/'+slug+'/',{waitUntil:'domcontentloaded'});
    const width=await page.evaluate(()=>({viewport:innerWidth,
      document:document.documentElement.scrollWidth,body:document.body.scrollWidth}));
    expect(width.document,slug).toBeLessThanOrEqual(width.viewport+2);
    expect(width.body,slug).toBeLessThanOrEqual(width.viewport+2);
    await expect(page.locator('.dossier-hero-issue')).toBeVisible();
    await expect(page.locator('.dossier-chapter-index')).toBeVisible();
    await expect(page.locator('.dossier-art-archive')).toBeVisible();
  }
});

test('visual archive uses established image lightbox and returns focus on close', async ({ page }) => {
  await page.goto(BASE+'/characters/gila-monster/',{waitUntil:'domcontentloaded'});
  const tile=page.locator('.dossier-art-tile').first();
  await tile.click();
  await expect(page.locator('.image-lightbox')).toHaveClass(/open/);
  await page.keyboard.press('Escape');
  await expect(page.locator('.image-lightbox')).not.toHaveClass(/open/);
  await expect(tile).toBeFocused();
});

test('conditional OPI is an optional disclosed reading, never a changed baseline', async ({ page }) => {
  await page.goto(BASE+'/characters/gila-monster/',{waitUntil:'domcontentloaded'});
  const scores=await page.locator('.dpi-grid .dpi-value').allTextContents();
  expect(scores[5]).toBe('22.2');
  const conditional=page.locator('.conditional-box');
  await expect(conditional).toBeHidden();
  const toggle=page.locator('.dossier-condition-button');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded','true');
  await expect(conditional).toBeVisible();
  await expect(conditional).toContainText('Senses — Nocturnal: 31.7');
  expect(await page.locator('.dpi-grid .dpi-value').allTextContents()).toEqual(scores);
});

test('all published hero portraits display at natural brightness without an image gradient or filter', async ({ page }) => {
  test.setTimeout(90000);
  for(const [slug] of dossiers){
    await page.goto(BASE+'/characters/'+slug+'/',{waitUntil:'domcontentloaded'});
    await expect.poll(()=>page.locator('.dossier-cinematic-hero .character-feature-art-trigger img').evaluate(img=>img.naturalWidth),{timeout:12000}).toBeGreaterThan(0);
    const actual=await page.locator('.dossier-cinematic-hero').evaluate(hero=>{
      const figure=hero.querySelector('.character-feature-art');
      const img=hero.querySelector('.character-feature-art-trigger img');
      const after=getComputedStyle(figure,'::after');
      const before=getComputedStyle(figure,'::before');
      return {
        afterDisplay:after.display,
        afterContent:after.content,
        beforeDisplay:before.display,
        opacity:getComputedStyle(img).opacity,
        filter:getComputedStyle(img).filter,
        imageFit:getComputedStyle(img).objectFit,
        loaded:img.naturalWidth>0
      };
    });
    expect(actual.afterDisplay,slug).toBe('none');
    expect(actual.beforeDisplay,slug).toBe('none');
    expect(actual.opacity,slug).toBe('1');
    expect(actual.filter,slug).toBe('none');
    expect(actual.imageFit,slug).toBe('contain');
    expect(actual.loaded,slug).toBe(true);
  }
});

test('art archive and illustrated records are centered, uncropped and balanced on desktop and mobile', async ({ page }) => {
  test.setTimeout(90000);
  for (const width of [1440,390]) {
    await page.setViewportSize({width,height:900});
    for(const [slug] of dossiers){
      await page.goto(BASE+'/characters/'+slug+'/',{waitUntil:'domcontentloaded'});
      const layout=await page.locator('.dossier-art-gallery').evaluate(gallery=>{
        const outer=gallery.getBoundingClientRect();
        const cards=[...gallery.querySelectorAll('.dossier-art-tile')].map(card=>({
          box:card.getBoundingClientRect(),
          fit:getComputedStyle(card.querySelector('img')).objectFit
        }));
        const bottom=Math.max(...cards.map(c=>c.box.top));
        const finalRow=cards.filter(c=>Math.abs(c.box.top-bottom)<2);
        const left=Math.min(...finalRow.map(c=>c.box.left));
        const right=Math.max(...finalRow.map(c=>c.box.right));
        return {
          galleryCenter:outer.left+outer.width/2,
          rowCenter:(left+right)/2,
          imageFits:cards.map(c=>c.fit),
          galleryOverflow:Math.max(...cards.map(c=>c.box.right))-outer.right
        };
      });
      expect(layout.imageFits.every(v=>v==='contain'),slug).toBe(true);
      expect(Math.abs(layout.galleryCenter-layout.rowCenter),slug+' at '+width).toBeLessThanOrEqual(3);
      expect(layout.galleryOverflow,slug+' at '+width).toBeLessThanOrEqual(2);
      const scenes=await page.locator('.dossier-scene').evaluateAll(figures=>figures.map(figure=>{
        const frame=figure.getBoundingClientRect();
        const parent=figure.parentElement.getBoundingClientRect();
        const image=figure.querySelector('img');
        return {
          centerOffset:Math.abs((frame.left+frame.right)/2-(parent.left+parent.right)/2),
          width:frame.width,viewport:innerWidth,fit:image?getComputedStyle(image).objectFit:null
        };
      }));
      for (const [i,scene] of scenes.entries()){
        expect(scene.centerOffset,slug+' scene '+i).toBeLessThanOrEqual(3);
        expect(scene.width,slug+' scene '+i).toBeLessThanOrEqual(scene.viewport);
        if(scene.fit)expect(scene.fit,slug+' scene '+i).toBe('contain');
      }
    }
  }
});

test('Amari Razman publishes her official eleven-category OPI profile', async ({ page }) => {
  await page.goto(BASE+'/characters/amari-razman/',{waitUntil:'domcontentloaded'});
  const shell=page.locator('main.character-shell');
  await expect(shell).toHaveAttribute('data-dossier','amari-razman');
  await expect(shell.locator('h1')).toHaveText('AMARI RAZMAN');
  await expect(shell.locator('.dossier-cinematic-hero')).toHaveCount(1);
  await expect(shell.locator('.dossier-story-thread')).toHaveCount(1);
  await expect(shell.locator('.dossier-thread-stop')).toHaveCount(4);
  await expect(shell.locator('.dossier-chapter-index')).toHaveCount(1);
  await expect(shell.locator('.wiki-section')).toHaveCount(9);
  await expect(shell.locator('.dossier-art-tile')).toHaveCount(7);
  await expect(shell.locator('.dpi-row')).toHaveCount(11);
  await expect(shell.locator('.dossier-opi-inspect')).toHaveCount(11);
  await expect(shell.locator('.dpi-summary')).toContainText('Official OPI · 10.02');
  await expect(shell.locator('.character-infobox')).toContainText('10.02');
  const values=await shell.locator('.dpi-grid .dpi-value').allTextContents();
  expect(values).toEqual(['8.4','7.5','8.8','9.1','5.2','11.4','13.2','12.8','16.4','6.8','10.6']);
  await shell.locator('.dossier-opi-inspect').first().click();
  await expect(shell.locator('.dossier-opi-readout')).toContainText('Strength / 8.4');
  await expect(shell.locator('.character-infobox')).toContainText('January 21, 1993');
  await expect(shell.locator('#chapter-07')).toContainText('Latch Boswell');
  await expect.poll(()=>shell.locator('.character-feature-art-trigger img').evaluate(img=>img.naturalWidth)).toBeGreaterThan(0);
  await shell.locator('.dossier-art-tile').first().click();
  await expect(page.locator('.image-lightbox')).toHaveClass(/open/);
  await page.keyboard.press('Escape');
});

test('Amari’s public OPI is officially 10.02 and White Magma remains development-only', async ({ page }) => {
  await page.goto(BASE+'/dpi.html',{waitUntil:'networkidle'});
  const amari=await page.evaluate(()=>window.OLDROOT_CHARACTERS.find(c=>c.codename==='Amari Razman'));
  expect(amari).toBeTruthy();
  expect(amari.officialOPI).toBe(10.02);
  expect(amari.baseline).toEqual({
    Strength:8.4,Durability:7.5,Speed:8.8,Agility:9.1,Regeneration:5.2,Senses:11.4,
    Offense:13.2,Intellect:12.8,Combat:16.4,Mobility:6.8,Stamina:10.6
  });
  expect(Object.values(amari.baseline).reduce((a,b)=>a+b,0)).toBeCloseTo(110.2,8);
  expect(amari.powerClass).toBeNull();
  expect(amari.conditional).toEqual([]);
  await expect(page.locator('#plot-count')).toContainText('11 plotted');
  await expect(page.locator('#unscored-panel')).toBeHidden();
  await expect(page.locator('[data-unscored-character="Amari Razman"]')).toHaveCount(0);
  await page.locator('#search').fill('Amari Razman');
  await expect(page.locator('#detail')).toContainText('10.02');
  const names=await page.evaluate(()=>window.OLDROOT_CHARACTERS.map(c=>c.codename));
  expect(names).not.toContain('White Magma');
  await page.goto(BASE+'/news.html#upcoming-characters',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#upcoming-characters')).toContainText('White Magma');
});

test("Amari's cinematic presentation fits on phone widths and preserves approved art", async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto(BASE+'/characters/amari-razman/',{waitUntil:'domcontentloaded'});
  await expect(page.locator('.dossier-chapter-index')).toBeVisible();
  await expect(page.locator('.dossier-art-archive')).toBeVisible();
  const widths=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth,body:document.body.scrollWidth}));
  expect(widths.document).toBeLessThanOrEqual(widths.viewport+2);
  expect(widths.body).toBeLessThanOrEqual(widths.viewport+2);
});

test('Ballestera dossier presents full working canon, original art and eleven individual DPI categories', async ({page})=>{
  await page.goto(BASE+'/characters/ballestera/',{waitUntil:'domcontentloaded'});
  const shell=page.locator('main.character-shell');
  await expect(shell).toHaveAttribute('data-dossier','ballestera');
  await expect(shell.locator('h1')).toHaveText('BALLESTERA');
  await expect(shell.locator('.dossier-story-thread')).toHaveCount(1);
  await expect(shell.locator('.dossier-thread-stop')).toHaveCount(5);
  await expect(shell.locator('.wiki-section')).toHaveCount(15);
  await expect(shell.locator('.dossier-art-tile')).toHaveCount(8);
  await expect(shell.locator('.dpi-grid .dpi-value')).toHaveCount(11);
  expect(await shell.locator('.dpi-grid .dpi-value').allTextContents()).toEqual(['0.4','0.6','0.2','0.0','0.3','2.6','5.7','2.9','3.8','0.1','0.2']);
  await expect(shell).toContainText('The figures below describe individual abilities');
  await expect(shell.locator('.character-infobox')).toContainText('November 5');
  await expect(shell.locator('.character-infobox')).toContainText('Approximately 6–8');
  await expect(shell.locator('#chapter-13')).toContainText('Gila Monster');
  await expect.poll(()=>shell.locator('.character-feature-art-trigger img').evaluate(img=>img.naturalWidth)).toBeGreaterThan(0);
  await shell.locator('.dossier-opi-inspect').first().click();
  await expect(shell.locator('.dossier-opi-readout')).toContainText('Strength / 0.4');
  await shell.locator('.dossier-art-tile').first().click();
  await expect(page.locator('.image-lightbox')).toHaveClass(/open/);
  await page.keyboard.press('Escape');
});

test('Ballestera is registrable and plot-safe without any calculated combined score', async ({page})=>{
  await page.goto(BASE+'/dpi.html',{waitUntil:'networkidle'});
  const record=await page.evaluate(()=>window.OLDROOT_CHARACTERS.find(c=>c.codename==='Ballestera'));
  expect(record).toBeTruthy();
  expect(record.classification).toBe('Unaffiliated');
  expect(record.officialOPI).toBeNull();
  expect(record.suppressAggregate).toBe(true);
  expect(record.baseline).toEqual({Strength:0.4,Durability:0.6,Speed:0.2,Agility:0.0,Regeneration:0.3,Senses:2.6,Offense:5.7,Intellect:2.9,Combat:3.8,Mobility:0.1,Stamina:0.2});
  await expect(page.locator('#count')).toHaveText('11 CHARACTERS');
  await expect(page.locator('#plot-count')).toContainText('11 plotted');
  await page.locator('#search').fill('Ballestera');
  await expect(page.locator('#detail')).toContainText('Individual categories only');
  await expect(page.locator('#detail')).not.toContainText('Analytics-only');
  await expect(page.locator('#detail')).not.toContainText('Baseline mean');
});
test('Ballestera dossier and artwork fit on a narrow mobile screen', async ({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto(BASE+'/characters/ballestera/',{waitUntil:'domcontentloaded'});
  await expect(page.locator('.dossier-chapter-index')).toBeVisible();
  await expect(page.locator('.dossier-art-archive')).toBeVisible();
  const x=await page.evaluate(()=>({viewport:innerWidth,html:document.documentElement.scrollWidth,body:document.body.scrollWidth}));
  expect(x.html).toBeLessThanOrEqual(x.viewport+2);
  expect(x.body).toBeLessThanOrEqual(x.viewport+2);
});