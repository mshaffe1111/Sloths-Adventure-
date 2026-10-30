import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { FONT_DISPLAY, FONT_READ, FONT_UI } from './fonts.ts';

const root = path.resolve(import.meta.dirname, '../..');
const css = fs.readFileSync(path.join(root, 'src/index.css'), 'utf8');

test('canvas text uses the same three faces as the stylesheet (UI-13)', () => {
  const v = (name: string) => css.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1].trim();
  assert.equal(v('font-fun'), FONT_DISPLAY);
  assert.equal(v('font-ui'), FONT_UI);
  assert.equal(v('font-read'), FONT_READ);
});

test('no fourth family anywhere: no Fredoka, Baloo, Georgia or bare sans-serif in canvas text or the stylesheets', () => {
  const files: string[] = [];
  const walk = (d: string) => {
    for (const f of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, f.name);
      if (f.isDirectory()) walk(p);
      else if (/\.(ts|tsx|css)$/.test(f.name) && !f.name.endsWith('.test.ts')) files.push(p);
    }
  };
  walk(path.join(root, 'src'));
  const bad: string[] = [];
  for (const f of files) {
    const s = fs.readFileSync(f, 'utf8');
    if (/Fredoka|Baloo|Georgia/.test(s)) bad.push(`${path.relative(root, f)}: a retired face`);
    for (const m of s.matchAll(/\.font = (['"`])([^'"`]*)\1/g)) if (!m[2].includes('${')) bad.push(`${path.relative(root, f)}: ctx.font '${m[2]}'`);
  }
  assert.deepEqual(bad, []);
});
