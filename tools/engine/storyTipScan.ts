// The laid-line gate (R-165.412; ENG-JETTY's scan, made a gate by WARN-412): every line a listed stage LAYS (proto.hints) is said on the
// DEFAULT settings, on a fresh device. Each listed stage, its first proven seed, both settings, built the way the game builds it
// (RealPlay): each StageHint is put through Dot's guide as the engine sends it (engine.ts: StageHint.warn / teach / story ->
// dotLines.ts engineGuideLine) and Tips' rule (dotGuideHelp.ts helpAllows, nothing seen yet). Tips, Normal's default, is the stricter
// of the two defaults (Easy's is Help), so both settings' lines are held to it.
// A dropped line is a defect at its source: a warning is laid as a warning (StageHint.warn: the pipeline's water line), a once-only
// story beat as a story line (the world's storyTips), a stage's own coaching as its teach line (teachTips; the mixer's line.teach).
// The Tips filter for plain information is never loosened (a real reminder stays a reminder; it is not laid as a stage line).
// A line the engine itself never says (marked heard as the stage starts, engine.ts: 1-1's "No soft moss up here!") is not counted.
//   npx tsx tools/engine/storyTipScan.ts              every listed stage: the list
//   npx tsx tools/engine/storyTipScan.ts 2-5,2-7      those stages
//   npx tsx tools/engine/storyTipScan.ts --check      the gate: exit 1 on any dropped line (CI, gates.yml 'rolled')
import '../../src/game/headlessDom.ts';
import { engineGuideLine } from '../../src/game/dotLines.ts';
import { helpAllows } from '../../src/game/dotGuideHelp.ts';
import type { StageHint } from '../../src/game/protoStage.ts';

/** the lines of these laid hints that Tips (Normal's default) drops on a fresh device: as the engine sends each (engine.ts) and Dot's
 *  guide takes it (dotLines.ts engineGuideLine, Dot with him), then Tips' rule (helpAllows, nothing seen, the story switch on) */
export function droppedOnTips(stageId: string, hints: readonly StageHint[]): Array<{ kind: string; move?: string; text: string }> {
  const out: Array<{ kind: string; move?: string; text: string }> = [];
  for (const h of hints) {
    // (the engine marks it heard as the stage starts: it is never said, on any setting)
    if (h.shown) continue;
    const l = engineGuideLine(h.text, stageId, { dot: true, teach: h.teach, who: h.story, warn: h.warn });
    if (!l || helpAllows(l, 'reminders', new Set(), true)) continue;
    out.push({ kind: l.kind, ...(l.move ? { move: l.move } : {}), text: h.text });
  }
  return out;
}

async function main(): Promise<void> {
  const { RealPlay } = await import('../../src/game/realPlay.ts');
  const { setDifficulty } = await import('../../src/game/difficulty.ts');
  const { LISTED } = await import('../../src/game/gen2/listed.ts');
  const { provenSeeds } = await import('../../src/game/gen2/seedList.ts');
  const args = process.argv.slice(2);
  const check = args.includes('--check');
  const only = args.find((a) => !a.startsWith('--'))?.split(',');
  const ids = Object.keys(LISTED).filter((id) => !only || only.includes(id)).sort();
  let dropped = 0;
  let laid = 0;
  for (const id of ids) {
    const seed = provenSeeds(id)[0] ?? 1;
    const lines = new Map<string, string[]>();
    for (const d of ['normal', 'easy'] as const) {
      setDifficulty(d);
      const r = new RealPlay(id, seed);
      const hints = (r.e as unknown as { proto?: { hints?: StageHint[] } }).proto?.hints ?? [];
      laid += hints.length;
      for (const l of droppedOnTips(id, hints)) {
        const k = `${l.kind}${l.move ? ` move:${l.move}` : ''} | ${l.text}`;
        lines.set(k, [...(lines.get(k) ?? []), d]);
      }
    }
    for (const [k, ds] of lines) {
      dropped++;
      console.log(`${id} seed ${seed} (${ds.join('+')}) | ${k}`);
    }
  }
  setDifficulty('normal');
  console.log(`storyTipScan: ${dropped} laid tip line(s) dropped on Tips (Normal's default) over ${ids.length} listed stage(s), ${laid} laid line(s) read`);
  if (check && dropped) {
    console.log('storyTipScan --check: FAIL. Lay each at its source: a warning with StageHint.warn, a story beat in storyTips, a stage\'s own coaching in teachTips (R-165.412)');
    process.exit(1);
  }
}

if (process.argv[1] && /storyTipScan\.ts$/.test(process.argv[1])) await main();
