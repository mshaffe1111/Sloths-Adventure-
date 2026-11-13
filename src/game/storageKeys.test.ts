/**
 * Audit C saves #8 (2026-11-11): every key the game keeps in storage is one of three kinds (saveFile.ts): a game entry (a save file
 * carries it, a New Game clears it), this adventure on this phone (a New Game clears it, a file does not carry it), or the device's
 * own (neither). The lists were kept by hand and keys added later landed on none: the guardian's intro flag, the golden seeds, the
 * journal's "new" marks, the killed run's flag. This reads every `sloth_` key the game's source names and fails on one that is on no
 * list; the device's own are listed here, each with why, so a new key cannot pass without someone deciding its kind.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applySave, buildSave, checksum, isAdventureKey, isSaveKey, parseSave, resetProgress, type Store } from './saveFile.ts';

/** the device's own: a New Game keeps them, a save file does not carry them */
const DEVICE: Record<string, string> = {
  // settings and help shown once per device
  sloth_music_vol: 'sound', sloth_sfx_vol: 'sound', sloth_game_muted: 'sound',
  sloth_ctl_hand: 'controls', sloth_ctl_sens: 'controls', sloth_ctl_side: 'controls', sloth_ctl_style: 'controls',
  sloth_assist_lives: 'assist', sloth_assist_speed: 'assist', sloth_jump_help: 'assist', sloth_shake: 'settings', sloth_haptics: 'settings',
  sloth_show_touches: 'settings', sloth_wayside_off: 'settings', sloth_fullscreen: 'settings', sloth_fs_tip: 'tip once per device',
  sloth_howto_seen: 'once per device', sloth_coach_done: 'once per device', sloth_slowtip_shown: 'once per device',
  sloth_dot_skip_offered: "Dot's Skip tips button, offered once per device (dotGuideHelp.ts)",
  sloth_dot_silk: "Dot's flight: the silk found on this device, kept for good (dotFlightRun.ts)",
  sloth_update_applied_at: 'the update check',
  // testers and debug switches
  sloth_perf: 'debug', sloth_polish: 'debug', sloth_rim: 'debug', sloth_test_unlock: 'testers', sloth_ctest_name: 'testers',
  sloth_qa_tester_id: 'testers', sloth_play11_order: "the testers' 1-1 layouts in turn (testlink1_1.ts)",
  // the picture switches (painted or classic art), one per creature or sheet
  sloth_birds: 'art switch', sloth_boa: 'art switch', sloth_butterflies: 'art switch', sloth_caiman: 'art switch', sloth_castles: 'art switch',
  sloth_eagle: 'art switch', sloth_flowers: 'art switch', sloth_frog: 'art switch', sloth_harpy: 'art switch', sloth_hero: 'art switch',
  sloth_jaguar: 'art switch', sloth_jennifur: 'art switch', sloth_leaves: 'art switch', sloth_ocelot: 'art switch', sloth_plants: 'art switch',
  sloth_snake: 'art switch', sloth_spider: 'art switch', sloth_tayra: 'art switch', sloth_venom: 'art switch',
  sloth_story_flags_v2: 'the story flags of this device moved once (storyFlags.ts)',
};
/** a key family the source builds from a prefix (a template or `+`), and one real key of it */
const FAMILY: Record<string, string> = {
  sloth_lvl_: 'sloth_lvl_3-7', sloth_play_: 'sloth_play_3-7', sloth_layout_: 'sloth_layout_3-7', sloth_story_: 'sloth_story_w3',
  sloth_way_: 'sloth_way_3-7', sloth_seed_: 'sloth_seed_1-5_seed-2', sloth_tips_: 'sloth_tips_3-7',
  sloth_: 'sloth_venom', // (paintedBoss.ts: 'sloth_' + a guardian's art switch; usePWAInstall.ts reads every sloth_ key)
};

/** every sloth_ key the game's source names: [key or prefix, is a prefix, file] */
function sourceKeys(): Array<[string, boolean, string]> {
  const src = fileURLToPath(new URL('..', import.meta.url));
  const out: Array<[string, boolean, string]> = [];
  const walk = (d: string) => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.tsx?$/.test(f) && !/\.test\.tsx?$/.test(f) && !/(saveFill|Harness)\.ts$/.test(f)) {
        const text = readFileSync(p, 'utf8');
        for (const m of text.matchAll(/(['"`])(sloth_\w*)(\$\{|['"`])/g)) out.push([m[2], m[3] === '${' || m[3] !== m[1] || m[2].endsWith('_'), p.slice(src.length)]);
      }
    }
  };
  walk(src);
  return out;
}

test('every storage key in the game is a game entry, this adventure on this phone, or named here as the device\'s own', () => {
  const keys = sourceKeys();
  assert.ok(keys.length > 60, `the reader finds the keys (${keys.length})`);
  const lost: string[] = [];
  for (const [k, prefix, file] of keys) {
    if (prefix || k in FAMILY) {
      const real = FAMILY[k];
      if (!real) lost.push(`${file}: the key family ${k}... (add one real key of it to FAMILY)`);
      else if (!real.startsWith(k) || !(isAdventureKey(real) || real in DEVICE)) lost.push(`${file}: ${real} is on no list`);
    } else if (!isAdventureKey(k) && !(k in DEVICE)) lost.push(`${file}: ${k} is on no list`);
  }
  assert.deepEqual(lost, []);
});

test("the device's own keys are neither carried nor cleared", () => {
  const leaked = Object.keys(DEVICE).filter((k) => isAdventureKey(k));
  assert.deepEqual(leaked, [], 'keys named as the device\'s own that a New Game would clear');
});

const mapStore = (init: Record<string, string>): Store & { m: Map<string, string> } => {
  const m = new Map(Object.entries(init));
  return { m, getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k), keys: () => [...m.keys()] };
};

test('a New Game clears what this adventure did on this phone, and keeps the device\'s own', () => {
  const st = mapStore({
    sloth_flag_resume: '{"id":"3-7","x":5000}', sloth_journal_told: '["glide"]', sloth_journal_looked: '["glide"]', sloth_dot_help: 'quiet',
    'sloth_seed_1-5_seed-2': '1', sloth_game_muted: 'true', sloth_ctl_style: 'pad', sloth_dot_skip_offered: '1',
  });
  resetProgress(st);
  assert.deepEqual([...st.m.keys()].sort(), ['sloth_ctl_style', 'sloth_dot_skip_offered', 'sloth_game_muted']);
});

test('a save file carries the golden seeds, and loading one keeps this phone\'s sound settings even when the file has its own', () => {
  // (the seed keys as the game writes them: 1-1's has no find id, 1-5's carry theirs; writtenKeys.test.ts takes them from built stages)
  assert.ok(isSaveKey('sloth_seed_1-1_seed') && isSaveKey('sloth_seed_1-5_seed-2'));
  // a file from 0.9.6, which carried the sound settings
  const old = { 'sloth_lvl_1-1': '{"completed":true,"stars":2}', 'sloth_seed_1-1_seed': '1', sloth_game_muted: 'false', sloth_music_vol: '0.9' };
  const r2 = parseSave(JSON.stringify({ ...buildSave(mapStore({})), version: 1, data: old, checksum: checksum(old) }));
  assert.ok(r2.ok, r2.ok ? '' : r2.reason);
  if (!r2.ok) return;
  const phone = mapStore({ sloth_game_muted: 'true', sloth_music_vol: '0.2' });
  applySave(phone, r2.save);
  assert.equal(phone.getItem('sloth_game_muted'), 'true', "the phone's mute");
  assert.equal(phone.getItem('sloth_music_vol'), '0.2', "the phone's music volume");
  assert.equal(phone.getItem('sloth_seed_1-1_seed'), '1', 'the golden seed came with the file');
});
