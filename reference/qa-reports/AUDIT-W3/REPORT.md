# AUDIT-W3: every World 3 design rolled through the real engine (R-165.497/.498)
Box 1, written 7:58 PM ET Thu 11-26 (stamp from `date`). Architect lane; NO engine or level code lands from here. Evidence: `rolls/`, `codes/`, `scratch.patch`.

## EXACT NEXT STEP (box 2 starts here; box 1 handed over 8:01 PM ET Thu 11-26)
1. Scratch tree: `git worktree add --detach <scratch>/wt origin/t-eng-dark-wip` (the dark piece is NOT on t-eng-w3 yet: ENG-DARK-z's candidate
   93e05e98d), `cd <scratch>/wt && git merge --no-edit origin/t-eng-spore-wip` (clean), `ln -s <repo>/node_modules node_modules`,
   `git apply <repo>/reference/qa-reports/AUDIT-W3/scratch.patch` (the audit kit `src/game/gen2/worlds/w3Audit.ts`, `tools/audit/raw.ts|roll.sh|four.sh`,
   scratch rows 3-2..3-9 in DRAFT_TABLE, 'w3-audit' in listed.ts KITS/WORLD). `cp <repo>/reference/qa-reports/AUDIT-W3/codes/codes-raw.txt <scratch>/`,
   `mkdir <scratch>/out`. four.sh reads `<scratch>/codes-<tag>.txt` (make the file BEFORE the run) and writes `<scratch>/out/<stage>-<tag>.txt`.
2. DONE in box 1: 3-1..3-4 as written, rolled twice (rolls/*-raw.txt, *-raw2.txt: the same refusals); 3-1 with `softFalls: true`
   (AUDIT_SOFT=1, rolls/3-1-soft.txt): STILL "laid hurt" x6, so 3-1's soft teach is a MISSING engine piece (below).
3. NOW: write the TRIM codes `<scratch>/codes-trim.txt` (one line per stage, `3-N <code>`): drop every dial nodeAsks refuses (#dark, @puff, @moon,
   #spore@puff, #soft on a tower), swap a content letter World 3 has no brick for to the nearest the pool lays (x -> l lure; p -> f; m -> g), and
   keep V11 (nodeCode.ts: at most 3 of 8 content nodes one letter, no two neighbours alike). NOTE for 3-1: a DOWN tower lays only g and f from
   World 3's bricks (no World 1-2 climb or bounce fits a 1140 px storey), so V11 cannot be met with two letters: the trim keeps c and b and their
   absence is the MISSING brick count, or the trim is rolled on the W3 pool with the c/b beats cut. Roll: `./tools/audit/four.sh trim 3-1 3-2` and
   `... trim 3-3 3-4` (two background runs). A trim CLEAN on both settings = its beats PROVEN; fill THE TABLE's 3-1..3-4 rows and SEND THEM TO THE LEAD.
4. Then 3-5..3-9 the same way (four.sh sets travel: 3-5 down, 3-7 left, others right): as written first, then trims; then their rows to the lead.
5. Art column: check each design's "Art" paragraph against src/game/art/inventory/w3.json (box 1 saved no art verdicts yet).

## THE TABLE (box 1: PROVISIONAL, from the as-written rolls; no trim rolled yet, so "proven" is 0 everywhere until step 4)
| level | beats proven / total | MISSING (engine / art / lines), size, lane | signature | trim proposal | build-ready |
|---|---|---|---|---|---|
| 3-1 | 0 / 14 (as written: 0/8 clean) | ENGINE: (a) the dark + glowworm wake and the spore puff exist but are NOT LANDED (t-eng-dark-wip 93e05e98d, t-eng-spore-wip 5dd854b15) - M, ENG-DARK-z's landing; (b) the code cannot ASK for them: `:#dark` refused at nodeAsks.ts:164, `:#dark@puff` at nodeAsks.ts:163 - S, trim instead; (c) `:#soft` teach reads "laid hurt" (pipeline.ts:4232: a W3 drop's miss is a respawn, not a put-back; `brief.softFalls: true` does NOT change it, rolls/3-1-soft.txt) - S-M, MISSING: a put-back (soft) end for World 3's drops; (d) the glowworm SKY light set (beat 9, its own wide reach): no 'sky' in dark.ts/zones.ts - S-M, ENG-DARK follow-on. BRICKS (the builder's): no tower-width climb-down (roots) or bounce brick in World 3 (every W1/W2 climb/bounce section is wider than the tower's 1140 px storey, pipeline.ts:2189); 3 content bricks only, pool spent (pipeline.ts:2429). LINES: no lines-3-1.md. ART: per design (fungus mat, lit rims S/M/L, sleepy-mushroom shelf: HF) - not yet checked against the inventory | the glowworm wake (dark + still) | drop the `#dark`/`@puff` dials (bricks lay their own dark/puff); sky = one wide-reach glow set or cut to "a big wake" on the last rim | after ENG-DARK lands + W3 climb/bounce bricks + lines |
| 3-2 | 0 / 15 | ENGINE: ENG-ROOT (rope over WALKABLE floor, look 'root'): not built (only platformPlan.ts:45 names a 'root' look) - M; ENG-PROWL DONE (predators/core.ts:82, :260-265 `sight.up`); `#dark` refused (nodeAsks.ts:164). BRICKS: no W3 rope brick ('r' asks laid floating/ground/climb), no W3 brick with an ocelot socket ("threat ocelot*1: laid 0"), no W3 hide for 'm' ("no hide laid", nodeAsks.ts:117). LINES: none | the root creep under a prowler | to be rolled | after ENG-ROOT + bricks + lines |
| 3-3 | 0 / 14 | ENGINE: content `x` (trap) refused, nodeAsks.ts:121 ("B15's emitter on t-b15, not merged") - the design's own 'x' beats (T, X, C, S) cannot be asked; `#spore@puff` refused (nodeAsks.ts:163); ENG-LURE: the chime exists in engine.ts/sfx ('chime' in 4 src files), `fear: 'spore'` NOT built - S; bot skills ring-to-call, bait-and-climb NOT built - S-M. BRICKS: ocelot sockets (counts off on every node). LINES: none | the spore lure (call the ocelot onto the puff) | x -> the lure letter `l` (lureLay.ts, laid now) is the nearest; to be rolled | after ENG-LURE(b) + skills + bricks + lines |
| 3-4 | 0 / 14 | ENGINE: ENG-MOON (the moving light band + the moonflower step) NOT built (no file names it) - M; content `p` (beat) refused, nodeAsks.ts:121 ("B14's emitter on t-b14, not merged"); `#soft@moon` refused (nodeAsks.ts:163); bot skill wait-for-light NOT built - S. UP TOWER: storeys reached by jumps alone are refused (tower.ts:607) and falls over 450 px (tower.ts:785): W3 rising bricks must be vine-led. BRICKS: W3 climb/rope/bounce. LINES: none | the moonlight stair | p -> f (floating) on a timed light is ENG-MOON itself: no existing piece keeps the job; cut = a plain dark climb | after ENG-MOON + skill + bricks + lines |
| 3-5..3-9 | not rolled yet | as-written codes in codes/codes-raw.txt. Read on paper only (NOT proof): 3-5 `h` + `#vine`; 3-6 `+keepsake`; 3-7 `H` (reward, key 'later'), `+guarana`, `&eyes`; 3-8 `s` (swing, unlaid) + `#thornvine@doze`; 3-9 `V` (preview: V13 LATER job) + `s` | - | - | - |

## Method (what "rolled" means here)
- Scratch tree = t-eng-dark-wip (t-eng-w3 88592a9c4 + the dark piece) merged with t-eng-spore-wip. Kit 'w3-audit' (scratch.patch, w3Audit.ts) =
  World 3's kit (dark + spore emitters) with the design's node string as its one graph (offered under every archetype, so the stage's own
  archetype takes it), a brief with the code's content deal (dealExact), and a pool of World 3's own bricks (the dark drops, the same with a puff
  on its middle shelf, the dark shelf walk, ledge arrive/rest/exit) PLUS every typed World 1-2 section (the "nearest existing piece" test; any that
  throws on World 3's budget by name is left out and the seed re-rolled, counted in the roll's last line).
- `tools/audit/raw.ts` builds each seed exactly as libstage.ts buildStage does (the list judge included), 4 seeds x Normal and Easy, and prints
  every throw with its src line and every gen2 error, raw (libstage's own summary blanks the numbers).
- Read a roll: `sed -E 's/^[0-9]+x (normal|easy) //; s/node n[0-9]+ "[^"]*"/node/' <file> | sort | uniq -c | sort -rn`.

## Findings that hold across levels (box 1)
1. **No World 3 hazard can be asked by a node.** nodeAsks.ts:54 HAZARDS = soft, water, hurt, void; any other id is refused at :164 and any
   `@clock` at :163 ("named clocks are B14's pods"). Every design writes `#dark`, `@puff`, `@moon`, `#vine` or `#thornvine@doze`. Either an S engine
   piece (ENG-ASKS: World 3's hazard ids checked against the laid zones) or every trim drops them and the brick carries its piece (2-5's way).
   Recommendation: trim (no engine time; the dark/spore bricks already lay their own zones).
2. **World 3's kit has three content bricks** (w3.ts W3_DOWN: ledge, drops, walk): no climb, bounce, rope, cover, or creature socket. Each
   level's bricks are its builder's work, as on every World 2 level; the audit counts them, it does not build them.
3. **Down and up stages are towers** (1140 px storeys, pipeline.ts:2189): none of World 1-2's climb or bounce sections fits, so World 3 needs
   its own narrow ones; in an UP tower a storey reached by jumps alone is refused (tower.ts:607).

## Polish check
None: no screen is drawn by this lane (rolls only).

## Lessons applied
D119 (no heredoc in the commit chain), D128 (stamps from date), D134 (next step pushed and ls-remote-confirmed before the hand-over),
D138 (the hand-over ends new work), D140 (ReadNotifications at step boundaries).
