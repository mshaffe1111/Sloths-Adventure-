/**
 * meecaPace — Meeca's stage (5-M) measured in the real engine, as the inspector can't (stages.ts skips it: no shrine, its carving and
 * scenes are meecaPlay.ts's). Two checks, per roll:
 *
 *   dead time  meecaBot.ts plays the stage the quick way; every frame with something to do is a beat (a jump pressed, a climb, a tap to
 *              carry or throw, a carving, a puzzle room, a rope), and every stretch of plain walking between beats over 2 s
 *              (STAGE-RULES §2, Normal) is dead time, as analyze.ts deadTime counts it. The scenes (the card, Pell, the ending) are not
 *              play and are left out of the clock.
 *   the floor  for each section of each trail: holding right along the floor must never get through, and hopping at whatever is in
 *              the way without climbing (the section's trunks switched off) must not get through a section with a trunk.
 *
 *   npx tsx tools/inspect/meecaPace.ts --seed 1 [--seed 2 ...] [--quiet]
 */
import { RealPlay, type Pad } from '../../src/game/realPlay.ts';
import { MeecaBot, floorWalker } from '../../src/game/meecaBot.ts';
import type { MeecaPlay } from '../../src/game/meecaPlay.ts';
import type { KitPlay } from '../../src/game/puzzlePlay.ts';
import { meecaCheckStage, meecaGeneratedStage, MEECA_G } from '../../src/game/meecaStage.ts';
import { meecaStageConfig } from '../../src/game/extraStages.ts';
import { validateStage } from '../../src/game/levelCheck.ts';
import { CARVED_KEY } from '../../src/game/meecaCarved.ts';

const GAP = 2.0;

export interface PaceResult {
  seed: number;
  /** play seconds (scenes left out), and the bot's whole clock */
  play: number;
  /** seconds on plain ground past the camp, outside the rooms, not carving: walking */
  walking: number;
  clock: number;
  dead: number;
  longest: number;
  /** the quiet stretches over GAP: [from s, seconds, x] */
  quiet: Array<[number, number, number]>;
}

function forget() {
  try {
    localStorage.removeItem('sloth_tips_5-M');
    localStorage.removeItem(CARVED_KEY);
  } catch {
    /* no storage */
  }
}

export function pace(seed: number, w = 844, h = 390): PaceResult {
  forget();
  const sim = new RealPlay('5-M', seed);
  sim.e.viewCssW = w;
  sim.e.viewCssH = h;
  sim.e.introT = 99;
  sim.e.applyZoom();
  const mc = (sim.e as { mc: MeecaPlay }).mc;
  const kit = (sim.e as { kit: KitPlay }).kit;
  let play = 0;
  let walking = 0;
  let lastBeat = 0;
  let started = false;
  const quiet: Array<[number, number, number]> = [];
  let quietX = 0;
  const raw = sim.frame.bind(sim);
  sim.frame = (pad: Pad = {}) => {
    raw(pad);
    const p = sim.p;
    if (mc.phase !== 'play') return;
    if (!started) {
      started = true;
      lastBeat = 0;
    }
    play += 1 / 30;
    const beat = !!pad.press || !!pad.punch || pad.kick !== undefined || p.climbing || !!p.hanging || !!p.isVineSwinging || mc.carvingNow || kit.inRoom >= 0 || !p.grounded;
    if (!beat && p.grounded && p.x > mc.st.campEnd && Math.abs(pad.right ? 1 : 0) > 0) walking += 1 / 30;
    if (beat) {
      const gap = play - lastBeat;
      if (gap > GAP) quiet.push([lastBeat, gap, Math.round(quietX)]);
      lastBeat = play;
      quietX = p.x;
    }
  };
  const bot = new MeecaBot(sim);
  bot.play();
  const end = play - lastBeat;
  if (end > GAP) quiet.push([lastBeat, end, Math.round(quietX)]);
  const dead = quiet.reduce((a, q) => a + q[1], 0);
  return { seed, play, walking, clock: mc.t, dead, longest: quiet.reduce((m, q) => Math.max(m, q[1]), 0), quiet };
}

/**
 * The floor, section by section (meecaBot.ts floorWalker): `walk` holds right and nothing else (Matt's "run straight across the
 * bottom"); `hop` also jumps at whatever stops it, with a second jump, but never climbs (the section's trunks switched off).
 */
export function floorWalk(seed: number): Array<{ trail: string; x0: number; x1: number; climbs: number; walk: boolean; hop: boolean }> {
  forget();
  const out: Array<{ trail: string; x0: number; x1: number; climbs: number; walk: boolean; hop: boolean }> = [];
  const st = (new RealPlay('5-M', seed).e as { mc: MeecaPlay }).mc.st;
  for (const tr of st.trails) {
    for (const sec of tr.sections) {
      const w = floorWalker(new RealPlay('5-M', seed), sec.x0, sec.x1, false);
      const h = floorWalker(new RealPlay('5-M', seed), sec.x0, sec.x1, true);
      out.push({ trail: `${tr.name} [${sec.kind}]`, x0: sec.x0, x1: sec.x1, climbs: h.climbs, walk: w.through, hop: h.through });
    }
  }
  return out;
}

/**
 * The floor, as the validator (levelCheck.ts) sees it: each section (the old stage: each trail) with everything above the path taken
 * away (branches, logs, stumps, the tall bank, and the logs jammed across a gully) and its trunks switched off. True where the last tree can still be reached: the floor
 * gets her past it.
 */
export function floorOnly(seed: number): Array<{ name: string; open: boolean }> {
  const out: Array<{ name: string; open: boolean }> = [];
  const base = meecaGeneratedStage(meecaStageConfig(), seed);
  for (const tr of base.proto.meeca!.trails) {
    for (const sec of (tr as { sections?: Array<{ x0: number; x1: number; kind: string }> }).sections ?? [{ x0: tr.x0, x1: tr.x1, kind: 'whole trail' }]) {
      const st = meecaGeneratedStage(meecaStageConfig(), seed);
      st.platforms = st.platforms.filter((p) => !(p.x >= sec.x0 && p.x < sec.x1 && (p.y < MEECA_G - 1 || p.style === 'log' || p.style === 'branch')));
      for (const v of st.vines) if (!v.kit && v.x >= sec.x0 && v.x <= sec.x1) v.off = true;
      out.push({ name: `${tr.name} [${sec.kind}]`, open: !validateStage(meecaCheckStage(st)).errors.some((e) => e.startsWith('exit platform')) });
    }
  }
  return out;
}

if (process.argv[1]?.endsWith('meecaPace.ts')) {
  const seeds: number[] = [];
  const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i++) if (a[i] === '--seed') seeds.push(Number(a[++i]));
  if (!seeds.length) seeds.push(1, 2, 3);
  const quietOnly = a.includes('--quiet');
  for (const s of seeds) {
    const r = pace(s);
    const share = (100 * r.dead) / r.play;
    console.log(`seed ${s}: play ${r.play.toFixed(0)} s (bot clock ${Math.floor(Math.round(r.clock) / 60)}:${String(Math.round(r.clock) % 60).padStart(2, '0')}), walking ${r.walking.toFixed(0)} s, dead ${r.dead.toFixed(1)} s = ${share.toFixed(1)}%, longest quiet ${r.longest.toFixed(1)} s, ${r.quiet.length} stretches over ${GAP} s`);
    if (!quietOnly) for (const q of r.quiet) console.log(`   at ${q[0].toFixed(1)} s (x ${q[2]}): ${q[1].toFixed(1)} s`);
    if (quietOnly) continue;
    const fo = floorOnly(s);
    for (const f of fo) if (f.open) console.log(`   floor only (nothing above the path, no trunks): ${f.name} still gets her through`);
    console.log(`   floor only: ${fo.filter((f) => f.open).length} of ${fo.length} sections let the floor through`);
    const fw = floorWalk(s);
    for (const f of fw) console.log(`   floor ${f.trail} ${f.x0}-${f.x1}: ${f.climbs} trunk(s); walking the floor ${f.walk ? 'GETS THROUGH' : 'blocked'}; hopping, no climbing ${f.hop ? 'gets through' : 'blocked'}`);
    console.log(`   floor: walking gets through ${fw.filter((f) => f.walk).length} of ${fw.length} sections; with a trunk, hopping without climbing gets through ${fw.filter((f) => f.climbs && f.hop).length} of ${fw.filter((f) => f.climbs).length}`);
  }
}
