/**
 * The engine's module-level play state, saved and put back around a probe (engineProbe.ts; ENG-SIM step 1, R-165.470).
 *
 * Most of what the engine remembers in play lives on the engine object, which a probe snapshots and restores in place. A few modules
 * keep play state at their own top level instead (the tips sent this session, the lines Dot showed, the help ladder's current rung, a
 * frame counter): a probe that flies the engine ahead writes them too, and the live run would then remember a moment it never played
 * (the spike's leak: a probe flew past a Dot tip, tipMemory marked it sent, and the live run never said it). Each such module registers
 * a save and a load here, at its top level; a probe saves every registered store before it flies and loads them back after.
 *
 * The probe-equality gate (tools/engine/probeEqual.test.ts) prints every top-level binding of every src/ module before and after a
 * probe and fails on any that changed, so a store missing from here is caught, not trusted.
 */
export interface PlayStore<S = unknown> {
  save(): S;
  load(s: S): void;
}

const STORES = new Map<string, PlayStore>();

/** register a module's play state (`name`: the module and store, for a gate's message) */
export function playStore<S>(name: string, store: PlayStore<S>): void {
  STORES.set(name, store as PlayStore);
}

export type PlayStoresSave = ReadonlyArray<readonly [PlayStore, unknown]>;

/** every registered store, saved (each store's own copy: a later write to the live store never reaches it) */
export const savePlayStores = (): PlayStoresSave => [...STORES.values()].map((s) => [s, s.save()] as const);

/** every saved store, put back as it was saved */
export function loadPlayStores(saved: PlayStoresSave): void {
  for (const [s, v] of saved) s.load(v);
}

/** the registered stores' names */
export const playStoreNames = (): string[] => [...STORES.keys()];

/** a Map of Sets, copied two deep (a save must not share the live store's Sets) */
export const copyMapOfSets = <K, V>(m: ReadonlyMap<K, ReadonlySet<V>>): Map<K, Set<V>> => new Map([...m].map(([k, s]) => [k, new Set(s)]));
/** a Map of arrays of records, copied to the records (each record is copied: a save never shares one with the live store) */
export const copyMapOfLists = <K, V extends object>(m: ReadonlyMap<K, ReadonlyArray<V>>): Map<K, V[]> =>
  new Map([...m].map(([k, l]) => [k, l.map((v) => ({ ...v }))]));
/** put a Map back to a saved copy, in place (the module's Map keeps its identity) */
export function loadMap<K, V>(live: Map<K, V>, saved: ReadonlyMap<K, V>, copy: (v: V) => V = (v) => v): void {
  live.clear();
  for (const [k, v] of saved) live.set(k, copy(v));
}
