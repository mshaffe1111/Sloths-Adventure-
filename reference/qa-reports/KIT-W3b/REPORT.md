# KIT-W3b: World 3's LEVEL bricks (R-165.505; content/kit, Opus 5.5 high). Branch t-kit-w3b, cut from t-eng-w3 13135bf6b

## EXACT NEXT STEP (box 1 hand-over, 9:26 AM ET Fri 11-27 by `date`)
1. Box 2: `git fetch origin +refs/heads/t-kit-w3b:refs/remotes/origin/t-kit-w3b && git checkout -B t-kit-w3b origin/t-kit-w3b`;
   `npm ci --legacy-peer-deps` and `git fetch --unshallow origin` with run_in_background. Candidate: 7be2c37e8 (brick 1, the ocelot
   ground: w3-prowl-floor + w3-prowl-pair in src/game/gen2/worlds/w3.ts W3_LEVEL; counting test src/game/gen2/worlds/w3Level.test.ts,
   2/2 green in 3.7 s). NOT yet gated, NOT yet landed.
2. ENG-ASKS-b's hash: ReadNotifications first; if the lead has sent it, `git merge --no-edit <hash>` (merge, never rebase) BEFORE any
   dark brick, then switch CODE_32 in w3Level.test.ts to 3-2's ENG-ASKS form (codes-trim.txt: `A Tr1<:#dark Pg1> Pf1<:#dark
   Xc1&<:#dark:&ocelot*1 R Pg1< Wr1&>:#dark:&ocelot*1 R Pc1&<:&ocelot*1 Cg1&>:#dark:&ocelot*2 R Sr1&<:#dark:&ocelot*3 E`) only if
   the C beat still lays (the C node asks #dark too: the prowl bricks carry no dark zone yet; if Cg refuses 'no dark zone in its span',
   add `...darkEnds('in', 'out', 'glow')` to both prowl bricks' sockets, the w3Drops way, and re-run the test).
3. Brick 2 (3-2's DARK CLIMB + DARK ROPE, after ENG-ASKS-b): a World 3 level climb section (content 'climb', feel W3_LEVEL_STAGES,
   a stone bank, a vine up to a branch shelf and down, plain jumps only, `darkEnds` over its span) in a lit version for P(c) and a dark
   version for X(c), EACH with one ocelot socket (`ocelotAt`) on its foot bank (3-2's Pc1&<:&ocelot*1 refuses 'laid 0' x11 today:
   no climb carries an ocelot socket). Rope W r / S r: 'r' is ENG-ROOT's root rope (packets/2026-11-25/ENG-ROOT.md); if World 3 has no
   rope section kind laid by gen2 yet, that is rule 26: STOP and send the lead the exact ask (the rope section kind, not a level hack).
   KIT-W3a's trap (R-165.524): every drop in a vine brick is a `walk`, never a `jump` (only a jump's dy is scaled by T.rise).
4. Roll: scratch worktree `git worktree add --detach <S>/wt <candidate>`, `ln -s <repo>/node_modules node_modules`, `git apply`
   origin/t-audit-w3:reference/qa-reports/AUDIT-W3/scratch.patch, then in src/game/gen2/worlds/w3Audit.ts import W3_LEVEL and end
   w3AuditBricks with `...(process.env.AUDIT_LEVEL === '0' ? [] : W3_LEVEL)`; copy rolls/codes-trim-rolled.txt (or the ENG-ASKS form)
   to `<S>/codes-<tag>.txt`, `mkdir <S>/out`, `./tools/audit/four.sh <tag> 3-2 3-3` in the background. Read a roll with the grouping
   line in "How to read" below.
5. GATES once, on the frozen candidate (D115: a worktree of the commit, src/game/gen2/proven/ writable): tsc; the CI tool line; the
   suite in 6 shards; `npx tsx tools/engine/lockall.ts --check` ONE run (102 stages, counts; w3.ts is a shared lay file, so the FULL
   lock; NO listed stage may move: the bricks' `feel` keeps them out of every listed pool and out of 3-1's draft); seedlist --check on
   every list the files touch; generalitycheck. LAND: merge onto origin/t-eng-w3 (no force; KIT-W3a lands there too), re-run tsc and
   lockall after the merge; send the lead the hash, each shard's totals and the before/after refusal counts below.

## Brick 1: the ocelot's ground (R-165.505; AUDIT-W3 "ocelot sockets laid 0")
- `w3-prowl-floor` (1 ocelot socket): a stone bank 300-340, a 50-56 px step down onto the ocelot's floor 540-620, a step up onto the exit
  bank 280-320 (petals in, a petal and the flag socket on the exit bank).
- `w3-prowl-pair` (2 ocelot sockets, for '&ocelot*2' beats): in bank, a low floor and a high floor (540-620 each, a 50-56 px step between:
  the stand-still spot), an exit bank.
- Both: content 'ground', jobs practise/test/combine/twist/signature (never teach: the first ocelot is the build's, rule 7), `feel` =
  W3_LEVEL_STAGES (3-2, 3-3, 3-6..3-9), so no tower's roll (3-1's draft, 3-4, 3-5) and no listed stage moves. Ocelot sockets allow only
  'ocelot' (maxThreat 3: the jaguar never), Easy 'soften'.
- Art: World 3's painted stone bank only (w3#bank / w3#fill / w3#bankEnd, the kit painter's 'bank' shape, the same rows W3_ART.bank names
  and w3.test.ts holds in scale). Scale to Pokey (89.1 px): floors 6.1-7.0 Pokeys long, steps 0.56-0.63 of his height (a plain step).
- A fix found on the roll: a checkpoint the pipeline dropped on the pair's high floor (3-2 seed 1 Normal, x 32026) took the second
  ocelot's patch (levelCheck SAFE_APPROACH 200, pipeline.ts patchFor). Each brick now carries a flag socket on its exit bank (t 0.7) and
  its ocelots sit at t 0.3-0.5 of their floors. After it: the C beat lays 2 ocelots on its own sockets on every roll.

### Before / after (4 seeds x Normal and Easy, the audit's wide pool, codes-trim-rolled; rolls/*.txt)
| Stage | Before (13135bf6b) | After (7be2c37e8) |
|---|---|---|
| 3-2 | 152 refusal lines, clean 0/8 | 66 lines, clean 0/8 |
| 3-3 | 248 lines, clean 0/8 | 138 lines, clean 0/8 |

3-2, cleared by name: 'pool short at slot N (n11 combine: no ground section left)' x45; C 'move 1 (plain jumps): a section there asks
for the double' x12; C "content 'g' (ground): N of N sections are floating / climb" x12; S 'threat ocelot*3: laid 1/2' x8; S "content
'f': sections are bounce" x6. **3-2's Cg1&>:&ocelot*2 is laid from the prowl bricks with both ocelots on every roll** (w3Level.test.ts).
NEW by name x12: S "content 'f' (floating): 2 of 2 sections are ground": S's ocelots now come from these ground bricks because no
floating/rope section carries an ocelot socket (S r is ENG-ROOT's root rope; brick 2's scope). Left: P(c) 'ocelot*1: laid 0' x11 +
'no creature laid' x11 (a climb with an ocelot socket: brick 2), the X double x12, World 1's tip keys x12, the quiet line x8 (all the
World 1-2 stand-ins' own, finding 4).

3-3, cleared by name: 'pool short (no ground section left)' x30; W/C 'move 1 asks for the double' x24; C "content 'g'" x12; V14/V11
'node code' rewrites x33; 'no creature laid' at W(g) x8, S x2, P(g) x2. NOT cleared: every ground node's ocelot count is OVER-laid ('ocelot*1: laid
3-5'): 3-3 is a PURGE (targetCount 16) and pipeline.ts topUpFoes stands goal+2 = 18 animals on the widest main pieces, now these
floors (probe, 3-3 seed 1 Normal: 18 enemies = 15 'topup' + 3 on the bricks' sockets). The lead ruled it an ENGINE fix, **R-165.527**
(ENG-LURE's lane): the top-up never stands an animal in a node whose code names its threat count. Not touched here. 3-3's lure 'l'
refusals x36 are ENG-LURE's.

On World 3's own pool alone (rolls/*-after-w3.txt) 3-2 and 3-3 still cannot be laid: no World 3 level climb, rope or floating brick
('pool short ... no climb section left' x75 on 3-2). Before the bricks the w3-only roll of 3-2 threw 'no section fits node n3' on all 8.

### The count (w3Level.test.ts, 2 tests, 3.7 s)
- the bricks are in the level stages' pools only, ground, never a teach, ocelot sockets only, each on a floor 240 px or more, steps 60 px
  or less;
- 3-2's C beat, seeds 1-2 x both: no refusal names it, its sections are World 3 level bricks only, 2 ocelots on the bricks' OWN sockets
  on Normal (1-2 on Easy). PLANTED RED 1: the bricks with their ocelot sockets taken out: the count on them drops to 0 on every roll.
  PLANTED RED 2: no level bricks: the C beat refuses by name on at least one roll (World 1-2's stand-ins).

## Gates (not run this box: the next box runs them ONCE on the frozen candidate, step 5)
- tsc: clean on 7be2c37e8 (this box). Everything else: NOT RUN.

## How to read a roll
`sed -E 's/^([0-9]+)x (normal|easy) /\1 /; s/node n[0-9]+ "([A-Z])([a-z]?)[^"]*"/node \1\2/; s/at x [0-9]+/at x/; s/[0-9.]+ s with/N s
with/; s/slot [0-9]+/slot N/; s/laid [0-9]+/laid K/' <file> | awk '{n=$1; $1=""; a[$0]+=n} END{for(k in a) print a[k], k}' | sort -rn`.
A node's label is the code AS LAID (its laid letters), not the asked code: an S node asked 'f' and laid ground prints "Sg".

## Learned
- A creature socket is not "laid" until a flag cannot land on its floor: the pipeline's checkpoints are placed after the sockets and a
  safe spot within 200 px removes the animal (patchFor). A brick with an animal socket carries its own flag socket off the animal's floor.
- A purge's top-up fills the widest pieces, so a wide animal floor in a purge stage draws top-ups: count the animals ON the brick's own
  sockets, not the node's total, when proving a brick.
- The audit's wide pool hides the gap for a planted red (World 1-2's stand-ins sometimes lay the beat): the red that counts is the
  brick's sockets removed (count drops to 0), not the brick removed.

## Proposed rule change (level.md)
- Rule 23 (or a new short rule): "A brick with an animal socket is proven by the count ON its own sockets (FilledSocket.socket), with a
  planted red that strips the sockets; a flag socket keeps the checkpoint off the animal's floor." Evidence: 3-2 seed 1 Normal lost its
  second ocelot to a checkpoint until the flag socket went in; the brick-removed red passed on 3-2 seed 2 Normal.
