# AUDIT-W3: every World 3 design rolled through the real engine (R-165.497/.498)
Box 1, written 7:58 PM ET Thu 11-26 (stamp from `date`). Architect lane; NO engine or level code lands from here. Evidence: `rolls/`, `codes/`, `scratch.patch`.

## EXACT NEXT STEP (box 2, 8:10 PM ET Thu 11-26 by `date`; box 1's setup steps kept below it)
0. Setup as box 1 step 1, BUT the scratch base is now origin/t-eng-dark-wip @ 3d41ece6 (it contains 93e05e98d). Fetch each branch by
   explicit refspec (`git fetch origin +refs/heads/X:refs/remotes/origin/X`): a plain multi-branch fetch leaves FETCH_HEAD on the first.
1. DONE box 2: 3-1..3-4 TRIMS rolled (codes/codes-trim.txt; rolls/*-trim.txt; 3-1 cut variant codes-cut.txt / rolls/3-1-cut.txt); THE TABLE
   rows 3-1..3-4 and THE LANE LIST written and SENT to the lead. 3-5..3-9 AS WRITTEN rolled (rolls/3-5..3-9-raw.txt).
2. NOW: write 3-5..3-9 trims in <scratch>/codes-trim.txt (drop every refused dial: #vine, #dark, #soft, @puff, #thornvine@doze; swap
   h -> l or g, s -> c (swing -> climb), r -> f, m -> g, V -> P (V13: preview is LATER, pipeline.ts:602); keep V11), roll
   `./tools/audit/four.sh trim 3-5 3-6 3-7` and `... trim 3-8 3-9` (background), fill rows 3-5..3-9 (signature, trim, art via
   <scratch>/artck.py-style check of each design's **Art:** paragraph against src/game/art/inventory/*.json, lines from each design's
   "For the story keeper" asks), add their lanes to THE LANE LIST, send the lead the rows.

### Box 1's step list (setup)
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

## THE TABLE (box 2, written 8:08 PM ET Thu 11-26 by `date`; 3-1..3-4 from the TRIM rolls, codes/codes-trim.txt, rolls/*-trim.txt)
Trim rolls assume ENG-ASKS (the lead's ruling): every refused dial is dropped from the rolled code and listed as the ask the level uses.
Sizes: S = under a box, M = 1-3 boxes, L = more. "Proven" = the beats whose bricks rolled with no refusal on 4 seeds x both settings.
| level | proven / total | MISSING engine | MISSING kit (KIT-W3) | MISSING art | MISSING lines (KEEPER-W3) | signature piece | trim (for the lead to rule) | build-ready after |
|---|---|---|---|---|---|---|---|---|
| 3-1 | 0 / 14 clean; 10 / 14 beats laid with no refusal (trim: only the c and b beats refuse: "content 'c': 2 of 2 sections are ground, floating", "'b': 3 of 3", pool short at slots 5-6 / 23-24; nodeAsks.ts content check; cut roll without c/b breaks V11 "4 of 8 content nodes are 'g' (cap 3)" and "'f': 3 of 3 sections are ground", rolls/3-1-cut.txt: so c and b are needed, not optional) | ENG-ASKS (S; asks `#dark`, `#dark@puff`); ENG-DARK landing (M, in flight); ENG-SPORE landing (S, approved 8477445a5); ENG-SOFT-W3 put-back soft end (S-M: a W3 drop's miss reads "laid hurt", pipeline.ts:4232) ONLY if the soft teach is kept; glowworm SKY light set (S) ONLY if kept | down-tower climb (roots, `c`) and bounce (`b`) bricks at the 1140 px storey: 2 bricks | none: mat = w3-next#mat-s23 (0.49 Pokey ok), lit rims = w3-next#rimS/rimShort/rimLong (0.70-0.77 ok), sleepy shelf = w3-next#sleepy-s23/-s37 (1.23/1.30 ok); W1 vine columns (2.24 Pokey) need the scale check; sky backdrop optional: B3-w3sinkhole-sky exists | lines-3-1.md: teach.dark (before beat 1: stand still, the glowworms show the way), teach.puff (before beat 6), wonder.sky, journal.glowworm, mission card, home line, locked-exit line | the glowworm wake (dark + stand still) = ENG-DARK | (a) teach beat 1 on the dark shelf WALK (no drop under it) instead of a soft fall: keeps "first try cannot fail", needs no ENG-SOFT-W3; loses the kind first fall. (b) sky: cut to one big wake on the last rim (the backdrop can still show a starry roof); loses the wide glowworm sky moment. (c) keep c and b: they are the descent's variety and KIT-W3 builds them | ENG-ASKS + ENG-DARK + ENG-SPORE landed + KIT-W3 (c, b) + KEEPER-W3 |
| 3-2 | 0 / 15 clean (trim refuses on every seed: ocelot sockets "threat ocelot*1: laid 0", "no creature laid"; W1-2 sections "ask for the double" on move 1; ground pool short; quiet line 6.4-11.3 s; W1 tip keys hint.1-1.*) | ENG-ROOT (M: rope over WALKABLE floor, look 'root'; only platformPlan.ts:45 names it); ENG-ASKS (S; asks `#dark`); ENG-PROWL DONE (predators/core.ts:82) | root/rope brick (`r`), ground brick with an ocelot socket (&ocelot*1..3), cover/hide brick (`m`, "no hide laid" nodeAsks.ts:117): 3 bricks | none: root = W1 vine rope darkened + game/w7/vine-anchors#anchor-1..4 (1.15 ok); glowHang0-2 (0.79 ok); ferns w3-props#fern (ok); ocelot = B4:enemies/ocelot-atlas (in game) | lines-3-2.md: teach.root (jump up, hold the root, creep), teach.glow (before beat 9), goal "Something is watching. Keep low and keep moving.", journal.ocelot, home line, locked-exit line | the root creep under a prowler = ENG-ROOT | W `m` (cover) -> `r` (the root IS the hiding place: keep low on the root over the prowler); saves the cover brick; loses one hide-and-wait beat. Everything else as designed | ENG-ASKS + ENG-DARK + ENG-ROOT + KIT-W3 (r, ocelot ground) + KEEPER-W3 |
| 3-3 | 0 / 14 clean (trim: "content 'l' (lure): no lure laid" x14, "no creature laid", ocelot sockets, move 1 double) | ENG-LURE fear 'spore' (S: the chime is built; the puff as the lure's fear is not); bot skills ring-to-call + bait-and-climb (S-M, the bot gate needs them); ENG-SPORE landing (S); ENG-ASKS (S; asks `#spore@puff`). Content `x` (trap) is B15's, NOT needed after the trim | ground brick with an ocelot socket; a lure brick (chime stone socket, lureLay.ts) for W3: 2 bricks (the socket brick shared with 3-2) | HF S: the grandfather puffball (swell, FLOOMP), about 2 Pokey tall; HF M (optional): ocelot yawn-and-pad-home frames, nearest existing ocelot-atlas#stretch + walk (in game); the stone's hum only if the stalactite reads still | lines-3-3.md: teach.ring (cats come to a ringing stone; sleepy mushrooms send them home), teach.land (before beat 6), the yawn line, journal.ocelot-2, goal (rule "Drive off" vs "send home"), home line, locked-exit line | the spore lure (ring the stone, the ocelot comes onto the sleepy puff) = ENG-LURE | `x` -> `l` at T, X, S (the lure keeps the trap's job: move the cat); C `x` -> `g` with an ocelot (V11). No B15. Yawn frames: use stretch + walk off, unless the stills read scared | ENG-ASKS + ENG-SPORE + ENG-LURE + skills + KIT-W3 (ocelot ground, lure) + HF puffball + KEEPER-W3 |
| 3-4 | 0 / 14 clean (UP tower: "shape ^: its sections rise 0 px", "content 'c': 3 of 3 sections are floating", tower.ts:607 "reached by jumps alone", pool short climb/bounce) | ENG-MOON (M: the moving light band + the moonflower step on its clock); bot skill wait-for-light (S); ENG-ASKS (S; asks `#soft@moon`). Content `p` (beat) is B14's, NOT needed after the trim | UP-tower rising bricks, vine-led (tower.ts:607): climb `c`, floating `f` under a vine, bounce `b`: 3 bricks | HF M: the moonflower STEP, 3 states (bud, open cup with a 120 px walk top = 1.35 Pokey wide, droop); HF S: the moonbeam shaft (painted additive light); moon backdrop: B3-w3sinkhole-sky (exists, the lead's call); wall stone: w3-props#rootLadder (1.46 ok) + hf678/w17-moss-liana instead of a new sinkhole wall | lines-3-4.md: teach.moon (before beat 2: flowers open where the moonlight touches), teach.rise (before beat 6: keep up with the moon), wonder.moon, journal.moonflower, mission card, home line, locked-exit line | the moonlight stair = ENG-MOON | `p` -> ENG-MOON's own step (the moon is its own clock: no B14 pods); P `r` (3-2's root overhang) -> `f` ledge under a vine, so 3-4 does not wait on ENG-ROOT | ENG-ASKS + ENG-MOON + skill + KIT-W3 (rising c/f/b) + HF moonflower + beam + KEEPER-W3 |
| 3-5..3-9 | as written rolled (rolls/3-8-raw.txt, 3-9-raw.txt so far): 3-8 refuses `#thornvine@doze` x28 (nodeAsks.ts:163) and `s` (swing, not built) x16; 3-9 throws V13 at token 11 (preview is LATER, pipeline.ts:602) on every seed | next message | | | | | | | |

B14 / B15 (the lead asked): NOT tested, so NOT an S integration merge. B14 = t-b14 @ 8bcbe53b: bots 0 of 3 seeds pass (castBots, both settings), drawcheck 1-4 sideways 8.01 > 7.5; not in main. B15 = t-b15 @ b670564f: attempt 2 stopped at the 40% rule, WIP, gates not re-run on its head; not in main. With the trims above World 3 needs neither (3-3's `x` -> lure, 3-4's `p` -> ENG-MOON; 3-8's `@doze` clock -> ENG-ASKS's @clock).

## THE LANE LIST (dependency order; 3-1..3-4 now, 3-5..3-9 added next)
| # | lane | size | needs first | unblocks | side by side with |
|---|---|---|---|---|---|
| 1 | ENG-DARK landing (in flight, t-eng-dark-wip 3d41ece6) | M | - | 3-1, 3-2 (and the dark in 3-6, 3-7, 3-9) | 2, 3, 6, 7, 8 |
| 2 | ENG-SPORE landing (t-eng-spore-wip 5dd854b15, approved 8477445a5) | S | - | 3-1, 3-3 (3-7) | 1, 3, 6, 7, 8 |
| 3 | ENG-ASKS (any registered hazard id + @clock, every world) | S | (checks laid zones: after 1-2 land for the W3 ids, the code can start now) | every level | 1, 2, 6, 7, 8 |
| 4 | ENG-ROOT (rope over walkable floor, look 'root') | M | - | 3-2 | 5, 6, 7, 8 |
| 5 | ENG-LURE fear spore + bot skills ring-to-call, bait-and-climb | S + S-M | 2 | 3-3 | 4, 6, 7, 8 |
| 6 | ENG-MOON (light band + moonflower step) + skill wait-for-light | M + S | - | 3-4 | 4, 5, 7, 8 |
| 7 | KIT-W3 (narrow bricks at the 1140 px storey: down c, b; rising vine-led c/f/b; root r; ocelot-socket ground; lure; cover m) | L (7 bricks; root and lure bricks after 4 and 5) | 1, 2 for the dark/puff bricks; 4 for r; 5 for the lure | 3-1..3-4 | 4, 5, 6, 8 |
| 8 | KEEPER-W3 (lines-3-1..3-4: 6-7 lines each) | M | - | 3-1..3-4 | all |
| 9 | ART-W3 HF: grandfather puffball (S), moonflower step x3 (M), moonbeam shaft (S) | M | - | 3-3, 3-4 | all |
| (opt) | ENG-SOFT-W3 put-back soft end; glowworm sky set | S-M, S | 1 | 3-1 only if the trim (a)/(b) is refused | |

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
