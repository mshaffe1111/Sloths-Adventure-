# RUNS: every TRIAGE C row, run on our code

Engine measurement helper, 2026-11-05. Input: `reference/engine/TRIAGE.md` on `origin/engine-spec` (106 rows tagged C, #1-#163 by
TRIAGE's own numbering). Every row below names the command, the saved output (`reference/engine/runs/out/`), the measured number, and
PASS or MISS against the row's own line. Lines were not moved (LAWS 22): a run that misses its line is reported as a MISS.

**Time.** Planned about 3 h (11:08 AM-3:00 PM ET). Actual: see the end of this file.

**What was built and measured.**
- **engine-mixer at `021ef4e93`** (the mixer's 1-1 and 1-5, and the shipped builders for every other stage), in a clean detached
  worktree so no run wrote into the planner's tree.
- **main at `68b31e665`** for "old 1-1" and "old W1-W4" (ENGINE-SPEC:11 names the old 1-1 "live on `main`"). Note: main's W1 is NOT
  engine-mixer's shipped W1. engine-mixer carries 126 commits main does not (77 files under `src/game`), among them the rhythm builder
  for 1-2 and 1-5 (`src/game/w1Rhythm.ts:31`, absent on main). Where a row says "old", main was measured; where it says "today's" or
  "shipped", engine-mixer was.
- **16 layouts (1-16) x Normal and Easy** unless a row or a tool says otherwise (moveladder.ts and the mechanics counts are Normal only,
  as the tools are written; era.ts rolls its own 16 layout numbers, the first being 1, `tools/inspect/era.ts:54-70`).
- **The dump** every layout measure reads: `tools/engine/runs/dump.ts` (CP1's `cp1-dump.ts.txt` with more fields, any tree). Proof it
  reads the stage as CP1 did: on main's 1-1 it reproduces CP1's old 1-1 row exactly (kinds 5 (4-5), share 0.468 (0.338-0.692), runKS 7
  (3-9), newMeanPx 572 (360-606), hearts 2 (2-4) Normal / 15 (12-22) Easy, pickSideMax 6 (6-7), pickUpMax 4 (3-4); CP1
  `cp1/table2.txt:2-3`), using CP1's own `measure2.py` unchanged.

**New measures written** (only where none existed; each says so in its header): `tools/engine/runs/ladder-uses.ts` (the mechanics
counts per stage per layout; moveladder.ts keeps only "which stages"), `tools/engine/runs/ladder.py` (reads it against the ladder
table), `tools/engine/runs/dump.ts` (above). Others are named in their rows.

Numbers are **measured** unless marked *(estimate)*.

---

## 1. The move ladder (step 6)

Commands (engine-mixer worktree at 021ef4e93):
- `npx tsx tools/engine/moveladder.ts --layouts 16` -> `out/moveladder-16.json`, `out/moveladder-16.txt` (3 min 39 s, measured)
- `npx tsx tools/engine/runs/ladder-uses.ts --layouts 16` (3 shards) -> `out/raw/ladder-uses-mixer-16.json`;
  `python3 -I tools/engine/runs/ladder.py out/raw/ladder-uses-mixer-16.json` -> `out/ladder-mixer.txt`
- the same on main's W1-W4 (`--root <main worktree>`) -> `out/raw/ladder-uses-main-W1W4-16.json`, `out/ladder-main-W1W4.txt`

Cross-check: ladder-uses.ts's "first stage" and "stages in" agree with moveladder.ts at 16 layouts on every move (liana 64 stages,
trunk 77, breaking 31, rope 16, mushroom 36). **The committed `tools/engine/moveladder.json` was made with 2 layouts** (its own
`layouts: 2`); at 16 layouts 19 rows change (e.g. snake first 1-3 -> 1-2, caiman 6-4 -> 6-2, harpy 7-8 -> 6-5, breaking in 22 -> 31
stages). The engine's ladder should be read from a 16-layout run.

| Row | Line | Measured | Result | Root cause (file:line) |
|---|---|---|---|---|
| #121 breaking / creaky at 1-5 | table = ML | engine-mixer: first **1-2** on every roll (11-21 creaky limbs), also 1-4 (9 every roll), 1-5 55-63. main: first 1-5 (8-24). | **MISS** (table matches main, not today's build) | 1-2's rhythm builder lays creaky limbs: `src/game/w1Rhythm.ts:1192` (`type: 'fragile', creak: q.hold ?? 0.6`); 1-4's kapok lays them: `src/game/protoStage.ts:6175`, `:6392` (`CREAK_S` 0.6 s, `:5655`). |
| #122 liana at 1-6 | table = ML | engine-mixer: first **1-2** (11 lianas every roll), 1-4 2, 1-6 18-31. main: first 1-6. | **MISS** | `src/game/w1Rhythm.ts:453` and `:1213` (`vineType: 'swing_liana'`) on 1-2. |
| #123 leaf glide row | row exists, echo/return per ES 1317-1319 | no glide row anywhere: MECHS has none (`tools/validate/mechanics.ts:18-41`), so moveladder.json has none; only warm air (`updraft`, first 4-7, 1 stage). | **MISS** | Gliding is a held input with no placed object, and MECHS counts placed objects only. Needs a glide measure (e.g. gaps a first-timer can cross only by gliding); not written here because a new mechanic count is the planner's tool. |
| #126 own world after the echo | a touch every stage, some in half; spec >= old world | engine-mixer W1-W5 (worst roll): mushroom touch 2/6, some 1/6; rope 1/3, 0/3; trunk 2/3, 0/3; breaking 0/2; liana 0/1; push 0/1; drift (W2) 4/6, 4/6; silk (W5) 0/3. main W1-W4: the same shape (mushroom 2/6 0/6, rope 1/3, trunk 2/3, breaking 0/2, liana 0/1, push 0/1, drift 4/6). Echo (next 2 stages "some"): 0/2 for rope, breaking, push, bush, lift, warm air, swim. | **MISS** (no move meets "a touch every stage" in its own world, on either build) | No builder reads the ladder: "ladder" appears in `src/game/mixer/` only in notes (`catalog.ts:44`, `:48`, `:91`); every shipped stage lays its own kit. Old W1-W4 (main) shows the same gaps, so "no lower than the old world" holds trivially while the spec's own floor fails. |
| #127 every later world >= 1 in 3 | SR:19-20 floor (>= 1 stage a world) and 1-in-3 | any roll, non-lair stages: liana PASS both (W2 4/9 ... W10 9/9); trunk floor PASS, 1-in-3 MISS (W5 3/10); mushroom W2 0/9, W6 0/9; rope W5-W7 0/10, 0/9, 0/9; breaking W2-W4 and W6 0; push only W4 (3/10); bush W2, W5, W7, W9, W10 0; moving W3, W4, W6-W8 0; swim W7-W10 0. | **MISS** (7 of 9 core moves miss the SR floor; 8 of 9 miss 1-in-3) | As #126. |
| #145 trunk climb's first stage, main 1-1 to 1-3 | recorded from the run | main: trunk 1-1 0, 1-2 0, 1-3 0, **first 1-4** (20-22 every roll). engine-mixer: 1-1 3 every roll (the mixer's). | **PASS** (recorded: 1-4 on main; the mixer's 1-1 is the only earlier one) | — |
| #152 animal absences | no taught animal absent > 2 stages (ES 139-140) | longest absence in play order (any roll): boa 38 (1-9 -> 5-6), jaguar 27 (3-9 -> 6-5), ocelot 18 (3-9 -> 5-6), snake 13 (5-8 -> 7-2), eagle 13 (5-8 -> 7-2), caiman 12 (7-8 -> 9-1), harpy 8, tayra 5, turtle 3 (2-5 -> 2-9) and never again after 2-9 (83 stages); frog 1, spider 1 (but gone after 7-9 / 5-9). | **MISS** (9 of 11) | Animals are laid per world builder; nothing spaces them across worlds (as #126). |
| #154 swim | 6-7 teaches; 6-8, 6-9 echo; W6-W8, W10 >= 1 in 3 | calm pools (`swim.ts` kitPools): 6-7 one pool every roll; 0 in every other stage of W6-W10. | **MISS** (teach PASS; echo 0/2; W7, W8, W10 0/9) | The only calm water is a puzzle room's raft well: `src/game/engine.ts:6019-6021` (`calmPools` = `kitPools(this.kit, ...)`), `src/game/swim.ts:8-9`. Drawn water zones (`proto.water`, `engine.ts:5501`) are laid by no builder at 021ef4e93 (0 on all 102 stages x 16 layouts). |

**Topic 1: 1 PASS, 7 MISS.**
