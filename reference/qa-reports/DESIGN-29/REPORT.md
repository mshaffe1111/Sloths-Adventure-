# DESIGN-29 REPORT (Designer, t-design-29 from origin/main 6e7b85f8; started 6:09 PM ET 11-18, written 6:26 PM ET 11-18; packet reference/packets/2026-11-18/DESIGN-29.md)
**EXACT NEXT STEP (lead):** rule on Pushback 1-6 (2-9.md's end; 1 = the royal guard's journal card), then write NEW 1 (the court's tempo, incl. the liana clock) and NEW 2 (the drum) as engine packets, after t-eng-24/24c/25 and 2-6's wheel merge.

## Done-items and evidence
1. **reference/design/2-9.md built-ready, as 2-4.md:** one idea; 4 tributes (Rayman Legends, Bit.Trip Runner, Donkey Kong, SMB3's airships; loved/taught/ours/not copied, quotes as the pitches cite them);
   beats table (s, bits, there, does, feels; 12 rows, A's beats 10-12 as 9-11, no guards); the beat TAUGHT in the first 30 s (asks for the keeper, no lines); a player who ignores the beat still finishes
   (no beat-only death; costs named); Normal 20.0 / Easy <= 12.0 PASTED from DIFFICULTY.md:61-63.
2. **Node string passes checkCode** (`npx tsx reference/specs/sims/nodes29.ts`, out/nodes29.txt): 15 tokens, no errors; a planted string missing X's rest is refused (V5).
3. **Every number flown on the real engine through InputEngine** (court29.ts, wheel29.ts; out/court29-{normal,easy}.txt, wheel29-{normal,easy}.txt; deterministic: the beat rows of two separate runs are byte-equal): the beat from
   TIMED.period / 4 (0.7125 / 0.825 s); the hop on the beat on a sinking pad (margin 0.67 / 1.07 s; a missed beat holds on Easy, runs off or sinks on Normal); every toy a whole number of beats on BOTH
   settings (court rivers 4 beats, double 2, barge 8; the wheel a bucket a bar; the liana a bar); the let-go window locked (2.00 / 2.40 s); the barge boarded 90 / 95%; stones in step and the wave.
   The bell needs no window: rung any time, its answer lands on the next ONE (NEW 2).
4. **Engine list: 2 NEW** (court's tempo S-M; the drum cue S; files, toys RED-planted), the order (after t-eng-24/24c, t-eng-25, 2-6's wheel), the hand build replaced (w2Stages.ts :39/:48-49/:58/:1085,
   w2Sections.ts :102/:125/:731, levelSeeds.ts:25, stageSheets.ts:85, journalMet.ts:13) and its pinned tests (grep, 2-9.md), the new goal in words for the keeper, art asks (barge, bell, throne island)
   and the drum sound.
5. **Gates** (this head): tsc 0 errors; sims tsc 0 (temp tsconfig extending the project's, types node, lib ES2023: not committed); roadmapcheck PASS (unshallowed); knowncheck PASS; generality PASS;
   timecheck (origin/t-time-168's tools/timecheck.mjs --repo this worktree): PASS (1 commit, 85 lines, 7 stamps).

## Polish check
Docs only, no stills. Read 2-9.md against the out files line by line: fixed two typed margins (THREE late 1.4 -> 1.6 s; the double row 0.47/0.6 -> 0.48/0.59 s) and one cite (heroSprite.ts:30,32).

## Pushback (in full at 2-9.md's end)
1 the royal guard's journal card loses its stage; 2 B's 0.08 s on a pad was a closed form (flown 0.30-0.33 s, RUN pitch only; 3 stones in step only from ONE); 3 easyStretch is per clock and rivers don't
stretch; 4 the bell on the steps' arch, not the bow (Anchor on a drifting log unflown); 5 Easy's wheel R160; 6 NEW 1 must re-sync the liana clock after a resume (engine.ts:6010).

## Suggestions (outside my walls)
1. ENGINE (xhigh): NEW 1 + NEW 2 from 2-9.md "Engine", toys as written. 2. CONTENT: move the royal_guard road card (journalMet.ts:13) by the lead's ruling. 3. ENGINE: the vineClock/gameTime split is a
general fault (any stage with lianas and a resume), not 2-9's: fix it for every stage (rule 22).

## Unresolved
The missed-beat cost (~4 s) is read from engine constants (DOWN_SECS, the 70 px set-back), not flown; the bell's reach from the barge is the builder's flight; bits are estimates from flown windows;
at some gaps the RUN row's stand varies 0.13-0.43 s (coyote time saves a hop at a floor's far lip): the chosen gaps are the steady ones; Easy's twist is the drum's sound only (same timing).

## Method used / Lessons applied / Method update
Used: methods/level.md rules 1-9, 17, 21-24; DESIGNER.md; DESIGN-24-25's snapClock/swingLog patterns. Lessons: D30/D42 (every stamp from `date`), D15 (tool checked: deterministic, planted V5), D34 (cites
re-read last), D41 (89.1), D49 (flags by the live rule), D58, D83 (relative imports), D53 (fast gates before push), D57/D87 (ReadNotifications), D59 (no job left running), D64.
**Method update (level.md rule 24):** "Fly a beat toy as a CADENCE (taps on the beat grid, the run held), never one hop; name each clock's source (gameTime, vineClock, a stood count)."
**Turnover note:** reference/handoffs/designer.md rewritten (§0 Now: 2-9, its traps) in this branch's commit.
**Learned:** fly a beat toy as a cadence; the wave is the beat's easy row (65% vs 33%); two sums of one dt (vineClock, gameTime) drift at the first seek (2-9.md "Learned").
