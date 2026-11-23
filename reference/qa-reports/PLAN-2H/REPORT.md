# PLAN-2H REPORT (Architect; started 11:46 AM ET by `date`; base main cdffdc627 + t-eng-27 cf7428424; branch t-plan-2h off d8e800e4)

## EXACT NEXT STEP
- The lead: (1) rule R5 in TWO-HOUR-PLAN.md (two piece members through Waves 1-2, about 45 h each, or World 3 and World 4 slip a
  week); (2) take ENG-PROWL off LANES.md: it landed 11-20 (predators/core.ts:265 upOf, world3.ts:17 `up: 40`); only 'lit = seen' is
  left, inside ENG-DARK (the seam, core.ts:260-264); (3) merge main into t-eng-27 before BUILD-27 (R3). A successor: nothing open here.

## Done-items (4/4 + the write-up, all in reference/plans/TWO-HOUR-PLAN.md)
1. **§The truth table:** 75 pieces (ENGINE-NEEDS' list plus what the designs and the map add: ENG-MOON, DIM, RAFT3, SECRET, SLEEPER, the
   V preview, 2-9's tempo and drum, the hidden-stage modes), each GREEN / PART / MISSING with file:line, its bot skill (firsttimer.ts) and
   meter channel (score.ts) from meter-coverage.json on main; the 10 world kits; each world's best-fit standing and climbing art.
2. **§Per stage:** 2-8, 2-9, 3-1..3-9, 4-1..10-9 and the 10 hidden stages, each with its missing pieces and the wave that makes it
   READY. None past 2-7 is READY today.
3. **§The schedule:** 6 waves, one row per piece (size, needs, first build, GREEN by); one world of builds a week (W3 11-30 ... W10
   1-18); about 180 h of pieces, front-loaded; World 7's rare pieces GREEN 17 days before its builds.
4. **§The risks:** R1-R8, each with what the piece must carry so the level job never inherits it.
5. Cites last (D52): 79 file:line cites in the new text resolved by script against main and t-eng-27; 12 were the ambiguous `types.ts`
   (gen2/types.ts vs src/game/types.ts), rewritten with the folder; 0 unresolved.

## Since ENGINE-NEEDS (11-13), checked in code
- LANDED: left legs (legs.ts:70; out-and-back on t-eng-27), down in the tower (tower.ts:38, no row yet), still, lure (W1 rows only),
  ride, river, wheel, sound, chase, creak, followers, cages, the prowler's sight up: ENGINE-NEEDS §2 packets 2-5 and 8 are done.
- MISSING: every World 3 piece but the sight; zones by data (SectionZone: tide and wind only, gen2/types.ts:493-494); hang-under,
  break, push, the machine, leash, drowsy, heat, hold, far fling, glide down a drop, crumbling vine, swim on gen2.
- KITS: W5-W8 run OLD gen2 kits (gen2/game.ts:90-96): a port, M each. W9 and W10 kits only on 10-30 branches (L each).
- ART: no best-fit climbing art in W3, W4, W6, W9, W10 (13 ascents between them).

**Polish check:** plan only, no screens; every P-number in §Per stage, §The schedule, §The risks checked by hand against the table;
wave hours re-added from the row sizes (45 / 47 / 29 / 20 / 30 / 6).

## Pushback
1. "Green a week before its builds" cannot hold for World 3 (0-3 days) or World 4 (5 days): the ramp, named in the plan; LANES rule 2
   covers a late piece. From World 5 on it holds (10-25 days).
2. Sizes are the packet's (S 1 h, M 2 h, L 4 h); bot-heavy pieces ran far over (2-6: 35 sessions; 2-7's race: 23). A size is a budget,
   not a forecast: R1 names what each moving-carrier piece carries so the overrun stays in the piece.
3. LANES.md queues ENG-PROWL (S) though it landed on main 11-20.

## Suggestions (ready packets)
- **S1 NODE-KEY truth (Engine, S):** nodeLetters.ts:68-71 marks the vine field, beat pieces, gate and trap "not merged" though their
  runtime is on main; re-check each, rewrite `unlaid`, regenerate NODE-KEY.html (tools/engine/nodekey.ts). WRITE those two.
- **S2 (the lead's token):** one line atop ENGINE-NEEDS.md §1: "superseded by TWO-HOUR-PLAN.md (PLAN-2H 11-23)".
- **S3 2-7's meter rows (Engine, S):** pacer and post have no meter-coverage row (P48, P49); run coveragecheck --list on t-eng-27
  with 2-7's row before BUILD-27.

## Unresolved
- Hours assume two piece members (R5), not checked against the week's tokens. World 4-10 pieces are from map ideas (a design may add
  one more, lane 3's rule). World 3's bot skills are named from the designs, not traced in firsttimer.ts. Guardians: their own lane.

**Method update:** new reference/methods/piece-plan.md (none existed), indexed in methods/README.md: meter-coverage.json first (86 ids, bot and channel
in one read), map-tally.txt per stage, designs' NEW lines by grep, cites resolved by script with the folder.

## Lessons applied
D34, D52 (cites last, by script); D66 (grep first: ENG-PROWL landed); D36 (own worktrees); D100 (every stage named); D115 (gates read
the tree before the report files went in); D109; D119, D110 (no heredoc in the commit chain, pipefail, one && chain); D53; D57; D75, D101.

## Gates (docs only: LAWS 5's fast set, on t-plan-2h)
tsc PASS (exit 0). generalitycheck PASS (26 literals, 26 known). knowncheck PASS (after `git fetch --unshallow`; before it, a shallow
compare read coverage.known.json as ADDED). roadmapcheck FAIL (41): the same 41 lines, byte for byte, as base d8e800e4 (inherited:
this branch does not touch ROADMAP.md); my one new red (piece-plan.md not in methods/README.md) fixed. **Turnover note:**
reference/handoffs/architect.md rewritten (this commit).
