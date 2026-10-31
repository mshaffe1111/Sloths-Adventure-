/**
 * gen2/worlds/w10Game — World 10 as the game builds it (DESIGN.md B10 piece G): the world's sections (w10.ts, w10Ground.ts) and, from
 * the swing builder (gen2-w10-swing), the swings over the iron netting and the stages' puzzle rooms, in one kit per stage and
 * difficulty, with the sections each stage must hold on every roll (WorldManifest.required): 10-1's first lightning rods and first spike
 * beds (the lessons, STAGE-RULES §1), and each room on its stage.
 *
 * gen2/game.ts lists the stages with this kit, and tools/gen2/curate.ts curates them on it, so a shipped roll builds in the game exactly
 * as it was checked. 10-2, 10-4, 10-5 and 10-8 are ascents (not gen2) and 10-10 is the General's lair.
 */
import type { Difficulty, SectionTemplate, WorldKit, WorldManifest } from '../types.ts';
import { w10Kit } from './w10.ts';
import { W10_LESSON_SECTIONS, W10_STAGE_ONLY } from './w10Ground.ts';
import { W10_ROOM_REQUIRED, withW10Rooms } from './w10Rooms.ts';
import { withW10Swing } from './w10Swing.ts';
import { TRAP } from '../../trapdoor.ts';
import { liftCycle } from '../../lift.ts';
import { BOB } from '../pipeline.ts';

/** the stages of World 10 the game builds with gen2 */
export const W10_GAME_STAGES = ['10-1', '10-3', '10-6', '10-7', '10-9'] as const;

/** each stage's must-haves: 10-1's lessons (the rods in its first Ki slot, the spike beds after) */
export const W10_REQUIRED: NonNullable<WorldManifest['required']> = {
  '10-1': [{ section: W10_LESSON_SECTIONS.rods, phase: 'ki' }, { section: W10_LESSON_SECTIONS.spikes }],
};
// (and each stage's puzzle room, w10Rooms.ts: 10-1's hoist after its lessons, 10-3's beam, 10-7's gatehouse)
for (const [id, rs] of Object.entries(W10_ROOM_REQUIRED)) W10_REQUIRED[id] = [...(W10_REQUIRED[id] ?? []), ...rs];

/**
 * Development only (a dev build's screenshots of one grab-bag piece, STAGE-RULES §1c step 3): `window.__w10force = 'w10-perch-run'`
 * before `__play` puts that section, and the gate that opens its theme, into every roll of its stage. A production build drops this
 * (import.meta.env.DEV is false there, and it has no `process`); in node the env W10_FORCE does the same.
 */
function devForced(stage: number, sections: SectionTemplate[]): WorldManifest['required'] | null {
  const env = (import.meta as unknown as { env?: { DEV?: boolean } }).env;
  // (node's piece checks pass it as W10_FORCE: tools/inspect --firsttimer builds stages through the game)
  const nodeForce = typeof process !== 'undefined' ? process.env?.W10_FORCE : undefined;
  const id = env?.DEV ? (globalThis as { __w10force?: string }).__w10force : nodeForce;
  const sec = id ? sections.find((s) => s.id === id) : undefined;
  if (!sec) return null;
  const type = ({ 1: 'sprint', 3: 'stealth', 6: 'vine_runner', 7: 'purge', 9: 'gauntlet' } as Record<number, string>)[stage];
  const gates = (sec.uses ?? []).flatMap((u) => sections.filter((g) => g.teaches === u && g.phases.includes('start') && (g.archetypes === 'any' || (g.archetypes as string[]).includes(type))).slice(0, 1));
  // (and the section that teaches each of its other lessons, the barrels' first barrel before a barrel run)
  const taught = new Set(gates.map((g) => g.teaches));
  const firsts = (sec.uses ?? []).filter((u) => !taught.has(u) && sec.teaches !== u).flatMap((u) => sections.filter((t) => t.teaches === u && !t.phases.includes('start') && (t.archetypes === 'any' || (t.archetypes as string[]).includes(type))).slice(0, 1));
  const key = `10-${stage}`;
  return { ...W10_REQUIRED, [key]: [...gates.map((g) => ({ section: g.id, phase: 'start' as const })), ...(W10_REQUIRED[key] ?? []), ...firsts.map((t) => ({ section: t.id })), { section: sec.id }] };
}

/** which stage holds which sections (STAGE-RULES §2 "Sameness"): w10Ground's W10_STAGE_ONLY, the rest by archetype and theme */
const forStage = (stage: number, id: string): boolean => !W10_STAGE_ONLY[id] || W10_STAGE_ONLY[id].includes(stage);

/** the gear lifts' speed, px a second (World 9's pistons: 120 Normal, 95 Easy) */
export const W10_GEAR_SPEED = { normal: 170, easy: 130 } as const;

/** World 10's kit for one stage as the game plays it on `difficulty` */
export function w10GameKit(stage: number, difficulty: Difficulty = 'normal'): WorldKit {
  // (the swing builder's swings over the iron netting and the stage's room, Easy's version on Easy: w10Swing.ts, w10Rooms.ts)
  const k = withW10Swing(withW10Rooms(w10Kit(stage), stage, difficulty), stage, difficulty);
  const sections = k.manifest.sections.filter((s) => forStage(stage, s.id));
  // (the trapdoor grates' beats, by the difficulty played: trapdoor.ts TRAP; neighbours half a cycle apart, so a row is never all open)
  const decorate: WorldKit['decorate'] = (items, out) => {
    k.decorate?.(items, out);
    const beat = TRAP[difficulty === 'easy' ? 'easy' : 'normal'];
    out.platforms.filter((p) => p.style === 'w10_trap').sort((a, b) => a.x - b.x).forEach((p, i) => {
      p.trap = { ...beat, offset: Math.round(((i % 2) * 0.5 + ((p.x * 0.0007) % 0.25)) * beat.period * 100) / 100 };
    });
    // (the gear lifts (GRAB-BAG C) are geared, quicker than World 9's pistons (pipeline BOB): the wait for one, and the ride, are the slow
    // part of a gear section, and a stone block on a rack has no reason to crawl)
    for (const p of out.platforms) if (p.style === 'w10_gear' && p.lift) p.lift.speed = difficulty === 'easy' ? W10_GEAR_SPEED.easy : W10_GEAR_SPEED.normal;
    // (the knobs on a soft pit's floor under a row of moving planks (pipeline layStage, World 9's hook: hops, not a quiet walk under them
    // on Easy) in World 10's look: fallen rubble (w10PieceArt 'w10_rubble'), under the chain lifts and the counterweights)
    const rows = out.platforms.filter((p) => (p.style === 'w10_lift' || p.style === 'w10_cw') && p.lift);
    for (const p of out.platforms) {
      if (p.width !== BOB.knobW || p.height !== BOB.knobH || p.lift) continue;
      if (rows.some((r) => p.x + p.width > r.x - 260 && p.x < r.x + r.width + 260 && p.y > r.lift!.bottom)) p.style = 'w10_rubble';
    }
    // (the counterweight planks (GRAB-BAG B) ride in pairs on one chain: the second half a cycle behind the first, so one is up as the
    // other is down)
    const cws = out.platforms.filter((p) => p.style === 'w10_cw' && p.lift).sort((a, b) => a.x - b.x);
    for (let i = 0; i + 1 < cws.length; i += 2) {
      const a = cws[i].lift!, b = cws[i + 1].lift!;
      b.phase = Math.round((a.phase + liftCycle(a) / 2) * 10) / 10;
    }
  };
  return { ...k, decorate, manifest: { ...k.manifest, sections, required: devForced(stage, sections) ?? W10_REQUIRED } };
}
