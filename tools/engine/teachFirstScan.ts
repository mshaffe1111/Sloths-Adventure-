// The first-appearance gate (R-165.427, TEACH-11; storyTipScan's twin): Matt's rule "the first appearance of a mechanic is taught".
// For every listed stage, every proven roll, both settings, built the way the game builds it (RealPlay, a fresh device): each mechanic
// Dot teaches with a line (a section of the kit that `teaches` it carries a tip socket) and that this roll shows (the brief's `teaches`
// or a laid section's), unless an earlier stage taught it (manifest.lessons), must have its teach line:
//   1. LAID: a tip in a section that teaches it, in the first section (lay order, never x order: D130) that shows it, or before;
//   2. SAID on the default settings: Tips (Normal's default, the stricter of the two: Easy's is Help) does not drop it
//      (storyTipScan.ts droppedOnTips), and it is laid as a teach line (StageHint.teach, or a warning) so it never waits out Dot's calm
//      gap: as a plain move tip, 1-1's double line on seed 5033 came ~1,900 px past the first tall step it teaches;
//   3. BEFORE the first required move of it on the route (the lay's asks, pipeline.ts laidAsks, in lay order): no ask of that move in a
//      section before the teach, and in the teach's own section the line stands before the first ask, in the section's walking direction.
//   npx tsx tools/engine/teachFirstScan.ts                 every listed stage, every proven seed: the list
//   npx tsx tools/engine/teachFirstScan.ts 1-1 --seeds 20  those stages, their first 20 seeds
//   npx tsx tools/engine/teachFirstScan.ts --check         the gate: exit 1 on any miss (CI, gates.yml 'rolled')
// Its own test (planted reds: the teach moved past its first use, laid as a plain tip, not laid): tools/engine/teachFirstScan.test.ts.
import '../../src/game/headlessDom.ts';
import { droppedOnTips } from './storyTipScan.ts';
import type { StageHint } from '../../src/game/protoStage.ts';
import type { FilledSocket, PlacedSection } from '../../src/game/gen2/types.ts';

/** what the scan reads of one built roll (a Gen2Stage as RealPlay builds it, its kit's manifest and the lay's asks) */
export interface TeachRoll {
  stageId: string;
  sections: ReadonlyArray<Pick<PlacedSection, 'uid' | 'template' | 'x0' | 'x1'>>;
  fills: ReadonlyArray<Pick<FilledSocket, 'section' | 'socket' | 'role' | 'what' | 'x' | 'unsaid'>>;
  hints: readonly StageHint[];
  asks: ReadonlyArray<{ x0: number; x1: number; move: string; block?: string; section: string }>;
  manifest: {
    sections: ReadonlyArray<{ id: string; teaches?: string; uses?: readonly string[]; needs?: readonly string[]; subBlocks?: ReadonlyArray<{ versions: ReadonlyArray<{ sockets?: ReadonlyArray<{ role: string; allow?: readonly string[] }> }> }> }>;
    lessons?: Readonly<Record<string, string>>;
    graphs?: { briefs?: Readonly<Record<string, { teaches?: readonly string[] }>> };
  };
  /** the stage order (stageOrder in the pipeline): an earlier stage's lesson is not this stage's to teach */
  before: (a: string, b: string) => boolean;
  /** the moves the first-stage touch coach teaches on this stage, on a fresh device, at the first thing that needs each (touchCoach.ts
   *  coachWanted; its steps 'run' and 'jump'): their first appearance is the coach's to teach, not a Dot line's */
  coach?: readonly string[];
}

/** the touch coach's steps that teach a move (touchCoach.ts CoachStep: slide to run, slide up to jump) */
export const COACH_MOVES: readonly string[] = ['run', 'jump'] satisfies Array<Exclude<import('../../src/game/touchCoach.ts').CoachStep, 'nice' | null>>;

/** each mechanic whose first appearance on this roll is not taught first, by name */
export function teachFirstMisses(r: TeachRoll): string[] {
  const out: string[] = [];
  const tpl = new Map(r.manifest.sections.map((t) => [t.id, t]));
  // (a section's Dot line: a tip socket that names a line; an empty one, w1-mushroom-lift's, lays nothing: pipeline fillSockets)
  const hasLine = (t: TeachRoll['manifest']['sections'][number] | undefined) => !!t?.subBlocks?.some((b) => b.versions.some((v) => (v.sockets ?? []).some((k) => k.role === 'tip' && !!k.allow?.length)));
  const lined = new Set(r.manifest.sections.filter((t) => t.teaches && hasLine(t)).map((t) => t.teaches!));
  const earlier = new Set(Object.entries(r.manifest.lessons ?? {}).filter(([, s]) => r.before(s, r.stageId)).map(([m]) => m));
  const shows = (id: string, m: string) => { const t = tpl.get(id); return !!t && (t.teaches === m || !!t.uses?.includes(m) || !!t.needs?.includes(m)); };
  const ms = new Set([...(r.manifest.graphs?.briefs?.[r.stageId]?.teaches ?? []), ...r.sections.map((q) => tpl.get(q.template)?.teaches).filter((m): m is string => !!m)]);
  const order = r.sections.map((q) => q.uid);
  for (const m of [...ms].sort()) {
    if (!lined.has(m) || earlier.has(m) || r.coach?.includes(m)) continue;
    const first = r.sections.findIndex((q) => shows(q.template, m));
    // (a section that teaches it with no Dot line of its own teaches it its own way, the lesson card: the bounce's lesson.bounce)
    const own = first >= 0 ? tpl.get(r.sections[first].template) : undefined;
    if (own?.teaches === m && !hasLine(own)) continue;
    const ask0 = r.asks.findIndex((a) => a.move === m || a.block === m);
    const askSec = ask0 >= 0 ? order.indexOf(r.asks[ask0].section) : -1;
    const need = first < 0 ? askSec : askSec < 0 ? first : Math.min(first, askSec);
    if (need < 0) continue;
    const at = `${r.sections[need].uid} ${r.sections[need].template}`;
    const tip = r.fills.filter((f) => f.role === 'tip' && f.what && !f.unsaid && tpl.get(r.sections[order.indexOf(f.section)]?.template ?? '')?.teaches === m)
      .sort((a, b) => order.indexOf(a.section) - order.indexOf(b.section))[0];
    if (!tip) { out.push(`${m}: no teach line laid; first shown in ${at}`); continue; }
    const ti = order.indexOf(tip.section);
    if (ti > need) { out.push(`${m}: teach line "${tip.what}" laid in ${tip.section}, after ${at} shows it first`); continue; }
    const h = r.hints.find((q) => Math.abs(q.x - tip.x) < 1);
    if (!h) { out.push(`${m}: teach line "${tip.what}" filled at x ${Math.round(tip.x)} but no hint laid there`); continue; }
    if (droppedOnTips(r.stageId, [h]).length) out.push(`${m}: teach line "${tip.what}" is dropped on Tips (Normal's default)`);
    if (!h.teach && !h.warn) out.push(`${m}: teach line "${tip.what}" laid as a plain tip (not StageHint.teach): it waits out Dot's calm gap and can come after ${at}`);
    if (ti === need && ask0 >= 0 && askSec === need) {
      // (its walking direction from the route, the next section's place: a leg run leftward judges the other way, D130)
      const s = r.sections[need], a = r.asks[ask0], nx = r.sections[need + 1];
      const right = !nx || nx.x0 >= s.x0;
      if (right ? h.x > Math.min(a.x0, a.x1) : h.x < Math.max(a.x0, a.x1)) out.push(`${m}: teach line "${tip.what}" at x ${Math.round(h.x)} stands past the first ${m} in ${at} (x ${Math.round(a.x0)}..${Math.round(a.x1)})`);
    }
  }
  return out;
}

async function main(): Promise<void> {
  const { RealPlay } = await import('../../src/game/realPlay.ts');
  const { setDifficulty } = await import('../../src/game/difficulty.ts');
  const { LISTED } = await import('../../src/game/gen2/listed.ts');
  const { provenSeeds } = await import('../../src/game/gen2/seedList.ts');
  const { laidAsks } = await import('../../src/game/gen2/pipeline.ts');
  const { coachWanted } = await import('../../src/game/touchCoach.ts');
  // (a phone, as the testers play: a coarse pointer, so a fresh 1-1 has its touch coach, coachWanted; dotPace.ts does the same)
  try {
    const w = globalThis as unknown as { window?: { matchMedia?: unknown } };
    if (w.window) w.window.matchMedia = () => ({ matches: true });
  } catch {
    /* no window */
  }
  // (a stage id's place in the game, '5-7' -> 507, as the pipeline's stageOrder reads it)
  const stageOrder = (id: string) => { const [w, n] = id.split('-').map(Number); return (w || 0) * 100 + (n || 0); };
  const args = process.argv.slice(2);
  const check = args.includes('--check');
  const si = args.indexOf('--seeds');
  const nSeeds = si >= 0 ? Number(args[si + 1]) : Infinity;
  const only = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--seeds')?.split(',');
  const ids = Object.keys(LISTED).filter((id) => !only || only.includes(id)).sort();
  let bad = 0, rolls = 0;
  const count: Record<string, number> = {};
  for (const id of ids) {
    const seeds = provenSeeds(id).slice(0, nSeeds);
    for (const seed of seeds) for (const d of ['normal', 'easy'] as const) {
      try {
        localStorage.clear();
      } catch {
        /* none */
      }
      setDifficulty(d);
      const p = new RealPlay(id, seed);
      const st = p.stage as unknown as { gen2: { sections: PlacedSection[]; fills: FilledSocket[] }; proto?: { hints?: StageHint[] } };
      const kit = LISTED[id].kit();
      rolls++;
      const miss = teachFirstMisses({ stageId: id, sections: st.gen2.sections, fills: st.gen2.fills, hints: st.proto?.hints ?? [], asks: laidAsks(st as never), manifest: kit.manifest as never, before: (a, b) => stageOrder(a) < stageOrder(b), coach: coachWanted(id, false) ? COACH_MOVES : [] });
      for (const m of miss) {
        bad++;
        count[id] = (count[id] ?? 0) + 1;
        console.log(`${id} seed ${seed} ${d} | ${m}`);
      }
    }
  }
  setDifficulty('normal');
  console.log(`teachFirstScan: ${bad} miss(es) over ${rolls} roll(s) of ${ids.length} listed stage(s)${bad ? ` (${Object.entries(count).map(([k, v]) => `${k} ${v}`).join(', ')})` : ''}`);
  if (check && bad) {
    console.log('teachFirstScan --check: FAIL. Lay each mechanic\'s teach line, as a teach line, in the first section that shows it, before its first ask (R-165.427)');
    process.exit(1);
  }
}

if (process.argv[1] && /teachFirstScan\.ts$/.test(process.argv[1])) await main();
