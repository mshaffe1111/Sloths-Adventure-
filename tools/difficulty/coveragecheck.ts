/**
 * The meter's coverage gate (METER-2a, R-165.272; reference/design/METER-COVERAGE.md §3): no piece a built stage uses without a BOT that
 * plays it and a CHANNEL that prices it. Read-only, seconds.
 *
 *   npx tsx tools/difficulty/coveragecheck.ts            (the gate: exit 0 PASS, 1 FAIL with every fault in words)
 *   npx tsx tools/difficulty/coveragecheck.ts --list     (the vocabulary and what each built stage uses, no verdict)
 *
 * The VOCABULARY is read from the code, never a hand list: the route's moves (route.ts MoveKind), the platform types (types.ts Platform),
 * the creatures (types.ts EnemyType), the zones (zones.ts ZoneKind), the beat bricks (beatBrick.ts BrickOn), the ride ways (gen2/rideLay.ts
 * RideWay), the pad kinds (gen2/rideLay.ts PadRow.by), the skills (skills.ts SkillId) and the beat families beats.ts emits (its off() labels: the `fam` key every beat carries).
 * The TABLE is reference/design/meter-coverage.json: one entry per piece id, { bot: "file#symbol" | null, channel: "file#symbol" | null,
 * rows: [METER-COVERAGE.md # ids] }; a symbol resolves when its file declares it (a function, const, class, type or method; a dotted
 * tail is a key of it). The BUILT stages are every stage-table row (gen2/worlds/stageTable.ts) and every stage of the worlds the table
 * names as shipped (`shippedWorlds`: the world the testers play), scored on `seeds` x both settings by score.ts itself.
 * It FAILS when:
 *   (a) a piece in the vocabulary has no entry in the table (or the table names a piece the code no longer has);
 *   (b) a piece a built stage uses has bot or channel null and is not on the known list for that half;
 *   (c) score.ts refuses a built stage: it threw `unpriced piece <family>` (its old silent defaults, now refusals: score.ts unpriced);
 *   (d) a known-list entry is covered now (its half is non-null, or no built stage uses it): take it off (the list only shrinks);
 *   (e) a symbol the table names does not resolve.
 * The known list, tools/difficulty/coverage.known.json, holds the gaps that already existed on built stages when this gate started (each
 * with R-165.272 and its owner); knowncheck.mjs holds it to shrink-only (LAWS 5's one exception).
 */
import fs from 'node:fs';
import path from 'node:path';
import { STAGE_TABLE } from '../../src/game/gen2/worlds/stageTable.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { scoreStage, UnpricedPiece, COVERAGE_KNOWN, type CoverageKnown } from './score.ts';

const ROOT = path.resolve(import.meta.dirname, '../..');
export const TABLE_FILE = 'reference/design/meter-coverage.json';
export const KNOWN_FILE = 'tools/difficulty/coverage.known.json';

export interface Entry { bot: string | null; channel: string | null; rows: string[]; note?: string }
export interface Table { about?: string; shippedWorlds: number[]; seeds: number[]; pieces: Record<string, Entry> }

const read = (rel: string): string => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const strip = (src: string): string => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');

/** the string literals of a type union `type Name = 'a' | 'b'` (comments allowed between) */
export function unionOf(src: string, name: string): string[] {
  const m = new RegExp(`type\\s+${name}\\s*=([^;]+);`).exec(strip(src));
  if (!m) throw new Error(`coverage: no type ${name}`);
  return [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
}
/** the literals of a field's union inside an interface: `interface Name { ... field: 'a' | 'b'; ... }` */
export function fieldUnionOf(src: string, iface: string, field: string): string[] {
  const s = strip(src);
  const at = s.search(new RegExp(`interface\\s+${iface}\\b[^{]*\\{`));
  if (at < 0) throw new Error(`coverage: no interface ${iface}`);
  const m = new RegExp(`\\n\\s*${field}\\??\\s*:\\s*('[^;]+);`).exec(s.slice(at));
  if (!m) throw new Error(`coverage: no ${iface}.${field}`);
  return [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
}
/** the beat families beats.ts emits: every addAs / off() label, every literal 'beat:<label>', every span's label (its last literal) */
export function beatFamiliesOf(src: string): string[] {
  const s = strip(src);
  const out = new Set<string>();
  for (const m of s.matchAll(/addAs\(\s*(['"])(.+?)\1/g)) out.add(m[2]);
  for (const m of s.matchAll(/off\(\s*(['"])(.+?)\1\s*\)/g)) out.add(m[2]);
  for (const m of s.matchAll(/'beat:([^'$]+)'/g)) out.add(m[1]);
  // (a span names its family by its label unless it passes one: the zone spans pass 'zone:<kind>', the rest are beat:<label>)
  for (const m of s.matchAll(/\bspan\(([^;]*?)\);/g)) {
    if (/zone:/.test(m[1])) continue;
    const lits = [...m[1].matchAll(/(['"])([^'"]+)\1/g)].map((x) => x[2]);
    if (lits.length) out.add(lits[lits.length - 1]);
  }
  return [...out].map((l) => `beat:${l}`);
}

/** every piece id, from the code */
export function vocabulary(): string[] {
  const ids: string[] = [];
  const add = (ns: string, xs: string[]) => { for (const x of xs) ids.push(`${ns}:${x}`); };
  add('move', unionOf(read('tools/inspect/route.ts'), 'MoveKind'));
  add('platform', fieldUnionOf(read('src/game/types.ts'), 'Platform', 'type'));
  add('creature', unionOf(read('src/game/types.ts'), 'EnemyType'));
  add('zone', unionOf(read('src/game/zones.ts'), 'ZoneKind'));
  add('brick', unionOf(read('src/game/beatBrick.ts'), 'BrickOn'));
  add('ride', unionOf(read('src/game/gen2/rideLay.ts'), 'RideWay'));
  add('pad', fieldUnionOf(read('src/game/gen2/rideLay.ts'), 'PadRow', 'by'));
  add('skill', unionOf(read('src/game/skills.ts'), 'SkillId'));
  ids.push(...beatFamiliesOf(read('tools/inspect/beats.ts')));
  // (the stage-wide rows a stage may carry that make a piece of their own: ProtoExtras' field typed FollowRow, the little ones that follow
  //  him home (protoStage.ts proto.follow, run by followPlay.ts): its piece is the line, line:<field> (METER-4))
  const proto = strip(read('src/game/protoStage.ts'));
  const at = proto.search(/interface\s+ProtoExtras\b[^{]*\{/);
  for (const m of proto.slice(at).matchAll(/\n\s*(\w+)\?\s*:\s*import\('\.\/follow\.ts'\)\.FollowRow;/g)) ids.push(`line:${m[1]}`);
  return [...new Set(ids)].sort();
}

/** a `file#symbol` resolves when the file declares symbol's head (function / const / let / class / interface / type / enum / method or
 *  key) and has each dotted tail as a key or member */
export function resolves(ref: string, readFile: (rel: string) => string = read): string | null {
  const m = /^([^#]+)#([\w.]+)$/.exec(ref);
  if (!m) return `"${ref}" is not file#symbol`;
  let src: string;
  try { src = readFile(m[1]); } catch { return `${m[1]}: no such file`; }
  const [head, ...tail] = m[2].split('.');
  const decl = new RegExp(`(?:function\\*?|const|let|var|class|interface|type|enum)\\s+${head}\\b|^\\s+(?:(?:private|public|protected|static|readonly|async|get)\\s+)*${head}\\s*[(<:=]`, 'm');
  if (!decl.test(src)) return `${m[1]} declares no ${head}`;
  for (const t of tail) if (!new RegExp(`\\b${t}\\s*[:(=]`).test(src)) return `${m[1]}: ${head} has no ${t}`;
  return null;
}

/** the stages the gate holds: every stage-table row, and every stage of a shipped world */
export function builtStages(t: Pick<Table, 'shippedWorlds'>): string[] {
  const ids = new Set(Object.keys(STAGE_TABLE));
  for (const l of generateAllLevels()) if (t.shippedWorlds.includes(l.worldIndex)) ids.add(l.id);
  return [...ids].sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
}

/** what one built stage uses, as piece ids, on one seed and setting (score.ts's own build), or the refusal score.ts threw */
export function piecesOf(id: string, setting: 'normal' | 'easy', seed: number): { pieces: Set<string>; refused?: string } {
  const pieces = new Set<string>();
  let r;
  try { r = scoreStage(id, setting, seed, new Map()); } catch (e) {
    if (e instanceof UnpricedPiece) return { pieces: new Set([e.piece]), refused: e.message };
    throw e;
  }
  for (const p of r.pieces) pieces.add(p);
  return { pieces };
}

export interface Verdict { faults: string[]; uses: Map<string, Set<string>> }

/** the gate on given inputs (the test plants its faults here) */
export function judge(vocab: readonly string[], table: Table, known: readonly CoverageKnown[], uses: Map<string, Set<string>>, refusals: readonly string[], readFile = read): Verdict {
  const faults: string[] = [];
  const V = new Set(vocab);
  for (const id of vocab) if (!table.pieces[id]) faults.push(`(a) ${id}: in the code, no entry in ${TABLE_FILE}`);
  for (const id of Object.keys(table.pieces)) if (!V.has(id)) faults.push(`(a) ${id}: in ${TABLE_FILE}, but the code has no such piece`);
  for (const [id, e] of Object.entries(table.pieces)) for (const half of ['bot', 'channel'] as const) {
    const ref = e[half];
    if (ref === null) continue;
    const why = resolves(ref, readFile);
    if (why) faults.push(`(e) ${id}.${half}: ${why}`);
  }
  const knownHalf = (id: string, half: 'bot' | 'channel') => known.some((k) => k.id === id && k.missing.includes(half));
  for (const [id, stages] of uses) {
    const e = table.pieces[id];
    if (!e) continue;
    for (const half of ['bot', 'channel'] as const)
      if (e[half] === null && !knownHalf(id, half)) faults.push(`(b) ${id} on ${[...stages].join(' ')}: no ${half} (a built stage uses it: give it one, METER-COVERAGE §2)`);
  }
  for (const r of refusals) faults.push(`(c) ${r}`);
  for (const k of known) {
    for (const half of k.missing) if (table.pieces[k.id] && table.pieces[k.id][half] !== null) faults.push(`(d) known ${k.id} ${half}: covered now (${table.pieces[k.id][half]}): take it off ${KNOWN_FILE}`);
    if (!uses.has(k.id)) faults.push(`(d) known ${k.id}: no built stage uses it now: take it off ${KNOWN_FILE}`);
    if (!/^R-165\.272$/.test(k.R) || !k.owner) faults.push(`(d) known ${k.id}: needs R-165.272 and an owner`);
  }
  return { faults, uses };
}

/** the whole gate: the code's vocabulary, the table, the known list, and every built stage scored */
export function runGate(): Verdict & { stages: string[] } {
  const table: Table = JSON.parse(read(TABLE_FILE));
  const stages = builtStages(table);
  const uses = new Map<string, Set<string>>();
  const refusals: string[] = [];
  for (const id of stages) for (const setting of ['normal', 'easy'] as const) for (const seed of table.seeds) {
    const r = piecesOf(id, setting, seed);
    for (const p of r.pieces) (uses.get(p) ?? uses.set(p, new Set()).get(p)!).add(id);
    if (r.refused) refusals.push(`${id} ${setting} seed ${seed}: ${r.refused}`);
  }
  return { ...judge(vocabulary(), table, COVERAGE_KNOWN, uses, [...new Set(refusals)]), stages };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  if (process.argv.includes('--list')) {
    const table: Table = JSON.parse(read(TABLE_FILE));
    console.log(`vocabulary (${vocabulary().length}):\n  ${vocabulary().join('\n  ')}`);
    const g = runGate();
    console.log(`built stages: ${g.stages.join(' ')}`);
    for (const [id, st] of [...g.uses].sort()) console.log(`  ${id}: ${[...st].join(' ')}  bot=${table.pieces[id]?.bot ?? '-'} channel=${table.pieces[id]?.channel ?? '-'}`);
    process.exit(0);
  }
  const g = runGate();
  console.log(`meter coverage: ${g.stages.length} built stages (${g.stages.join(' ')}), ${g.uses.size} pieces used, ${COVERAGE_KNOWN.length} known gaps`);
  for (const f of g.faults) console.log(`  FAIL ${f}`);
  console.log(g.faults.length ? `coveragecheck: FAIL (${g.faults.length})` : 'coveragecheck: PASS');
  process.exit(g.faults.length ? 1 : 0);
}
