// R-165.158: Settings > About carries the keeper's approved pages (STORY-LINES 11-12): "What's ours" with the music line, "Our story",
// and "Inspired by" (29 lines of credits after PUBG and Fortnite were dropped, the real rainforest, the not-affiliated line). About claims
// only what ships: the "84 ideas" line stays out (the keeper's NO, 11-13), and no then-and-now caption without its pictures.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { INSPIRED_BY, INSPIRED_INTRO, NOT_AFFILIATED, OUR_STORY, REAL_RAINFOREST, WHATS_OURS } from './aboutWords.ts';

test("What's ours: five lines, the music line in line 3 as Matt closed it", () => {
  assert.equal(WHATS_OURS.length, 5);
  assert.equal(WHATS_OURS[2], 'Ten rainforest worlds, with art made for this game in its own style, and music written just for it.');
});

test('Inspired by: titles only, PUBG and Fortnite out, the real rainforest and the not-affiliated line last', () => {
  const all = INSPIRED_BY.flatMap((e) => e.games).join('|');
  assert.doesNotMatch(all, /PUBG|Fortnite|Qix|Lemmings/);
  assert.equal(INSPIRED_BY.length, 30);
  assert.match(INSPIRED_INTRO, /Some are still on their way\.$/, 'covers the ideas not yet built');
  assert.match(REAL_RAINFOREST.gave, /harpy eagle/);
  assert.doesNotMatch(REAL_RAINFOREST.gave, /glides|orchid/, 'the nature check (gliding snakes and orchid mantises are Asian)');
  assert.match(NOT_AFFILIATED, /not affiliated with or endorsed by/);
  for (const e of INSPIRED_BY) assert.doesNotMatch(e.gave, /based on/i);
});

test('Our story: the approved page, bookended by "just for fun", no caption for pictures that are not in, no idea count', () => {
  assert.match(OUR_STORY[0], /just for fun\.$/);
  assert.equal(OUR_STORY[OUR_STORY.length - 1], "It's still a little project, just for fun. It just got bigger.");
  const all = [...OUR_STORY, ...WHATS_OURS, INSPIRED_INTRO].join(' ');
  assert.doesNotMatch(all, /Then: six buttons|84 ideas|65 made it/);
});

test('the About tab shows "What\'s ours" and opens its two pages (TitleSettings.tsx imports CSS, so it is read here, not rendered)', () => {
  const src = fs.readFileSync(path.join(import.meta.dirname, '..', 'TitleSettings.tsx'), 'utf8');
  assert.match(src, /<WhatsOurs onOpen=\{setAboutPage\} \/>/);
  assert.match(src, /if \(aboutPage\) return <AboutPage page=\{aboutPage\}/);
  const page = fs.readFileSync(path.join(import.meta.dirname, 'AboutPages.tsx'), 'utf8');
  assert.match(page, /useBack\(onBack\)/, "Android's Back and Esc go back to About first");
});
