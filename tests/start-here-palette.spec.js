const { test, expect } = require('@playwright/test');

const BASE = 'http://127.0.0.1:8000';

// Start Here is the public onboarding page. Its older café/gold surfaces must
// not override the approved HQ 2.4 soft-avocado, comic-white and matte-carbon UI.
for (const [mode, width] of [['desktop', 1440], ['phone', 390]]) {
  test(`Start Here uses approved current palette and readable hierarchy on ${mode}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const response = await page.goto(BASE + '/start-here.html', { waitUntil: 'networkidle' });
    expect(response.status()).toBe(200);
    await expect(page.locator('body')).toHaveClass(/start-here-page/);
    await expect(page.locator('link[href="start-here.css?v=1"]')).toHaveCount(1);

    const styles = await page.evaluate(() => {
      const get = selector => getComputedStyle(document.querySelector(selector));
      return {
        sectionBackground: get('.section-band').backgroundImage,
        sectionHeading: get('.section-band-head h2').color,
        sectionKicker: get('.section-band-head span').color,
        statementBackground: get('.start-statement').backgroundImage,
        statementHeading: get('.start-statement h2').color,
        statementCopy: get('.start-statement p').color,
        statBackground: get('.start-stat-panel').backgroundImage,
        statLabel: get('.start-stat span').color,
        statValue: get('.start-stat strong').color,
        originLabel: get('.origin-lane b').color,
        discoveryLabel: get('.discovery-card span').color,
        discoveryHeading: get('.discovery-card h3').color,
        viewport: innerWidth,
        docWidth: document.documentElement.scrollWidth,
        bodyWidth: document.body.scrollWidth,
        nestedOverflow: [...document.querySelectorAll('body *')].map(el => {
          const style = getComputedStyle(el);
          return { tag: el.tagName.toLowerCase(), cls: String(el.className || '').slice(0, 70), scroll: el.scrollWidth, client: el.clientWidth, overflow: style.overflowX };
        }).filter(el => el.scroll > el.client + 2 && el.client > 0 && !['hidden', 'clip', 'auto', 'scroll'].includes(el.overflow))
          .sort((a, b) => (b.scroll - b.client) - (a.scroll - a.client)).slice(0, 16),
        offenders: [...document.querySelectorAll('body *')].map(el => {
          const r = el.getBoundingClientRect();
          return { tag: el.tagName.toLowerCase(), cls: String(el.className || '').slice(0, 90), right: Math.round(r.right), width: Math.round(r.width) };
        }).filter(el => el.right > innerWidth + 2).sort((a, b) => b.right - a.right).slice(0, 16)
      };
    });

    expect(styles.sectionBackground).toContain('linear-gradient');
    expect(styles.statementBackground).toContain('linear-gradient');
    expect(styles.sectionBackground).not.toContain('repeating-linear-gradient');
    expect(styles.statementBackground).not.toContain('repeating-linear-gradient');
    expect(styles.sectionHeading).toBe('rgb(250, 255, 252)');
    expect(styles.statementHeading).toBe('rgb(250, 255, 252)');
    expect(styles.discoveryHeading).toBe('rgb(250, 255, 252)');
    expect(styles.statementCopy).toBe('rgb(217, 231, 220)');
    expect(styles.sectionKicker).toBe('rgb(183, 207, 138)');
    expect(styles.originLabel).toBe('rgb(183, 207, 138)');
    expect(styles.discoveryLabel).toBe('rgb(183, 207, 138)');
    expect(styles.statBackground).toContain('183, 207, 138');
    expect(styles.statLabel).toBe('rgb(36, 73, 45)');
    expect(styles.statValue).toBe('rgb(23, 54, 33)');
    expect(styles.docWidth, JSON.stringify({offenders:styles.offenders,nested:styles.nestedOverflow,body:styles.bodyWidth})).toBeLessThanOrEqual(styles.viewport + 2);
    expect(styles.bodyWidth, JSON.stringify(styles.offenders)).toBeLessThanOrEqual(styles.viewport + 2);

    await expect(page.locator('.start-stat')).toHaveCount(3);
    await expect(page.locator('.start-statement').first()).toContainText('Genesis opened the door');
    await expect(page.locator('.discovery-card[href="characters.html"]')).toBeVisible();
  });
}
