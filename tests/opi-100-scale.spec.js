const { test, expect } = require('@playwright/test');

const BASE = 'http://127.0.0.1:8000';
const CATEGORIES = ['Strength', 'Durability', 'Speed', 'Agility', 'Regeneration', 'Senses', 'Offense', 'Intellect', 'Combat', 'Mobility', 'Stamina'];

test('OPI Analytics has fixed 0–100 category axes without modifying creator ratings', async ({ page }) => {
  await page.goto(BASE + '/dpi.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#x-metric')).toHaveValue('Offense');
  await expect(page.locator('#y-metric')).toHaveValue('Durability');
  const ticks = await page.locator('#chart .tick').allTextContents();
  for (const tick of ['0', '20', '40', '60', '80', '100']) expect(ticks).toContain(tick);
  expect(ticks).not.toContain('50');
  const records = await page.evaluate(() => window.OLDROOT_CHARACTERS);
  expect(records).toHaveLength(12);
  const scored = records.filter(c => !c.opiExcluded);
  expect(scored).toHaveLength(11);
  for (const character of scored) {
    expect(Object.keys(character.baseline)).toEqual(CATEGORIES);
    for (const number of Object.values(character.baseline)) expect(number).toBeGreaterThanOrEqual(0);
    for (const number of Object.values(character.baseline)) expect(number).toBeLessThanOrEqual(100);
  }
  expect(records.find(c => c.codename === 'Gila Monster').baseline.Durability).toBe(40.0);
  expect(records.find(c => c.codename === 'Anchorage').baseline.Durability).toBe(55.5);
  const amari = records.find(c => c.codename === 'Amari Razman');
  expect(amari.opiExcluded).toBe(true);
  expect(amari).not.toHaveProperty('baseline');
  for (const c of scored) {
    expect(c).not.toHaveProperty('officialOPI');
    expect(c).not.toHaveProperty('suppressAggregate');
  }
  expect(records.find(c => c.codename === 'Agent Emerald').conditional).toEqual([
    {category:'Senses',condition:'Precision Pill Active',value:16.1}
  ]);
});

test('Every scored OPI dossier matches the approved Patch 1.0 values and 0–100 bars', async ({ page }) => {
  test.setTimeout(90000);
  await page.goto(BASE + '/dpi.html', { waitUntil: 'domcontentloaded' });
  const records = await page.evaluate(() => window.OLDROOT_CHARACTERS);
  for (const character of records.filter(c => !c.opiExcluded)) {
    await page.goto(BASE + '/' + character.page, { waitUntil: 'domcontentloaded' });
    const rows = await page.locator('.dpi-row').evaluateAll(elements => elements.map(row => ({
      category: row.querySelector('.dpi-name').textContent.trim(),
      value: Number(row.querySelector('.dpi-value').textContent.trim()),
      percent: parseFloat(row.querySelector('.dpi-fill').style.getPropertyValue('--score'))
    })));
    expect(rows, character.codename + ' should have exactly 11 metrics').toHaveLength(11);
    expect(rows.map(r => r.category)).toEqual(CATEGORIES);
    for (const row of rows) {
      expect(row.value, character.codename + ' ' + row.category).toBe(character.baseline[row.category]);
      expect(row.percent, character.codename + ' ' + row.category + ' percentage').toBeCloseTo(row.value, 4);
    }
  }
});

test('Gila totals and averages agree on registry, dossier and Analytics', async ({ page }) => {
  await page.goto(BASE + '/characters.html', { waitUntil: 'domcontentloaded' });
  const card = page.locator('.character-card').filter({has:page.locator('h3', {hasText:'Gila Monster'})});
  await expect(card).toContainText('Baseline mean 23.13');
  await expect(card).not.toContainText('17.67');
  await page.goto(BASE + '/characters/gila-monster/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.dpi-summary')).toContainText('Baseline total · 254.4');
  await expect(page.locator('.dpi-summary')).toContainText('Baseline mean · 23.13');
  await expect(page.locator('.character-infobox')).toContainText('23.13 · analytics only');
  await page.goto(BASE + '/dpi.html', { waitUntil: 'domcontentloaded' });
  const sum = await page.evaluate(() => {
    const c = window.OLDROOT_CHARACTERS.find(c => c.codename === 'Gila Monster');
    return Object.values(c.baseline).reduce((a,b) => a + b, 0);
  });
  expect(sum).toBeCloseTo(254.4, 4);
  expect(sum / 11).toBeCloseTo(23.13, 2);
});

test('0–100 chart remains readable and inside the viewport on desktop and phones', async ({ page }) => {
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(BASE + '/dpi.html', { waitUntil: 'domcontentloaded' });
    const measure = await page.evaluate(() => {
      const chart = document.querySelector('#chart');
      const rect = chart.getBoundingClientRect();
      return {
        screen: innerWidth, overflow: document.documentElement.scrollWidth,
        svgWidth: chart.viewBox.baseVal.width, displayedWidth: rect.width,
        colorLegendVisible: !document.querySelector('#mobile-chart-legend').hidden,
        ticks: [...chart.querySelectorAll('.tick')].map(t => t.textContent)
      };
    });
    expect(measure.overflow, 'horizontal overflow at ' + width).toBeLessThanOrEqual(width + 2);
    expect(measure.svgWidth, 'SVG sizing at ' + width).toBeCloseTo(measure.displayedWidth, 0);
    expect(measure.ticks).toContain('100');
    expect(measure.colorLegendVisible).toBe(width < 600);
  }
});


test('desktop OPI keeps chart and character detail side by side', async ({ page }) => {
  await page.setViewportSize({width:1440,height:900});
  await page.goto(BASE + '/dpi.html',{waitUntil:'domcontentloaded'});
  await expect(page.locator('.chart-panel')).toBeVisible();
  await expect(page.locator('.detail-panel')).toBeVisible();
  await expect(page.locator('#mobile-zoom-in')).toBeHidden();
  await expect(page.locator('#mobile-back-to-chart')).toBeHidden();
  await page.locator('#chart g[role="button"][aria-label^="Gila Monster,"]').click();
  await expect(page.locator('#detail .name')).toHaveText('Gila Monster');
  await expect(page.locator('.chart-panel')).toBeVisible();
  await expect(page.locator('.detail-panel')).toBeVisible();
});

test('mobile OPI opens a standalone character profile and returns to the same chart', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto(BASE + '/dpi.html',{waitUntil:'domcontentloaded'});
  await expect(page.locator('.chart-panel')).toBeVisible();
  await expect(page.locator('.detail-panel')).toBeHidden();
  await expect(page.locator('#mobile-zoom-in')).toBeVisible();
  const before=await page.locator('#chart').getAttribute('viewBox');
  await page.locator('#mobile-zoom-in').click();
  const zoomed=await page.locator('#chart').getAttribute('viewBox');
  expect(zoomed).not.toBe(before);
  await page.locator('#mobile-zoom-reset').click();
  await page.locator('#chart g[role="button"][aria-label^="Gila Monster,"]').click();
  await expect(page.locator('.chart-panel')).toBeHidden();
  await expect(page.locator('.detail-panel')).toBeVisible();
  await expect(page.locator('#detail .name')).toHaveText('Gila Monster');
  await expect(page.locator('#detail .stat')).toHaveCount(11);
  await expect(page.locator('#detail a.dossier-link')).toHaveAttribute('href','characters/gila-monster/');
  await page.locator('#mobile-back-to-chart').click();
  await expect(page.locator('.chart-panel')).toBeVisible();
  await expect(page.locator('.detail-panel')).toBeHidden();
  expect(await page.locator('#chart').getAttribute('viewBox')).toBe(before);
});

test('pinch gestures zoom the mobile graph and finger drag pans without changing OPI data', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto(BASE + '/dpi.html',{waitUntil:'domcontentloaded'});
  const state=await page.locator('#chart').evaluate(svg=>{
    const make=(id,x,y)=>new Touch({identifier:id,target:svg,clientX:x,clientY:y});
    const send=(type,touches)=>svg.dispatchEvent(new TouchEvent(type,{
      touches, targetTouches:touches,changedTouches:touches,bubbles:true,cancelable:true
    }));
    const rect=svg.getBoundingClientRect(),y=rect.top+rect.height*.65;
    const start=svg.viewBox.baseVal.width;
    send('touchstart',[make(0,rect.left+100,y),make(1,rect.left+180,y)]);
    send('touchmove',[make(0,rect.left+60,y),make(1,rect.left+220,y)]);
    const afterPinch={x:svg.viewBox.baseVal.x,y:svg.viewBox.baseVal.y,w:svg.viewBox.baseVal.width};
    send('touchend',[]);
    send('touchstart',[make(0,rect.left+180,y)]);
    send('touchmove',[make(0,rect.left+130,y+25)]);
    const afterPan={x:svg.viewBox.baseVal.x,y:svg.viewBox.baseVal.y,w:svg.viewBox.baseVal.width};
    send('touchend',[]);
    return {start,afterPinch,afterPan};
  });
  expect(state.afterPinch.w).toBeLessThan(state.start);
  expect(state.afterPan.w).toBeCloseTo(state.afterPinch.w,4);
  expect(state.afterPan.x!==state.afterPinch.x||state.afterPan.y!==state.afterPinch.y).toBe(true);
  const gila=await page.evaluate(()=>window.OLDROOT_CHARACTERS.find(c=>c.codename==='Gila Monster'));
  expect(gila.baseline.Durability).toBe(40.0);
});

test('mobile OPI navigation does not overflow a narrow phone, and desktop layout restores on resize', async ({ page }) => {
  await page.setViewportSize({width:320,height:720});
  await page.goto(BASE + '/dpi.html',{waitUntil:'domcontentloaded'});
  await expect(page.locator('.detail-panel')).toBeHidden();
  await page.locator('#mobile-zoom-in').click();
  await page.locator('#mobile-zoom-in').click();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  expect(overflow).toBeLessThanOrEqual(2);
  await page.setViewportSize({width:1440,height:900});
  await expect(page.locator('.chart-panel')).toBeVisible();
  await expect(page.locator('.detail-panel')).toBeVisible();
  await expect(page.locator('#mobile-zoom-in')).toBeHidden();
  const view=await page.locator('#chart').getAttribute('viewBox');
  expect(view.split(' ').map(Number).slice(0,2)).toEqual([0,0]);
});
