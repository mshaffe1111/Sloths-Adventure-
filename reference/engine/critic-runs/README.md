# The engine critic's runs (2026-11-05)

Every script behind a number in `reference/engine/CRITIC-SPEC.md` §6 is in `tools/engine/critic/` (under tools/, so tsc skips it). They
read the engine code, so run them from an `engine-mixer` checkout (copy that folder into it at the same path; the `.ts` files import
`../../../src/...`), after `bun install --frozen-lockfile`. Outputs stay here:

- `stages.ts` (run 1): the stage list. `npx tsx tools/engine/critic/stages.ts`
- `ladder.py` (run 2): recount of `tools/engine/moveladder.json`. `python3 tools/engine/critic/ladder.py tools/engine/moveladder.json`
- `water-w6.ts` (run 3): gen2 water against the move table's water row.
- `fp.mts` (run 4): snapshot.ts's fingerprint on any stages, for any checkout: `ROOT=<checkout> npx tsx fp.mts` (run it on main and on
  engine-mixer and compare the JSON lines).
- `helper-try.ts` (run 6): a fresh helper's 2-4 and 6-9 specs through `checkSpec`.
- `era-compare.txt`, `era-w1-*.txt` (run 10): `tools/inspect/era.ts --worlds 1 --rolls 16 --bots 0 --look 16` on main and engine-mixer.
- `readers/`: the eight readers' ranked notes behind CRITIC-TRACE.md.
