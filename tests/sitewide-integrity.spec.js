const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = process.cwd();

function filesOfType(extension) {
  const result = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (['.git', 'node_modules', 'artifacts', 'test-results'].includes(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith(extension)) result.push(full);
    }
  }
  walk(root);
  return result;
}

function localTarget(file, reference) {
  if (/^(?:#|https?:|mailto:|tel:|data:|javascript:|\/\/)/i.test(reference)) return null;
  const clean = reference.split(/[?#]/)[0];
  if (!clean) return null;
  const relative = clean.startsWith('/')
    ? clean.slice(1)
    : path.posix.join(path.relative(root, path.dirname(file)).replace(/\\/g, '/'), clean);
  const resolved = clean.endsWith('/') || !relative
    ? path.posix.join(relative, 'index.html')
    : relative;
  return path.resolve(root, resolved);
}

test('all published HTML pages have unique anchors, accessible images and valid local links', () => {
  const pages = filesOfType('.html');
  const problems = [];
  for (const file of pages) {
    const html = fs.readFileSync(file, 'utf8');
    const page = path.relative(root, file).replace(/\\/g, '/');
    const ids = new Set();
    for (const match of html.matchAll(/\bid=["']([^"']+)["']/g)) {
      if (ids.has(match[1])) problems.push(`${page}: duplicate id ${match[1]}`);
      ids.add(match[1]);
    }
    for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
      if (!/\balt=/.test(match[0])) problems.push(`${page}: image missing alt`);
    }
    for (const match of html.matchAll(/\b(?:href|src|poster)=["']([^"']+)["']/g)) {
      const target = localTarget(file, match[1]);
      if (target && !fs.existsSync(target)) problems.push(`${page}: missing ${match[1]}`);
    }
  }
  expect(pages.length).toBeGreaterThanOrEqual(68);
  expect(problems).toEqual([]);
});

test('shared and page-specific stylesheets reference existing local assets', () => {
  const stylesheets = filesOfType('.css');
  const missing = [];
  for (const file of stylesheets) {
    const css = fs.readFileSync(file, 'utf8');
    const page = path.relative(root, file).replace(/\\/g, '/');
    for (const match of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) {
      const target = localTarget(file, match[1].trim());
      if (target && !fs.existsSync(target)) missing.push(`${page}: missing ${match[1]}`);
    }
  }
  expect(stylesheets.length).toBeGreaterThanOrEqual(22);
  expect(missing).toEqual([]);
});
