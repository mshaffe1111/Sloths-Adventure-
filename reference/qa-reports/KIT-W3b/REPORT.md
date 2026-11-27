# KIT-W3b: World 3's LEVEL bricks (R-165.505; content/kit, Opus 5.5 high). Branch t-kit-w3b, cut from t-eng-w3 13135bf6b

## EXACT NEXT STEP (box 2 hand-over, 9:53 AM ET Fri 11-27 by `date`)
Candidate: **5035c191a** (t-kit-w3b; ENG-ASKS-b merged: its code 5196f738f, then its landing f79963053 on top, code-identical). Box 2 is
staying on as a TAIL running only this candidate's gates (frozen worktree, src/game/gen2/proven/ writable): 6 shards + the CI tool line,
and ONE `lockall --check` (full, 102 stages). Done before the hand-over: tsc 0, generalitycheck PASS (26 literals, 26 known). It sends the
lead each shard's totals, the tool line and the lock counts. Box 3:
1. `git fetch origin +refs/heads/t-kit-w3b:refs/remotes/origin/t-kit-w3b && git checkout -B t-kit-w3b origin/t-kit-w3b`; `npm ci
   --legacy-peer-deps` and `git fetch --unshallow origin` with run_in_background. ReadNotifications: take the tail's gate totals.
2. If the tail's gates are green and no listed stage moved: seedlist --check on every list w3.ts touches (`npx tsx tools/engine/registrycheck.ts
   --lists`, then the World 3 / shared ones; none was run in box 2), then LAND: `git fetch origin t-eng-w3`, `git merge --no-edit
   origin/t-eng-w3` into t-kit-w3b, then onto t-eng-w3 by merge (no force, never rebase), re-run tsc and the FULL lockall after the
   merge, push, `git ls-remote`, send the lead the hash, each shard's totals and the before/after counts below.
3. If a gate is red: fix on the branch, NEW candidate, the gates ONCE on it.
4. Next brick (NOT started, the lead to rule order): 3-3's `Pc1^<` asks a RISING climb and every World 3 climb leaves level ('shape ^
   (rising): its sections rise 0 px' x12 on 3-3). A rising climb out (no walk off the shelf: the exit bank at the shelf's height, exitDy
   -(180-54)) is the w3.ts prowlClimb way with a third flag; counted by a test on 3-3's code with its planted red.

## GATES and LANDING (box 2 tail, by `date`: gates done 10:57 AM ET, landed after 11:15 AM ET Fri 11-27)
Frozen candidate 5035c191a (worktree, src and tools read-only, src/game/gen2/proven/ writable, D115):
- tsc 0; generalitycheck PASS (68 engine files, 26 literals, 26 known).
- Suite, 6 shards (deploy.yml's split): 1: 656 tests 655 pass 0 fail 1 todo; 2: 650/650/0; 3: 766/766/0; 4: 722/722/0; 5: 630/629/0/1
  todo; 6: 728/727/0/1 todo. The CI tool line (gates.yml 'rolled'): 355 tests 354 pass 0 fail 1 todo. Every 'not ok' is a listed TODO
  (R-165.312's roost boa; 4-3's boulder; the chase child bot).
- Lock: **102/102 stages unchanged, 3264 builds** (`lockall.ts --layouts 16 --out` on the landing base f79963053, then `--check <that
  file>` on 5035c191a). MY MISS, owned: the first run was `lockall.ts --check` with NO file: it builds every stage, compares nothing,
  prints no counts and exits 0, an empty pass, counted as not run. Countermeasure accepted by the lead: R-165.536 (lockall exits 1 on a
  bare --check, with a planted test; every brief spells out `--check <lock file>`; a lock result without its counts line is not run).
  Box 1's and box 2's earlier next steps printed the bare command; this record replaces them.
- seedlist --check, all 14 proven lists (no World 3 stage has one; w3.ts is imported by stageTable.ts, which every listed stage reads):
  1-1 PASS 161 seeds, 1-5 PASS 150, 1-2 1-3 1-4 1-6 1-7 1-8 1-9 2-1 2-2 2-3 2-4 2-5 PASS 100 each, every seed clean on both settings.
Landing: t-eng-w3 had moved to 9818cc87d (ENG-CATCH, tower.ts); merged into t-kit-w3b = 75d4f3af8 (clean). After the merge: tsc 0;
w3.test + w3Level.test + tower.test + w3HazardAsks.test 65/65; lock **102/102 unchanged, 3264 builds** (recorded on 9818cc87d, checked
on 75d4f3af8). Then onto origin/t-eng-w3 by merge (fast-forward), no force.

## Box 2 (R-165.505): the climb out, in the light and the dark
### The bricks (src/game/gen2/worlds/w3.ts; all `feel` = W3_LEVEL_STAGES, jobs PROWL_JOBS (never a teach), ocelot sockets only)
- `w3-prowl-climb` / `-dark` (content 'climb', needs climb): an entry bank 280-320, a plain 54 px step (0.61 Pokey) down onto the ocelot's
  stone floor 540-620 (ONE ocelot socket, t 0.3-0.45), a 180 px vine at its end (2.0 Pokeys: past a plain jump's rise, so the vine is the
  way), a branch shelf 220-260 over the vine's top, a walk off the shelf down 126 px onto the exit bank (back at the entry's height; a walk,
  never a jump, R-165.524). Petals on the shelf and the exit bank, the flag socket on the exit bank (t 0.7: never within SAFE_APPROACH of
  the ocelot's patch).
- `w3-prowl-climb-high` / `-high-dark`: the same, a plain step UP off the shelf onto a higher branch 200-240, the walk off from there. A
  climb node takes two sections; with one shape, X(c)'s second was a World 1 stand-in that asks the double (box 1's 'X double' x12).
- `w3-prowl-floor-dark`, `w3-prowl-pair-dark`: box 1's ocelot ground with the dark stretch over it (darkEnds entry -> exit, a glowworm), for
  3-2's '#dark' C beat ('Cg1&>:#dark:&ocelot*2' refused 'no dark zone in its span' x12 on the #dark form).
- `-dark` = `darkEnds(entry, exit, 'glow')`: the node that asks #dark draws it (pipeline 2493, a section that lays the node's hazard).
- Art: World 3's painted stone bank (w3#bank/#fill/#bankEnd) and branch (w3#branch), the rows W3_ART names and w3.test holds; the vine is
  drawn as the kit's climb trunk, **w3#trunk, whose inventory row says 'needs fix: grey square in its top-right corner; flat cut edges'**:
  every World 3 climb draws it (3-1's too). NAMED, not fixed here (an art job). No stills shot in box 2: the gates took the box.

### The count (w3Level.test.ts, 5 tests, about 15 s, seeds 1-3 x both)
- 3-2's P(c) ('Pc1&<:&ocelot*1'), the node picked by its PLACE in the code (a node's token is its laid code: the Pf node laid as climb read
  'Pc', box 2's first try counted the wrong node): no refusal names it, its sections are World 3 climbs, Normal's ocelot on the brick's own
  foot socket (1). PLANTED RED: sockets stripped -> 0 on every roll.
- 3-2's X(c) on ENG-ASKS-b's form ('Xc1&<:#dark:&ocelot*1'): no refusal names it, at least one dark climb, Normal's ocelot on its socket.
  PLANTED REDS: sockets stripped -> 0; dark ends stripped -> refused '#dark' by name.
- 3-2's dark C ('Cg1&>:#dark:&ocelot*2'): no refusal, a dark ocelot ground laid, 2 on Normal's sockets. PLANTED RED: dark ends stripped.
- Easy: its 60% cut (pipeline.ts 'Easy's enemy budget') can take a later ocelot off its socket; the node's ask then stands it back on the
  node's main ground as a top-up (the ask's 'at least one on Easy'). Kept as noted; the lead: R-165.527 (ENG-LURE) settles it.
- w3.test (ruling a): the cast check is `castLeaks()`. PLANTED REDS: an ocelot socket put on a tower brick -> 'w3-ledge has an animal
  socket'; a level brick with 3-1 in its feel -> '<id> is in 3-1's pool'. w3.test 10/10, w3HazardAsks.test green.

### Before / after (4 seeds x both, the audit's wide pool; rolls/*-box2-r.txt on box 1's code form, *-box2-d.txt on ENG-ASKS-b's #dark form)
| Stage | Box 1 (7be2c37e8) | Box 2 (5035c191a) |
|---|---|---|
| 3-2, codes-trim-rolled | 66 refusal lines, clean 0/8 | **20**, clean 0/8 |
| 3-3, codes-trim-rolled | 138, clean 0/8 | **105**, clean 0/8 |
| 3-2, #dark form (codes-trim.txt) | (not rolled) / 170 on box 2's first climb (7aa521c08) | 149, clean 0/8 |
| 3-3, #spore form | (not rolled) | 207 (ENG-SPORE's puff and ENG-LURE's lure lines) |

3-2 cleared by name: P(c) 'ocelot*1: laid 0' x11 and 'no creature laid' x11; X 'move 1: a section asks for the double' x12; World 1's tip
keys x12 (no World 1-2 climb stand-in left at P/X). On the #dark form: **X(c)'s 'no dark zone in its span' cleared**, C's x12 cleared.
Left on 3-2 (box 1's form): the quiet line x8 (finding 4), S 'content f (floating): sections are ground / climb' x12: S asks floating and
World 3 has no floating brick with an ocelot (on the #dark form S asks r: the root rope). **Wr / Sr stay ENG-ROOT's**: 'pool short ... no
rope section left' x45 and 'content r: sections are ground / climb' by name; their '#dark' lines no longer print only because a dark
ground or climb now stands in that node, so the rope's content refusal is the one that names them.
3-3 by line (box 1 -> box 2): Pc 'no creature' 11 -> 0, Pc 'ocelot*1 laid' 11 -> 0, Pc 'rise -1/-5 px' 6 -> 0, World 1's tip keys 12 ->
0 and 12 -> 9, Cg ocelot*2 8 -> 4; NEW: **Pc 'shape ^ (rising): its sections rise 0 px' 3 -> 12** (3-3's Pc1^< asks a rising climb; World
3's climbs leave level: next step 4); Sc 'content l: no lure' 0 -> 9 (S laid climbs where it asks the lure: ENG-LURE's). The over-laid
purge counts are R-165.527.

## Box 1: the ocelot's ground (R-165.505; AUDIT-W3 "ocelot sockets laid 0")
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
- On the head after w3.test's change (below): tsc clean; generalitycheck PASS (26 literals, 26 known); w3.test + w3Noise.test +
  w3Level.test 19/19. NOT RUN: the CI tool line, the 6 suite shards, lockall, seedlist. (w3.test's cast-rows check 'no brick has an
  animal socket' tripped on the level bricks, which carry them by design: it now holds every NON-level brick to it (the way down
  casts none, as before) and adds that no level brick is in 3-1's pool. Its promise is kept, not loosened; the critic may rule.)

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

## Learned (box 2)
- A node's token in `gen2.nodes` and in every refusal is its LAID code, and node ids are 1-based (n1 = A): a test that finds a node by its
  asked letters ('Pc') can count the wrong node (box 2's first P(c) count read the Pf node laid as climb). Pick the node by its place in the
  code and match refusals on the id the roll returns.
- A climb node takes two sections: one World 3 shape hands the second to a World 1-2 stand-in, with its double and its tips. Two shapes per
  content (lit and dark) cleared 3-2's X double and the tip keys at once (Matt's variety rule: more pieces, not rerolls).
- An animal socket on Easy is not 'laid' by the brick alone: Easy's 60% cut can move it to the node's ask top-up. Count Normal on the socket,
  Easy by the ask.
- Lessons applied: D115 (frozen worktree, proven writable), D128 (stamps from `date`), D134 (next step
  pushed and ls-remote-confirmed before the hand-over), D138 (the hand-over ends new work; box 2 stays a gates-only tail), D140
  (ReadNotifications at each step), D141 (the CI tool line on the candidate), CI #89 (the 20-minute recommendation: merging 5196f738f).
- MISSED D119 once: the hand-over commit 5cec5d304 ran in the same command as a heredoc that appended this section (the commit is intact;
  no other commit used one).
- Proposed rule (for the lead's retro, with box 1's): **every content letter a level's code uses gets at least two World 3 shapes, each lit
  and dark where the code asks #dark**, checked by a test that rolls the trimmed code and asserts no section at that node is another
  world's stand-in.
