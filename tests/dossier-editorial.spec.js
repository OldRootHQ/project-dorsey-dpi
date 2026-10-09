const { test, expect } = require('@playwright/test');

const BASE = 'http://127.0.0.1:8000';
const publishedCharacters = [
  'gila-monster', 'commotion', 'aftermark', 'kincast', 'anchorage',
  'agent-emerald', 'latch', 'kokio', 'amari-razman', 'ballestera'
];

const productionGapPhrases = [
  /design not established/i,
  /\bnot (?:yet )?(?:been )?(?:established|defined|specified|assigned|published)\b/i,
  /\bremain(?:s)? (?:intentionally )?(?:open|undefined|unresolved)\b/i,
  /\b(?:writer decisions|for future development|creator-approved|creator-established|creator-locked)\b/i,
  /\b(?:unrevealed mark|tbd)\b/i
];

for (const slug of publishedCharacters) {
  test(`${slug} reads as a complete public dossier without production placeholders`, async ({ page }) => {
    await page.goto(`${BASE}/characters/${slug}/`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('main')).toBeVisible();
    const content = await page.locator('main').innerText();

    for (const phrase of productionGapPhrases) {
      expect(content, `${slug}: unexpected editorial placeholder ${phrase}`).not.toMatch(phrase);
    }

    const mark = page.locator('.logo-slot');
    if (await mark.count() && !(await mark.evaluate(el => el.classList.contains('has-logo')))) {
      await expect(mark).toContainText('OldRoot Archive');
    }
  });
}
