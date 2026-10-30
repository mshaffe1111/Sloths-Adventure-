/**
 * w5Normal — World 5 sharper on Normal (LV-2; the lead approved the package, 2026-10-29): World 5's Normal band sat under World 4's
 * (tools/inspect bands.ts, BAND_GATE; 21 against 28 on seed 1), its stages costing an adult first-timer no lives: the pits are soft (World
 * 5's rule, kept), and its hazards slow him rather than hurt. Normal only (stageGenerator.ts generateStage; Easy keeps every number), and
 * never at a stage's first of a kind (its first spider, pot, thread and orchid keep the numbers they are taught with):
 *   - the spiders: the crouch 0.7 -> 0.6 s (World 5's own floor: every attack warned at least 0.6 s, w5Kit SPIDER5), the rush x1.2;
 *   - the hearts at the flags: two of every three kept (a heart every third flag or so, not every second);
 *   - the teapots: a puff of steam breathed costs a heart as well as the doze (one a puff), the quiet between puffs x0.8;
 *   - the closing orchids: open x0.8 of their beat's open time, never under ORCHID.minOpen;
 *   - the humming threads: their hum carries x1.3 as far, so it wakes more of the sleepers round them.
 */
import type { GeneratedStage } from './stageGenerator.ts';
import type { ProtoExtras } from './protoStage.ts';
import { ORCHID, THREAD } from './w5Kit.ts';
import { SPIDER } from './enemyBrain.ts';

export const W5_NORMAL = { tell: 0.6, rush: 1.2, heartsKept: 2 / 3, steamHurts: true, potQuiet: 0.8, orchidOpen: 0.8, hum: 1.3 } as const;

/** the order a stage is met in: left to right, or (a climb) bottom to top */
const along = (st: GeneratedStage) => (st.config.objectiveType === 'ascent' ? (o: { x: number; y: number }) => -o.y : (o: { x: number; y: number }) => o.x);

export function w5Normal<T extends GeneratedStage & { proto?: ProtoExtras }>(stage: T): T {
  const c = stage.config;
  if (c.worldIndex !== 5 || c.objectiveType === 'boss_lair' || c.secret) return stage;
  const w5 = stage.proto?.w5;
  const K = W5_NORMAL;
  const at = along(stage);
  const later = <O extends { x: number; y: number }>(xs: O[] | undefined): O[] => [...(xs ?? [])].sort((a, b) => at(a) - at(b)).slice(1);
  if (w5) {
    // the spiders, after the first: a shorter crouch, a quicker rush
    const listed = new Map((w5.spiders ?? []).map((s) => [s.id, s]));
    const foes = later(stage.enemies.filter((e) => e.type === 'spider' && listed.has(e.id)));
    for (const e of foes) {
      listed.get(e.id)!.tell = K.tell;
      e.speed = Math.round(SPIDER.nominal * K.rush);
    }
    // the teapots, after the first
    for (const p of later(w5.pots)) {
      p.hurts = K.steamHurts;
      p.idle = Math.round(p.idle * K.potQuiet * 100) / 100;
    }
    // the orchids, after the first
    for (const o of later(w5.orchids)) o.open = Math.max(ORCHID.minOpen, Math.round(o.open * K.orchidOpen * 10) / 10);
    // the threads, after the first
    for (const th of later((w5.threads ?? []).map((t) => ({ ...t, x: (t.x0 + t.x1) / 2, ref: t })))) th.ref.alert = Math.round(THREAD.alert * K.hum);
  }
  // the hearts by the flags: a heart is a flag's when it stands within 200 px of one; every third of them goes, in the order they are met
  const flags = stage.checkpoints ?? [];
  const byFlag = stage.collectibles
    .filter((h) => h.type === 'heart' && flags.some((f) => Math.abs(f.x - h.x) < 200 && Math.abs(f.y - h.y) < 200))
    .sort((a, b) => at(a) - at(b));
  const drop = new Set(byFlag.filter((_, i) => i % 3 === 1));
  if (drop.size) stage.collectibles = stage.collectibles.filter((h) => !drop.has(h));
  return stage;
}
