const { test, expect } = require('@playwright/test');
const BASE = 'http://127.0.0.1:8000';

test('Living Comic homepage leads with eight approved-identity panels', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await expect(page.locator('body')).toHaveClass(/home-living-comic/);
  await expect(page.locator('.lc-hero')).toBeVisible();
  await expect(page.locator('.lc-hero')).toContainText('EXTRAORDINARY PEOPLE.');
  await expect(page.locator('.lc-hero')).toContainText('UNFORGETTABLE STORIES.');
  await expect(page.locator('.lc-face')).toHaveCount(8);
  await expect(page.locator('.lc-face img')).toHaveCount(8);
  await expect(page.locator('.lc-face--pending')).toHaveCount(0);
  await expect(page.locator('.lc-face[data-approved-art="true"]')).toHaveCount(8);
  await expect(page.locator('.lc-wordmark[data-approved-logo="true"]')).toHaveCount(1);
  const directSources = await page.locator('.lc-face img').evaluateAll(images =>
    images.map(img => img.getAttribute('src'))
  );
  expect(directSources).toEqual([
    'assets/approved-home/kincast.webp',
    'assets/approved-home/anchorage.webp',
    'assets/approved-home/isiah-ivory.webp',
    'assets/approved-home/liontone.webp',
    'assets/approved-home/agent-emerald.webp',
    'assets/approved-home/remedie.webp',
    'assets/approved-home/flying-saucer.webp',
    'assets/approved-home/gila-monster.webp'
  ]);
  await expect(page.locator('.lc-face-name')).toHaveText([
    'Kincast','Anchorage','Isiah Ivory','Liontone',
    'Agent Emerald','Remedie','Flying Saucer','Gila Monster'
  ]);
  await expect(page.locator('.lc-hero-actions a')).toHaveCount(3);
  await expect(page.locator('.editorial-hero')).toHaveCount(0);

  const checked = await page.locator('.lc-face img').evaluateAll(images =>
    images.map(img => ({ src: img.getAttribute('src'), loaded: img.complete && img.naturalWidth > 0 }))
  );
  expect(checked.every(item => item.loaded), JSON.stringify(checked)).toBe(true);

  const cols = await page.locator('.lc-face-grid').evaluate(el =>
    getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length
  );
  expect(cols).toBe(4);
  // Approved palette deliberately avoids adjacent green and warm-orange panels.
  const shades = await page.locator('.lc-face').evaluateAll(elements =>
    elements.map(el => el.style.getPropertyValue('--panel-shade').trim().toLowerCase())
  );
  expect(shades).toEqual([
    '#c57a45','#174b9a','#a51f30','#34814b',
    '#123f30','#e3ae38','#7843ab','#e97627'
  ]);
  await expect(page.locator('.lc-face-flag')).toHaveCount(0);

  await expect(page.locator('#techGlobe')).toHaveCount(0);
  await expect(page.locator('#issue-one')).toContainText('IN DEVELOPMENT');
});

test('Living Comic eight-panel homepage reflows within a phone viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  const layout = await page.evaluate(() => ({
    viewport: innerWidth,
    htmlWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
    cols: getComputedStyle(document.querySelector('.lc-face-grid')).gridTemplateColumns.split(' ').filter(Boolean).length,
    ctaCount: [...document.querySelectorAll('.lc-hero-actions a')].filter(a => a.getBoundingClientRect().width > 0).length,
  }));
  expect(layout.htmlWidth).toBeLessThanOrEqual(layout.viewport + 2);
  expect(layout.bodyWidth).toBeLessThanOrEqual(layout.viewport + 2);
  expect(layout.cols).toBe(2);
  expect(layout.ctaCount).toBe(3);
});

test('Locations retains the original interactive globe while adopting editorial shell', async ({ page }) => {
  await page.goto(BASE + '/locations.html', { waitUntil: 'networkidle' });
  await expect(page.locator('body')).toHaveClass(/locations-living-comic/);
  await expect(page.locator('#techGlobe')).toBeVisible();
  await expect(page.locator('#earthView')).toBeVisible();
  await expect(page.locator('#zoomInGlobe')).toBeVisible();
  await expect(page.locator('.locations-cosmic-copy')).toContainText('Every hero has a hometown');
});


for (const [mode, width] of [['desktop', 1440], ['mobile', 390]]) {
  test(`Rotating character spotlight has visible art, tabs, arrows and a fresh refresh lead (${mode})`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    const slides = page.locator('#homeCharacterTrack .home-character-slide');
    const tabs = page.locator('#homeCharacterTabs button[role="tab"]');
    await expect(slides).toHaveCount(3);
    await expect(tabs).toHaveCount(3);
    await expect(slides.locator('.home-character-art img')).toHaveCount(3);
    const names = await tabs.allTextContents();
    expect(new Set(names).size).toBe(3);
    await expect(slides.nth(0)).toHaveClass(/active/);
    await expect(slides.nth(0).locator('.home-character-copy h3')).toHaveText(names[0]);
    await expect(page.locator('#homeCharacterCounter')).toHaveText('1 / 3');

    // Each approved featured image must decode rather than leave an empty panel.
    await expect.poll(async () => slides.locator('.home-character-art img').evaluateAll(
      images => images.every(img => img.complete && img.naturalWidth > 0 && img.naturalHeight > 0)
    )).toBe(true);

    const pause = page.locator('#homeCharacterPause');
    await pause.click();
    await expect(pause).toHaveAttribute('aria-pressed', 'true');

    await page.locator('#homeCharacterNext').click();
    await expect(page.locator('#homeCharacterCounter')).toHaveText('2 / 3');
    await expect(slides.nth(1)).toHaveClass(/active/);
    await expect(slides.nth(1).locator('.home-character-copy h3')).toHaveText(names[1]);

    await tabs.nth(2).click();
    await expect(slides.nth(2)).toHaveClass(/active/);
    await expect(page.locator('#homeCharacterCounter')).toHaveText('3 / 3');

    await page.locator('#homeCharacterPrev').click();
    await expect(slides.nth(1)).toHaveClass(/active/);
    await expect(page.locator('#homeCharacterCounter')).toHaveText('2 / 3');

    const leadBeforeRefresh = names[0];
    await page.reload({ waitUntil: 'networkidle' });
    await expect(tabs).toHaveCount(3);
    const leadAfterRefresh = (await tabs.first().textContent()).trim();
    expect(leadAfterRefresh).not.toBe(leadBeforeRefresh);
  });
}


for(const [mode,width] of [['desktop',1440],['mobile',390]]){
  test(`Latest Dispatch displays the approved sticker instead of a green empty panel (${mode})`,async({page})=>{
    await page.setViewportSize({width,height:900});
    await page.goto(BASE+'/',{waitUntil:'networkidle'});
    const dispatch=page.locator('#homeLatestDispatch');
    await expect(dispatch).toBeVisible();
    await expect(dispatch.locator('[data-dispatch-title]')).toContainText('Liontone');
    const image=dispatch.locator('.dispatch-feature-art');
    await expect(image).toBeVisible();
    await expect(image).toHaveAttribute('src','assets/characters/liontone/liontone-ruins.webp');
    await expect(image).toHaveAttribute('alt',/Liontone.*guardian armor/);
    await expect.poll(()=>image.evaluate(el=>el.complete&&el.naturalWidth>0&&el.naturalHeight>0)).toBe(true);
    await expect(dispatch.locator('.dispatch-copy')).toHaveCSS('color','rgb(250, 255, 252)');
    await expect(dispatch.locator('.dispatch-copy h2')).toHaveCSS('color','rgb(250, 255, 252)');
    await expect(dispatch.locator('.dispatch-copy p')).toHaveCSS('color','rgb(213, 222, 211)');
    const box=await image.boundingBox();
    expect(box.width).toBeGreaterThan(120);
    expect(box.height).toBeGreaterThan(120);
    await expect(dispatch.locator('a[data-dispatch-link]')).toHaveAttribute('href','news.html#or-web-0102');
  });
}


for (const [mode,width,height] of [['desktop',1440,900],['mobile',390,844]]) {
  test(`Approved eight-character portrait grid preserves head-safe top crop (${mode})`,async({page})=>{
    await page.setViewportSize({width,height});
    await page.goto(BASE+'/',{waitUntil:'networkidle'});
    const portraits=page.locator('.lc-face-grid .lc-face');
    await expect(portraits).toHaveCount(8);
    const inspected=await portraits.evaluateAll(cards=>cards.map(card=>{
      const img=card.querySelector('img');
      const style=getComputedStyle(img);
      return {
        id:card.dataset.portrait,
        src:img.getAttribute('src'),
        naturalWidth:img.naturalWidth,
        naturalHeight:img.naturalHeight,
        fit:style.objectFit,
        position:style.objectPosition,
        translate:style.translate
      };
    }));
    expect(inspected.map(x=>x.id)).toEqual([
      'kincast','anchorage','isiah-ivory','liontone',
      'agent-emerald','remedie','flying-saucer','gila-monster'
    ]);
    for(const portrait of inspected){
      expect(portrait.src).toBe(`assets/approved-home/${portrait.id}.webp`);
      expect(portrait.naturalWidth).toBeGreaterThan(0);
      expect(portrait.naturalHeight).toBeGreaterThan(0);
      expect(portrait.fit).toBe('cover');
      expect(portrait.position.split(' ').at(-1)).toMatch(/^(top|0%)$/);
    }
    const remy=inspected.find(x=>x.id==='agent-emerald');
    expect(remy.naturalWidth).toBeGreaterThanOrEqual(1024);
    expect(remy.naturalHeight).toBeGreaterThanOrEqual(1536);
    await expect(page.locator('.lc-face-grid [data-portrait="agent-emerald"] img')).toHaveCSS(
      'scale',mode==='desktop'?'1.12':'1.08'
    );
    await expect(page.locator('.lc-face-grid [data-portrait="agent-emerald"] img')).toHaveCSS(
      'transform-origin',mode==='desktop'
        ? /.+ 0px$/
        : /.+ 0px$/
    );
    for(const id of ['isiah-ivory','liontone']){
      const portrait=inspected.find(x=>x.id===id);
      if(mode==='desktop')expect(portrait.translate).toMatch(/7px$/);
      else expect(portrait.translate).toBe('none');
    }
  });
}
