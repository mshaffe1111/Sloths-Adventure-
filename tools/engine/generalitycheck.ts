/**
 * The generality gate (R-165.123; D43, Matt 11-11: "We're basically hard coding everything as we go"): engine code works for any stage.
 * It fails the build when engine code names one stage: a stage id ('1-1', '5-M', a world prefix '5-'), a world or stage number it
 * branches on (`worldIndex === 9`), a seed number (`seed === 4106`, `setLayoutVariant(31)`), or an x position (`p.x > 30784`).
 *
 *   npx tsx tools/engine/generalitycheck.ts                 (seconds; exit 1 on a new literal, or a known one that is gone)
 *   npx tsx tools/engine/generalitycheck.ts --list          (every hit, known or not, with its line)
 *   npx tsx tools/engine/generalitycheck.ts --write-known   (writes tools/engine/generality.known.json from today's hits: only to start
 *                                                            the list or to shrink it; knowncheck.mjs fails any entry it adds)
 *
 * Engine code = ENGINE_FILES and every .ts under ENGINE_DIRS (a new file there is checked from its first commit), minus EXEMPT.
 * World data, seed lists, per-stage data and tests may name stages: they are EXEMPT, each with its reason. A one-stage set piece
 * belongs in a per-stage script beside the world data (ENGINE-PLAN.md, the lead's review point 3), never in the engine.
 * Today's literals are the known debt (generality.known.json): each entry counts how many times that code appears in that file; more
 * fails (a new literal), fewer fails too (shrink the entry: the list only shrinks, LAWS.md law 5). Comments and Dot's words are not
 * code: the file is read as tokens (strings, template parts, numbers, names), never as lines of text.
 * Limits (named, not hidden): an x position under X_MIN px, or one held in a name outside X_NAMES, is not seen; a stage named through
 * a constant ('const FIRST = "1-1"' is caught at the constant, not where it is used); a world number held in a name outside WORLD_NAMES.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const KNOWN_FILE = 'tools/engine/generality.known.json';

/** the core engine every stage runs on */
export const ENGINE_FILES = [
  'src/game/engine.ts', 'src/game/physics.ts', 'src/game/inputEngine.ts', 'src/game/cameraFollow.ts', 'src/game/cameraReach.ts',
  'src/game/frameGovernor.ts', 'src/game/helpLadder.ts',
];
/** gen2's machinery: every .ts below these, unless EXEMPT */
export const ENGINE_DIRS = ['src/game/gen2/'];
/** what may name stages, and why */
export const EXEMPT: Array<[string | RegExp, string]> = [
  [/\.test\.ts$/, 'tests: a test may require any stage'],
  ['src/game/gen2/worlds/', "world data: each world's sections, kits, rooms and stage wiring"],
  ['src/game/gen2/toyWorld.ts', "world data: the pipeline tests' toy world (nothing in it is played)"],
  ['src/game/gen2/seeds.ts', 'seed list: the curated layouts (written by tools/gen2/curate.ts)'],
  ['src/game/gen2/provenSeeds.ts', 'seed list: the proven seeds (written by tools/engine/seedlist.ts)'],
  ['src/game/gen2/firstRun11.ts', "per-stage data: 1-1's one fixed first run (ADR-002), a seed and its plan"],
  [/Harness\.ts$/, 'test harnesses for one world (w6Harness, w7Harness, w8Harness)'],
];

export const STAGE_ID = /^(\d{1,2}|S)-(\d{1,2}|[A-Z])$/;
/** a stage id inside a longer name ('normal-1-1', 'w5:5-7'), or a world's prefix ('5-', as in id.startsWith('5-')) */
const STAGE_IN = /(?:^|[-_:/])(?:\d{1,2}|S)-(?:\d{1,2}|[DM])$|^(?:\d{1,2}|S)-(?:\d{1,2}|[DM])[-_:/]|^\d{1,2}-$/;
export const WORLD_NAMES = new Set(['worldIndex', 'miniIndex', 'world', 'mini', 'worldNo', 'miniNo', 'stageIndex', 'worldNum', 'stageNum']);
/** a name that holds a seed itself (seed, layoutSeed, FIRST_SEED, seeds, layoutVariant), not a count of seeds (SEED_LIST_MIN) */
const SEED_NAME = /(seed|variant)s?$/i;
export const X_NAMES = new Set(['x', 'x0', 'x1', 'x2', 'px', 'startX', 'endX', 'atX', 'fromX', 'toX', 'minX', 'maxX', 'leftX', 'rightX', 'spawnX', 'goalX', 'flagX', 'worldX', 'stageX', 'posX']);
/** an x this far into a stage is a place, not an offset, a reach or a screen size */
export const X_MIN = 1000;

export type Kind = 'stage-id' | 'world-key' | 'seed' | 'x-pos';
export interface Hit { file: string; line: number; kind: Kind; code: string }
interface Tok { t: 'id' | 'num' | 'str' | 'p'; v: string; line: number; at?: number }

const REGEX_AFTER = new Set(['return', 'typeof', 'case', 'in', 'of', 'delete', 'void', 'throw', 'new', 'else', 'do', 'instanceof', 'yield', 'await']);
const PUNCT = ['>>>=', '===', '!==', '...', '**=', '<<=', '>>=', '>>>', '&&=', '||=', '??=', '==', '!=', '<=', '>=', '=>', '&&', '||', '??', '?.', '++', '--', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<', '>>', '**'];
const NUM = /0[xX][0-9a-fA-F_]+n?|0[bB][01_]+n?|0[oO][0-7_]+n?|(?:\d[\d_]*)?\.?\d[\d_]*(?:[eE][+-]?\d+)?n?/y;
const ID = /[A-Za-z_$À-￿][\w$À-￿]*/y;

/** the file as tokens: comments dropped, strings and template parts as 'str', regex literals as one '/re/' */
export function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  let line = 1;
  let depth = 0;
  const tpl: number[] = []; // the brace depth each open `${` returns to
  const regexOk = () => {
    const p = out[out.length - 1];
    if (!p) return true;
    if (p.t === 'num' || p.t === 'str') return false;
    if (p.t === 'id') return REGEX_AFTER.has(p.v);
    // (a `!` straight after a name or a bracket is TypeScript's non-null mark: `k.high! / 0.73` divides)
    if (p.v === '!' && /[\w$)\]]/.test(src[(p.at ?? 0) - 1] ?? '')) return false;
    return !(p.v === ')' || p.v === ']' || p.v === '}');
  };
  const template = () => {
    let s = '';
    const l = line;
    while (i < src.length) {
      const c = src[i];
      if (c === '\\') {
        s += src[i + 1] ?? '';
        if (src[i + 1] === '\n') line++;
        i += 2;
        continue;
      }
      if (c === '`') {
        i++;
        out.push({ t: 'str', v: s, line: l });
        return;
      }
      if (c === '$' && src[i + 1] === '{') {
        i += 2;
        out.push({ t: 'str', v: s, line: l });
        tpl.push(depth++);
        out.push({ t: 'p', v: '(', line });
        return;
      }
      if (c === '\n') line++;
      s += c;
      i++;
    }
  };
  while (i < src.length) {
    const c = src[i];
    if (c === '\n') {
      line++;
      i++;
    } else if (c === ' ' || c === '\t' || c === '\r' || c === '\f' || c === '\v' || c === '﻿') i++;
    else if (c === '/' && src[i + 1] === '/') while (i < src.length && src[i] !== '\n') i++;
    else if (c === '/' && src[i + 1] === '*') {
      const e = src.indexOf('*/', i + 2);
      const end = e < 0 ? src.length : e + 2;
      for (let k = i; k < end; k++) if (src[k] === '\n') line++;
      i = end;
    } else if (c === '"' || c === "'") {
      let s = '';
      const l = line;
      i++;
      while (i < src.length && src[i] !== c && src[i] !== '\n') {
        if (src[i] === '\\') {
          s += src[i + 1] ?? '';
          i += 2;
        } else s += src[i++];
      }
      i++;
      out.push({ t: 'str', v: s, line: l });
    } else if (c === '`') {
      i++;
      template();
    } else if (c === '}' && tpl.length && tpl[tpl.length - 1] === depth - 1) {
      depth--;
      tpl.pop();
      i++;
      out.push({ t: 'p', v: ')', line });
      template();
    } else if (c === '/' && regexOk()) {
      i++;
      let cls = false;
      while (i < src.length && src[i] !== '\n') {
        const d = src[i];
        if (d === '\\') i += 2;
        else {
          i++;
          if (cls) cls = d !== ']';
          else if (d === '[') cls = true;
          else if (d === '/') break;
        }
      }
      while (i < src.length && /[a-z]/i.test(src[i])) i++;
      out.push({ t: 'p', v: '/re/', line });
    } else if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] ?? ''))) {
      NUM.lastIndex = i;
      const m = NUM.exec(src)!;
      out.push({ t: 'num', v: m[0].replace(/_/g, ''), line });
      i += m[0].length;
    } else {
      ID.lastIndex = i;
      const m = ID.exec(src);
      if (m && m.index === i) {
        out.push({ t: 'id', v: m[0], line });
        i += m[0].length;
        continue;
      }
      const p = PUNCT.find((q) => src.startsWith(q, i)) ?? c;
      if (p === '{') depth++;
      if (p === '}') depth--;
      out.push({ t: 'p', v: p, line, at: i });
      i += p.length;
    }
  }
  return out;
}

const CMP = new Set(['===', '!==', '==', '!=', '<', '>', '<=', '>=']);
const EQ = new Set(['===', '!==', '==', '!=']);
const show = (t: Tok) => (t.t === 'str' ? `'${t.v}'` : t.v);
/** `a.b?.c` ending at k: its first token's index */
function chainStart(ts: Tok[], k: number): number {
  let s = k;
  while (s >= 2 && (ts[s - 1].v === '.' || ts[s - 1].v === '?.') && ts[s - 2].t === 'id') s -= 2;
  return s;
}
/** `a.b?.c` starting at k: its last token's index */
function chainEnd(ts: Tok[], k: number): number {
  let e = k;
  while (e + 2 < ts.length && (ts[e + 1].v === '.' || ts[e + 1].v === '?.') && ts[e + 2].t === 'id') e += 2;
  return e;
}
/** tokens a..b as code, spaced the usual way: `cfg.worldIndex === 9`, `scopeOf('1-1'`, `stages: ['1-1'` */
function render(ts: Tok[], a: number, b: number): string {
  let s = '';
  for (let i = a; i <= b; i++) {
    const v = show(ts[i]);
    const p = ts[i - 1]?.v;
    const tight = i === a || /^(\.|\?\.|\)|\]|,|:)$/.test(ts[i].v) || p === '.' || p === '?.' || p === '(' || p === '[' || (ts[i].v === '(' && ts[i - 1]?.t === 'id');
    s += (tight ? '' : ' ') + v;
  }
  return s;
}
/** the code around a stage id at k: what it is compared with, passed to, or the key it is given under */
function aroundString(ts: Tok[], k: number): [number, number] {
  const p = ts[k - 1]?.v;
  if (p && (CMP.has(p) || p === ':' || p === '=') && ts[k - 2]?.t === 'id') return [chainStart(ts, k - 2), k];
  if (p === '(' && ts[k - 2]?.t === 'id') return [chainStart(ts, k - 2), k];
  if (p === ':' && ts[k - 2]?.t === 'str') return [k - 2, k];
  if (p === '[' && (ts[k - 2]?.v === ':' || ts[k - 2]?.v === '=') && ts[k - 3]?.t === 'id') return [chainStart(ts, k - 3), k];
  if (ts[k + 1]?.v === ':' && (p === '{' || p === ',')) return [k, k + 1];
  if (ts[k + 1] && CMP.has(ts[k + 1].v) && ts[k + 2]?.t === 'id') return [k, chainEnd(ts, k + 2)];
  return [Math.max(0, k - 1), k];
}
/** a number token at k, with a unary minus before it: its value and first index */
function numAt(ts: Tok[], k: number): { v: number; a: number; b: number } | null {
  if (ts[k]?.t === 'num') return { v: Number(ts[k].v.replace(/n$/, '')), a: k, b: k };
  if (ts[k]?.v === '-' && ts[k + 1]?.t === 'num') return { v: -Number(ts[k + 1].v.replace(/n$/, '')), a: k, b: k + 1 };
  return null;
}

/** every place this file's code names one stage */
export function scan(src: string, file: string): Hit[] {
  const ts = tokenize(src);
  const hits: Hit[] = [];
  const add = (kind: Kind, line: number, a: number, b: number) => hits.push({ file, line, kind, code: render(ts, a, b) });
  const nameKind = (name: string, n: number, op: string): Kind | null => {
    if (WORLD_NAMES.has(name) && CMP.has(op)) return 'world-key';
    if (SEED_NAME.test(name) && EQ.has(op)) return 'seed';
    if (X_NAMES.has(name) && CMP.has(op) && Math.abs(n) >= X_MIN) return 'x-pos';
    return null;
  };
  let switchOn: { kind: Kind; depth: number } | null = null;
  let depth = 0;
  for (let k = 0; k < ts.length; k++) {
    const t = ts[k];
    if (t.v === '{') depth++;
    if (t.v === '}' && --depth < (switchOn?.depth ?? -1)) switchOn = null;
    // 1. a stage id, or a world's prefix, in a string (a template's fixed parts included)
    if (t.t === 'str' && (STAGE_ID.test(t.v) || STAGE_IN.test(t.v))) {
      add('stage-id', t.line, ...aroundString(ts, k));
      continue;
    }
    // 2. name <op> number, and number <op> name
    if (t.t === 'p' && CMP.has(t.v)) {
      const left = ts[k - 1];
      const n = numAt(ts, k + 1);
      if (left?.t === 'id' && n) {
        const kind = nameKind(left.v, n.v, t.v);
        if (kind) add(kind, t.line, chainStart(ts, k - 1), n.b);
      }
      const ln = ts[k - 1]?.t === 'num' ? numAt(ts, ts[k - 2]?.v === '-' ? k - 2 : k - 1) : null;
      if (ln && ts[k + 1]?.t === 'id') {
        const e = chainEnd(ts, k + 1);
        const kind = nameKind(ts[e].v, ln.v, t.v);
        if (kind) add(kind, t.line, ln.a, e);
      }
      continue;
    }
    if (t.t !== 'id') continue;
    // 3. a seed or an x place given as a value: `seed: 4106`, `layoutSeed = 77`, `x: 30784`, `seeds: [172, 476]`
    const op = ts[k + 1]?.v;
    if (op === ':' || op === '=') {
      const n = numAt(ts, k + 2);
      if (n && SEED_NAME.test(t.v) && Math.abs(n.v) > 1) add('seed', t.line, k, n.b);
      else if (n && X_NAMES.has(t.v) && Math.abs(n.v) >= X_MIN) add('x-pos', t.line, k, n.b);
      else if (SEED_NAME.test(t.v) && ts[k + 2]?.v === '[' && ts[k + 3]?.t === 'num') {
        let e = k + 3;
        while (ts[e + 1]?.v === ',' && ts[e + 2]?.t === 'num') e += 2;
        add('seed', t.line, k, e);
      }
    }
    // 4. setLayoutVariant(31): a stage's layout roll picked by number
    if (t.v === 'setLayoutVariant' && ts[k + 1]?.v === '(') {
      const n = numAt(ts, k + 2);
      if (n) add('seed', t.line, k, n.b);
    }
    // 5. [3, 4].includes(worldIndex), [172, 476].includes(seed)
    if (t.v === 'includes' && ts[k - 1]?.v === '.' && ts[k - 2]?.v === ']' && ts[k + 1]?.v === '(' && ts[k + 2]?.t === 'id') {
      const name = ts[chainEnd(ts, k + 2)].v;
      const kind: Kind | null = WORLD_NAMES.has(name) ? 'world-key' : SEED_NAME.test(name) ? 'seed' : null;
      let a = k - 2;
      while (a > 0 && ts[a].v !== '[') a--;
      if (kind && ts.slice(a + 1, k - 2).some((x) => x.t === 'num')) add(kind, t.line, a, chainEnd(ts, k + 2) + 1);
    }
    // 6. switch (cfg.worldIndex) { case 9: ... }
    if (t.v === 'switch' && ts[k + 1]?.v === '(') {
      let e = k + 2;
      while (e < ts.length && ts[e].v !== ')') e++;
      const name = ts[e - 1]?.t === 'id' ? ts[e - 1].v : '';
      if (WORLD_NAMES.has(name)) switchOn = { kind: 'world-key', depth: depth + 1 };
      else if (SEED_NAME.test(name)) switchOn = { kind: 'seed', depth: depth + 1 };
    }
    if (t.v === 'case' && switchOn && depth === switchOn.depth) {
      const n = numAt(ts, k + 1);
      if (n) add(switchOn.kind, t.line, k, n.b);
    }
  }
  return hits;
}

const posix = (p: string) => p.split(path.sep).join('/');
const exemptWhy = (f: string) => EXEMPT.find(([m]) => (typeof m === 'string' ? (m.endsWith('/') ? f.startsWith(m) : f === m) : m.test(f)))?.[1] ?? null;

/** the engine files to check, and the exempt ones under the engine folders (with why) */
export function scope(root = ROOT): { files: string[]; exempt: Array<[string, string]> } {
  const files: string[] = [];
  const exempt: Array<[string, string]> = [];
  const take = (f: string) => {
    const why = exemptWhy(f);
    if (why) exempt.push([f, why]);
    else files.push(f);
  };
  for (const f of ENGINE_FILES) if (fs.existsSync(path.join(root, f))) take(f);
  const walk = (d: string) => {
    for (const e of fs.readdirSync(path.join(root, d), { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const p = posix(path.join(d, e.name));
      if (e.isDirectory()) walk(p);
      else if (/\.ts$/.test(e.name)) take(p);
    }
  };
  for (const d of ENGINE_DIRS) walk(d);
  return { files, exempt };
}

export interface Known { file: string; kind: Kind; code: string; count: number; why: string; owner: string }
const keyOf = (h: { file: string; kind: string; code: string }) => `${h.file}|${h.kind}|${h.code}`;

/** compare today's hits with the known list: new literals, and known ones that are gone or fewer */
export function judge(hits: Hit[], known: Known[]): { fresh: Hit[]; stale: Array<{ entry: Known; found: number }> } {
  const by = new Map<string, Hit[]>();
  for (const h of hits) by.set(keyOf(h), [...(by.get(keyOf(h)) ?? []), h]);
  const k = new Map(known.map((e) => [keyOf(e), e]));
  const fresh: Hit[] = [];
  const stale: Array<{ entry: Known; found: number }> = [];
  for (const [key, hs] of by) {
    const allowed = k.get(key)?.count ?? 0;
    if (hs.length > allowed) fresh.push(...hs.slice(allowed));
  }
  for (const e of known) {
    const found = by.get(keyOf(e))?.length ?? 0;
    if (found < e.count) stale.push({ entry: e, found });
  }
  return { fresh, stale };
}

/** the known list's entry ids for knowncheck.mjs: one per counted occurrence, so a raised count shows as an added id */
export const knownIds = (known: Known[]) => known.flatMap((e) => Array.from({ length: e.count }, (_, i) => `${keyOf(e)}#${i + 1}`));

const WHY: Record<Kind, string> = {
  'stage-id': 'a stage named in engine code',
  'world-key': 'a rule keyed to one world or stage number',
  seed: 'a seed number in engine code',
  'x-pos': 'an x position in engine code',
};

function main() {
  const args = process.argv.slice(2);
  const { files, exempt } = scope();
  const hits = files.flatMap((f) => scan(fs.readFileSync(path.join(ROOT, f), 'utf8'), f));
  const knownPath = path.join(ROOT, KNOWN_FILE);
  const doc = fs.existsSync(knownPath) ? JSON.parse(fs.readFileSync(knownPath, 'utf8')) : { known: [] };
  const known: Known[] = doc.known;
  if (args.includes('--list')) for (const h of hits) console.log(`${h.file}:${h.line}  ${h.kind}  ${h.code}`);
  if (args.includes('--write-known')) {
    const old = new Map(known.map((e) => [keyOf(e), e]));
    const counts = new Map<string, { h: Hit; n: number }>();
    for (const h of hits) counts.set(keyOf(h), { h, n: (counts.get(keyOf(h))?.n ?? 0) + 1 });
    const next: Known[] = [...counts.values()].map(({ h, n }) => ({
      file: h.file, kind: h.kind, code: h.code, count: n, why: old.get(keyOf(h))?.why ?? WHY[h.kind],
      owner: old.get(keyOf(h))?.owner ?? 'R-165.123 burn-down: move it into world data or a per-stage script (lead assigns)',
    }));
    fs.writeFileSync(knownPath, JSON.stringify({ about: doc.about ?? '', known: next }, null, 1) + '\n');
    console.log(`wrote ${KNOWN_FILE}: ${next.length} entries, ${hits.length} literals`);
    return 0;
  }
  const { fresh, stale } = judge(hits, known);
  console.log(`generality check: ${files.length} engine files (${exempt.length} exempt under the engine folders), ${hits.length} literals, ${knownIds(known).length} known`);
  for (const h of fresh) console.log(`✗ NEW ${h.kind}: ${h.file}:${h.line}  ${h.code}  (${WHY[h.kind]}: put it in world data or a per-stage script)`);
  for (const s of stale) console.log(`✗ FIXED, still listed: ${s.entry.file}  ${s.entry.kind}  ${s.entry.code}  known ${s.entry.count}, found ${s.found}: lower its count in ${KNOWN_FILE}`);
  const ok = !fresh.length && !stale.length;
  console.log(ok ? 'PASS' : 'FAIL');
  return ok ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exit(main());
