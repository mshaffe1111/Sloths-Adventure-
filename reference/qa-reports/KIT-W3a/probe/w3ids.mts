/**
 * w3ids.mts (KIT-W3a box 6): every section / brick, piece key and socket id World 3's kit file (w3.ts) exports, and its manifest's pool,
 * printed one per line, so a merge of w3.ts can be shown to hold the union of both parents.
 * Usage: npx tsx reference/qa-reports/KIT-W3a/probe/w3ids.mts <repo root>
 */
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const root = process.argv[2] ?? process.cwd();
const m = await import(pathToFileURL(path.join(root, 'src/game/gen2/worlds/w3.ts')).href) as Record<string, unknown>;
type T = { id: string; pieces?: { key: string }[]; sockets?: { id: string }[] };
const isT = (v: unknown): v is T => !!v && typeof v === 'object' && typeof (v as T).id === 'string' && Array.isArray((v as T).pieces);
const lines = new Set<string>();
const seen = new Map<string, T>();
for (const [name, v] of Object.entries(m)) {
  lines.add(`export ${name}`);
  const list = isT(v) ? [v] : Array.isArray(v) ? v.filter(isT) : [];
  for (const s of list) seen.set(s.id, s);
  if (Array.isArray(v) && list.length) lines.add(`array ${name} = ${list.map((s) => s.id).join(',')}`);
}
const man = (m.w3Manifest as () => { sections: T[]; hazards?: { id: string }[] })();
for (const s of man.sections) seen.set(s.id, s);
lines.add(`manifest.sections = ${man.sections.map((s) => s.id).join(',')}`);
for (const h of man.hazards ?? []) lines.add(`hazard ${h.id}`);
for (const s of seen.values()) {
  lines.add(`section ${s.id}`);
  for (const p of s.pieces ?? []) lines.add(`piece ${s.id}.${p.key}`);
  for (const q of s.sockets ?? []) lines.add(`socket ${s.id}.${q.id}`);
}
console.log([...lines].sort().join('\n'));
