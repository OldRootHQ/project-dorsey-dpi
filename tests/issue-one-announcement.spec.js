const { test, expect } = require('@playwright/test');
const fs = require('fs');

const BASE = 'http://127.0.0.1:8000';

test('Issue #1 is announced prominently without revealing its featured cast', async ({ page }) => {
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  const announcement = page.locator('#under-observation');
  await expect(announcement).toBeVisible();
  await expect(announcement).toContainText('UNDER');
  await expect(announcement).toContainText('OBSERVATION');
  await expect(announcement).toContainText('ISSUE');
  await expect(announcement).toContainText('IN DEVELOPMENT');
  await expect(announcement).not.toContainText('Kincast');
  await expect(announcement.locator('a')).toHaveAttribute('href', 'library/oldroot-book-1/');
  await expect(page.locator('#homeLatestDispatch')).toContainText('Under Observation');

  await page.goto(BASE + '/library/oldroot-book-1/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('h1')).toHaveText('Under Observation');
  await expect(page.locator('main')).toContainText('Issue #1');
  await expect(page.locator('main')).toContainText('IN DEVELOPMENT');
  await expect(page.locator('main')).not.toContainText('Kincast');
  await expect(page.locator('button.product-disabled')).toBeDisabled();

  await page.goto(BASE + '/marketplace.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-feature-id="book-1"]')).toContainText('Under Observation');
  await expect(page.locator('main')).toContainText('Under Observation');

  await page.goto(BASE + '/news.html', { waitUntil: 'domcontentloaded' });
  const dispatch = page.locator('#under-observation-announcement');
  await expect(dispatch).toBeVisible();
  await expect(dispatch).toContainText('Under Observation');
  await expect(dispatch).not.toContainText('Kincast');
});

test('community poll is transparent about voting not being live', async ({ page }) => {
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  const poll = page.locator('#community-poll');
  await expect(poll).toBeVisible();
  await expect(poll).toContainText('Who deserves the');
  await expect(poll).toContainText('next issue');
  await expect(poll.locator('li')).toHaveCount(10);
  await expect(poll.locator('li')).not.toContainText(['Kincast']);
  await expect(poll).toContainText('Voting opens soon');
  await expect(poll.locator('button, input[type="radio"], iframe')).toHaveCount(0);
});

test('retired character has no public links, registry record, or live search entry', async ({ page }) => {
  const pages = ['index.html','characters.html','start-here.html','marketplace.html','news.html','locations.html','library.html'];
  const dataFiles = ['data.js','home-data.js','location-data.js','marketplace.js','dossier-experience.js','dossier-experience.css','sitemap.xml'];
  for (const file of [...pages,...dataFiles]) {
    const content = fs.readFileSync(file, 'utf8');
    expect(content, file).not.toMatch(/kokio|kalani|takaro|characters\\/kokio|stickers\\/kokio/i);
  }
  expect(fs.existsSync('characters/kokio/index.html')).toBe(false);
  expect(fs.existsSync('stickers/kokio/index.html')).toBe(false);
  expect(fs.existsSync('locations/hilo/index.html')).toBe(false);
  expect(fs.existsSync('assets/characters/kokio')).toBe(false);

  await page.goto(BASE + '/characters.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.character-card')).toHaveCount(13);
  await page.goto(BASE + '/marketplace.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-market-sticker]')).toHaveCount(10);
});
