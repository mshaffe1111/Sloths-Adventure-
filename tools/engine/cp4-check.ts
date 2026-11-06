// CP3: the mixed 1-5, built as the engine builds it (generateStage, then easyStage on Easy), 16 rolls x 2 settings: the level check
// (levelCheck.ts validateStage), the expert length, and the ideas rolled. Retries are counted (a roll the check fails is a retry).
import '../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { generateStage, setLayoutVariant } from '../../src/game/stageGenerator.ts';
import { easyStage } from '../../src/game/easyMode.ts';
import { withGoals } from '../../src/game/goals.ts';
import { modelAll } from '../../src/game/stageTime.ts';
const secs: Record<string, number[]> = { normal: [], easy: [] };
import { validateStage, easyHoldCheck } from '../../src/game/levelCheck.ts';
const c = generateAllLevels().find((l) => l.id === (process.env.SID ?? '1-5'))!;
let ok = 0, n = 0; const errs = new Map<string, number>();
for (let v = 1; v <= 16; v++) for (const setting of ['normal', 'easy'] as const) {
  n++;
  setLayoutVariant(v);
  let st;
  try { st = setting === 'easy' ? easyStage(withGoals(generateStage({ ...c, unlocked: true }, 'easy'))) : withGoals(generateStage({ ...c, unlocked: true }, 'normal')); }
  catch (e) { errs.set('build: ' + String((e as Error).message).slice(0, 120), (errs.get('build: ' + String((e as Error).message).slice(0, 120)) ?? 0) + 1); continue; }
  finally { setLayoutVariant(null); }
  const r0 = validateStage(st, { rooms: false });
  const held = setting === 'easy' ? easyHoldCheck(st as any) : [];
  const r = { ...r0, ok: r0.ok && !held.length, errors: [...r0.errors, ...held.map((e: string) => 'Easy 70% hold: ' + e)] };
  const mix = (st.meta as any)?.mix?.explain as Array<{ node: number; idea: string; road?: string }> | undefined;
  secs[setting].push(Math.round(modelAll(st as any).fast.total));
  if (r.ok) ok++;
  else for (const e of r.errors.slice(0, 3)) { const k = e.replace(/-?\d+(\.\d+)?/g, '#').slice(0, 140); errs.set(k, (errs.get(k) ?? 0) + 1); }
  if (v <= 2) console.log(`${setting} roll ${v}: ${r.ok ? 'PASS' : 'FAIL'} width ${(st.config as any).levelWidth} px, ${st.platforms.length} platforms; ${mix ? mix.map((e) => e.idea + (e.road ? `(${e.road[0]})` : '')).join(' > ') : 'NO MIX'}`);
}
console.log(`level check: ${ok}/${n} pass`);
for (const k of ['normal', 'easy']) { const a = [...secs[k]].sort((x, y) => x - y); console.log(`fast player (stageTime.ts MODEL_FAST), ${k}: ${a[0]}-${a[a.length - 1]} s, median ${a[a.length >> 1]} s (floor 120)`); }
for (const [k, v] of [...errs].sort((a, b) => b[1] - a[1]).slice(0, 12)) console.log(`  ${v} x ${k}`);
