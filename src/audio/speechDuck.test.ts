/**
 * SN-7 (polish report 1, 2026-10-29): the music dips 4-6 dB under speech (in 80 ms, back over 400 ms), on its own gain so a sting's deeper
 * duck is not undone; and Dot chirps once as her bubble opens in play.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const g = globalThis as unknown as Record<string, unknown>;
g.window ??= { setTimeout: (f: () => void) => (f(), 0), clearTimeout: () => {} };
g.localStorage ??= { getItem: () => null, setItem: () => {} };
const { Conductor, SPEECH_ATTACK, SPEECH_DUCK, SPEECH_RELEASE } = await import('./conductor.ts');

test('SN-7: speech dips the music 4-6 dB, in 80 ms, back over 400 ms after the last letter', () => {
  const calls: Array<[string, number, number, number?]> = [];
  const param = { cancelScheduledValues: (t: number) => calls.push(['cancel', t, 0]), setTargetAtTime: (v: number, t: number, tau: number) => calls.push(['target', v, t, tau]) };
  const fakeCore = new Proxy({}, {
    get: (_t, k) => (k === 'speechDuck' ? { gain: param } : k === 'ctx' ? { currentTime: 10, state: 'running' } : k === 'withReverb' ? () => ({ connect() {} }) : undefined),
  });
  // (each syllable a voice says dips the music: story-delivery's voices need a real audio graph, so the dip is called as they call it)
  const c = new Conductor() as unknown as { core: unknown; muted: boolean; speechDip: () => void };
  c.core = fakeCore;
  c.muted = false;
  c.speechDip();
  const db = 20 * Math.log10(SPEECH_DUCK);
  assert.ok(db <= -4 && db >= -6, `${db.toFixed(1)} dB`);
  const down = calls.find((x) => x[0] === 'target' && x[1] === SPEECH_DUCK);
  const up = calls.find((x) => x[0] === 'target' && x[1] === 1);
  assert.ok(down && Math.abs(down[2] - 10) < 1e-9 && Math.abs(down[3]! - SPEECH_ATTACK / 3) < 1e-9, 'down at once, 80 ms');
  assert.ok(up && up[2] > 10 && Math.abs(up[3]! - SPEECH_RELEASE / 3) < 1e-9, 'back over 400 ms, after the letter');
  // its own gain, after the sting's duck (and the story's hand on the music between them: storyDirect.ts)
  const core = readFileSync(new URL('./core.ts', import.meta.url), 'utf8');
  assert.match(core, /this\.musicDuck\.connect\(this\.storyLevel\);\n\s*this\.storyLevel\.connect\(this\.speechDuck\);/);
  assert.match(core, /this\.speechDuck\.connect\(this\.musicFilter\);/);
  const cond = readFileSync(new URL('./conductor.ts', import.meta.url), 'utf8');
  assert.match(cond, /if \(due && playSyllable\(core, due\.slug, due\.syl\) > 0\) \{\n\s*this\.speech\.played\(text, index, now\);\n\s*this\.speechDip\(\);/);
});

test('SN-7: Dot chirps once per line, when her bubble goes up', () => {
  const src = readFileSync(new URL('../components/dot/DotGuide.tsx', import.meta.url), 'utf8');
  assert.match(src, /if \(cur\.line\.who === 'Dot' && run\.chirpN !== cur\.n\) \{\n\s*run\.chirpN = cur\.n;\n\s*sound\.dotChirp\(\);/);
});
