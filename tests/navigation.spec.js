const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE = 'http://127.0.0.1:8000';

test('grouped navigation exposes OPI, World, and Lore menus on desktop', async ({ page }) => {
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });

  const nav = page.locator('.site-nav');
  await expect(nav.locator('[data-nav-toggle]')).toHaveCount(3);

  const characters = nav.locator('[aria-controls="nav-characters-menu"]');
  await characters.click();
  await expect(characters).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#nav-characters-menu')).toBeVisible();
  await expect(page.locator('#nav-characters-menu a[href="characters.html"]')).toHaveText('Character Registry');
  await expect(page.locator('#nav-characters-menu a[href="dpi.html"]')).toHaveText('OPI Analytics');
  await expect(page.locator('#nav-characters-menu a[href="news.html#upcoming-characters"]')).toHaveText('Upcoming Characters');

  const world = nav.locator('[aria-controls="nav-world-menu"]');
  await world.hover();
  await expect(page.locator('#nav-world-menu')).toBeVisible();
  await expect(page.locator('#nav-world-menu a')).toHaveCount(3);
  await expect(page.locator('#nav-world-menu')).toContainText('Locations');
  await expect(page.locator('#nav-world-menu')).toContainText('Events');
  await expect(page.locator('#nav-world-menu')).toContainText('Organizations');

  const lore = nav.locator('[aria-controls="nav-lore-menu"]');
  await lore.focus();
  await page.keyboard.press('ArrowDown');
  await expect(lore).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#nav-lore-menu')).toBeVisible();
  await expect(page.locator('#nav-lore-menu a')).toHaveCount(6);
  await expect(page.locator('#nav-lore-menu a[href="lore/abyron/"]')).toHaveText('ELEMENT 126: ABYRON');
  await expect(page.locator('#nav-lore-menu a[href="lore/abyron-powder/"]')).toHaveText('Abyron Powder');
  await expect(page.locator('#nav-lore-menu')).toContainText('Discovery of Abyron');
  await expect(page.locator('#nav-lore-menu')).toContainText('Genesis');
  await page.keyboard.press('Tab');
  await expect(page.locator('#nav-lore-menu a').first()).toBeFocused();
  await expect(page.locator('#nav-lore-menu a').first()).toHaveText('Start Here');
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('#nav-lore-menu a').nth(1)).toBeFocused();
  await expect(page.locator('#nav-lore-menu a').nth(1)).toHaveText('Lore Index');
  await page.keyboard.press('Escape');
  await expect(lore).toBeFocused();
  await expect(lore).toHaveAttribute('aria-expanded', 'false');
});

test('grouped navigation is tap-safe and viewport-safe on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE + '/start-here.html', { waitUntil: 'domcontentloaded' });

  const mobileToggle = page.locator('.mobile-nav-toggle');
  await expect(mobileToggle).toBeVisible();
  await expect(mobileToggle).toHaveAttribute('aria-expanded', 'false');
  await mobileToggle.click();
  await expect(mobileToggle).toHaveAttribute('aria-expanded', 'true');

  const lore = page.locator('[aria-controls="nav-lore-menu"]');
  await expect(lore).toHaveClass(/active/);
  await lore.click();
  await expect(page.locator('#nav-lore-menu')).toBeVisible();
  await expect(page.locator('#nav-lore-menu a[href="start-here.html"]')).toHaveClass(/active/);

  const characters = page.locator('[aria-controls="nav-characters-menu"]');
  await characters.click();
  await expect(page.locator('#nav-characters-menu')).toBeVisible();
  await expect(page.locator('#nav-lore-menu')).toBeHidden();
  await expect(page.locator('#nav-characters-menu a[href="dpi.html"]')).toHaveText('OPI Analytics');

  const widths = await page.evaluate(() => ({
    viewport: innerWidth,
    html: document.documentElement.scrollWidth,
    body: document.body.scrollWidth
  }));
  expect(widths.html).toBeLessThanOrEqual(widths.viewport + 2);
  expect(widths.body).toBeLessThanOrEqual(widths.viewport + 2);
});

test('active grouped navigation follows the current section', async ({ page }) => {
  const cases = [
    ['/dpi.html', 'nav-characters-menu', 'dpi.html'],
    ['/locations.html', 'nav-world-menu', 'locations.html'],
    ['/organizations.html', 'nav-world-menu', 'organizations.html'],
    ['/start-here.html', 'nav-lore-menu', 'start-here.html'],
    ['/lore.html', 'nav-lore-menu', 'lore.html'],
    ['/lore/abyron/', 'nav-lore-menu', '../../lore/abyron/'],
    ['/lore/abyron-powder/', 'nav-lore-menu', '../../lore/abyron-powder/'],
    ['/lore/abyron-discovery/', 'nav-lore-menu', '../../lore/abyron-discovery/'],
    ['/lore/genesis/', 'nav-lore-menu', '../../lore/genesis/']
  ];

  for (const [url, menuId, activeHref] of cases) {
    await page.goto(BASE + url, { waitUntil: 'domcontentloaded' });
    const button = page.locator('[aria-controls="' + menuId + '"]');
    await expect(button).toHaveClass(/active/);
    await button.click();
    await expect(page.locator('#' + menuId + ' a[href="' + activeHref + '"]')).toHaveClass(/active/);
    await expect(page.locator('#' + menuId + ' a.active')).toHaveCount(1);
  }

  await page.goto(BASE + '/library/oldroot-book-1/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.site-nav > a[href="../../library.html"]')).toHaveClass(/active/);

  await page.goto(BASE + '/news.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.site-nav > a[href="news.html"]')).toHaveClass(/active/);
});

test('every masthead uses the grouped navigation and loads the controller', async () => {
  const root = process.cwd();
  const htmlFiles = [];

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === '.git' || entry.name === 'node_modules') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith('.html')) htmlFiles.push(full);
    }
  }
  walk(root);

  const failures = [];
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    if (!html.includes('class="masthead"')) continue;
    const relative = path.relative(root, file).replace(/\\/g, '/');
    const nested = relative.includes('/');
    const expectedScript = nested ? '../../nav.js?v=4' : 'nav.js?v=4';

    const toggleCount = (html.match(/data-nav-toggle/g) || []).length;
    if (!html.includes('class="site-nav"')) failures.push(relative + ': missing site-nav');
    if (toggleCount !== 3) failures.push(relative + ': expected 3 grouped menus');
    if (!html.includes('>OPI Analytics</a>')) failures.push(relative + ': missing OPI link');
    if (!html.includes('>Start Here</a>') || !html.includes('>Lore Index</a>')) failures.push(relative + ': incomplete Lore menu');
    if (!html.includes(expectedScript)) failures.push(relative + ': missing nav controller');
    if (!html.includes('brand.css?v=16')) failures.push(relative + ': stale brand stylesheet');
  }

  expect(failures).toEqual([]);
});