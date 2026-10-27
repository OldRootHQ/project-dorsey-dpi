const { test, expect } = require('@playwright/test');

const BASE = 'http://127.0.0.1:8000';
const LIME = 'rgb(183, 207, 138)';
const WHITE = 'rgb(250, 255, 252)';

for(const [name,route] of [
  ['home','/'],
  ['characters','/characters.html'],
  ['Remedie dossier','/characters/remedie/'],
  ['locations','/locations.html'],
  ['lore','/lore.html'],
  ['dispatches','/news.html'],
  ['marketplace','/marketplace.html']
]){
  test(`HQ 2.4 soft-avocado variables and unchanged cosmic-carbon base reach ${name}`,async({page})=>{
    await page.goto(BASE+route,{waitUntil:'networkidle'});
    const style=await page.evaluate(()=>{
      const body=getComputedStyle(document.body);
      return {
        lime:body.getPropertyValue('--or-lime').trim(),
        white:body.getPropertyValue('--or-comic-white').trim(),
        background:body.backgroundImage,
        carbon:body.getPropertyValue('--or-composite').trim(),
        before:getComputedStyle(document.body,'::before').display
      };
    });
    expect(style.lime).toBe('#B7CF8A');
    expect(style.white).toBe('#FAFFFC');
    expect(style.background).toContain('oldroot-cosmic-field.svg');
    expect(style.carbon).toContain('repeating-linear-gradient');
    expect(style.before).toBe('none'); // no background graffiti / old roots
    await expect(page.locator('.masthead .brand')).toBeVisible();
    await expect(page.locator('.masthead')).toHaveCSS('border-bottom-color',LIME);
  });
}

for(const [name,width,height] of [['desktop',1440,900],['mobile',390,844]]){
  test(`HQ 2.4 homepage accents, image masters and contact CTA (${name})`,async({page})=>{
    await page.setViewportSize({width,height});
    await page.goto(BASE+'/',{waitUntil:'networkidle'});
    await expect(page.locator('.lc-tagline span')).toHaveCSS('color',LIME);
    if (width <= 900) {
      // On mobile the approved logo floats naturally without its old plaque frame.
      await expect(page.locator('.lc-wordmark')).toHaveCSS('border-top-width', '0px');
    } else {
      await expect(page.locator('.lc-wordmark')).toHaveCSS('border-top-color',LIME);
    }
    await expect(page.locator('.masthead .brand')).toBeVisible();
    await expect(page.locator('.lc-roster-heading h2')).toHaveCSS('color',WHITE);
    await expect(page.locator('.oldroot-footer .footer-links a[href="contact.html"]')).toHaveCSS('background-color',LIME);
    await expect(page.locator('.lc-face img')).toHaveCount(8);
    const masters=await page.locator('.lc-face img').evaluateAll(imgs=>imgs.map(img=>img.getAttribute('src')));
    expect(masters.every(path=>path.startsWith('assets/approved-home/'))).toBe(true);
    const dimensions=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth}));
    expect(dimensions.width).toBeLessThanOrEqual(dimensions.viewport+3);
  });
}

test('Locations headings and directory highlights use green/white without modifying the globe',async({page})=>{
  await page.goto(BASE+'/locations.html',{waitUntil:'networkidle'});
  await expect(page.locator('.locations-cosmic-copy h1')).toHaveCSS('color',WHITE);
  await expect(page.locator('.locations-cosmic-copy .front-label')).toHaveCSS('color',LIME);
  await expect(page.locator('.location-dossier-cards a.place-card').first()).toBeVisible();
  await expect(page.locator('.location-dossier-cards a.place-card').first().locator('h3')).toHaveCSS('color',WHITE);
  await expect(page.locator('.world-console')).toBeVisible();
});

test('Marketplace features remain in development, artwork intact and headings comic white',async({page})=>{
  await page.goto(BASE+'/marketplace.html',{waitUntil:'networkidle'});
  await expect(page.locator('#marketplace-library-title')).toHaveCSS('color',WHITE);
  await expect(page.locator('#marketplace-stickers-title')).toHaveCSS('color',WHITE);
  await expect(page.locator('.marketplace-division-heading .marketplace-count-label').first()).toHaveCSS('color',LIME);
  await expect(page.locator('.market-sticker-visual img').first()).toBeVisible();
});
