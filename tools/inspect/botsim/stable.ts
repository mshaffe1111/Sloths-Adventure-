/**
 * ENG-BOTSIM step 2 (the snapshot cut): which objects the engine reaches through its stage data (currentStage, drawPlats, proto) never
 * change in play. BOTSIM_STABLE=1: every probe samples a fingerprint of each such object (its own keys, numbers, strings and the identity
 * of each object it holds); at exit, per path (field.key[.key]), how many objects never changed and how many did, on stderr.
 * `stableSet(e)` returns the never-changed objects of the run so far (to freeze or share).
 */
const ids = new WeakMap<object, number>();
let nextId = 1;
const idOf = (o: object): number => {
  let i = ids.get(o);
  if (i === undefined) ids.set(o, (i = nextId++));
  return i;
};
const print = (o: object): string => {
  const out: string[] = [];
  if (Array.isArray(o)) {
    out.push('[' + o.length);
    for (const v of o) out.push(v !== null && typeof v === 'object' ? '#' + idOf(v) : typeof v === 'function' ? 'f' : String(v));
  } else if (o instanceof Map || o instanceof Set) {
    out.push('M' + o.size);
    for (const v of o instanceof Map ? [...o.keys(), ...o.values()] : [...o]) out.push(v !== null && typeof v === 'object' ? '#' + idOf(v) : String(v));
  } else if (ArrayBuffer.isView(o)) out.push('B' + Array.from(o as unknown as ArrayLike<number>).join(','));
  else for (const k of Reflect.ownKeys(o)) {
    const d = Object.getOwnPropertyDescriptor(o, k)!;
    const v = d.value;
    out.push(String(k) + '=' + (!('value' in d) ? 'acc' : v !== null && typeof v === 'object' ? '#' + idOf(v) : typeof v === 'function' ? 'f' : String(v)));
  }
  return out.join(',');
};
const FIELDS = ['currentStage', 'drawPlats', 'proto'];
const SKIP = /Canvas|Context|Image|Audio|HTMLElement|Path2D|ImageBitmap|WebGL|OffscreenCanvas|Node$/;
/** every object under the stage fields, by the path it was first met on (field.key.key, two levels named) */
const walk = (e: Record<string, unknown>): Map<object, string> => {
  const at = new Map<object, string>();
  const go = (v: unknown, path: string, depth: number): void => {
    if (v === null || typeof v !== 'object' || at.has(v) || Object.isFrozen(v) || SKIP.test(v.constructor?.name ?? '')) return;
    at.set(v, path);
    const name = (k: string | symbol) => (depth < 2 ? `${path}.${/^\d+$/.test(String(k)) ? '[]' : String(k)}` : path);
    if (Array.isArray(v)) v.forEach((x) => go(x, name('0'), depth + 1));
    else if (v instanceof Map) for (const [k, x] of v) { go(k, path, depth + 1); go(x, name('val'), depth + 1); }
    else if (v instanceof Set) for (const x of v) go(x, path, depth + 1);
    else if (!ArrayBuffer.isView(v)) for (const k of Reflect.ownKeys(v)) {
      const d = Object.getOwnPropertyDescriptor(v, k)!;
      if ('value' in d) go(d.value, name(k), depth + 1);
    }
  };
  for (const f of FIELDS) go(e[f], f, 0);
  return at;
};
let first: Map<object, string> | null = null;
const prints = new Map<object, string>();
const changed = new Set<object>();
let samples = 0;
export function stableSample(e: Record<string, unknown>): void {
  samples++;
  if (!first) {
    first = walk(e);
    for (const o of first.keys()) prints.set(o, print(o));
    return;
  }
  for (const [o, p0] of prints) if (!changed.has(o) && print(o) !== p0) changed.add(o);
}
export function stableSet(): Set<object> {
  return new Set([...prints.keys()].filter((o) => !changed.has(o)));
}
if (typeof process !== 'undefined' && process.env.BOTSIM_STABLE) process.on('exit', () => {
  if (!first) return;
  const by = new Map<string, [number, number]>();
  for (const [o, p] of first) {
    const r = by.get(p) ?? [0, 0];
    r[changed.has(o) ? 1 : 0]++;
    by.set(p, r);
  }
  const rows = [...by].sort((a, b) => b[1][0] + b[1][1] - a[1][0] - a[1][1]);
  const tot = rows.reduce((s, [, r]) => [s[0] + r[0], s[1] + r[1]], [0, 0]);
  process.stderr.write(`STABLE samples ${samples} objects ${first.size}: never changed ${tot[0]}, changed ${tot[1]}\n`);
  for (const [p, r] of rows.slice(0, 40)) process.stderr.write(`STABLE ${p} same ${r[0]} changed ${r[1]}\n`);
});
