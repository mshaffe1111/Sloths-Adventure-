# REPORT: R-165.62 (A2, help after put-backs in 1-1), Engine, attempt 1. Branch t-engine-help from t-engine-putback@41c2e248

## Method used
Test-first: the schedule with a planted off-by-one red; real-engine flights with real put-backs (seed 3747, w1-log-chain-rise); browser
stills reading Dot's own bubble (`.dg-bub-body`); the lock against A1. One pushback (PUSHBACK.md); the lead added DotGuide.tsx engineLine.

## Lessons applied
D37 (every claim run); A1's trap 9 (RealPlay's loseLife stub); frozen inputs measured first (two were wrong). New: trap 15 below.

## 1. Done-items
1. PASS. helpLadder.test.ts: Easy 3/5/8 and Normal 3/12/re-ask 20, each once and nothing else in 30-40 put-backs; per piece; reset past
   the piece and on end, not on a refused offer or a step given. Red: 4/6/9/13, and each threshold +1 alone, all fail (assert.throws).
2. PASS. helpLadder11.test.ts, 4 flights. Easy: move line at 3; pad tap rise 62 px before, 97 px at 5; 4 grown (3 steps, 1 pad) at 8; the
   whole piece on 6 plain jumps, no double. Normal: line at 3; offer at 12 with the stage frozen (x, y, t unchanged over 30 frames);
   no; re-ask at 20; no; never again (to 36). A yes grows the steps and the piece passes on plain jumps; Normal fails it without them.
   Steps are in the draw list, and gone on stop and after a restart. Quiet: no line, but the steps grow and the offer shows. No
   stuckHelp, no "Too tall". Red on 41c2e248: 12 put-backs a setting, 0 help events (R-165.62/red-on-a1.txt). Her bubble:
   helpLadderGuide.test.ts (Help and Tips: each line up within 5 s after the stage's double teach; Quiet: none; red: the old path on
   Tips is not up in 5 s).
3. PASS. `lockall --layouts 16 --intended 1-1 --check` vs A1's lock: "lock: 102/102 stages unchanged" (1-2, 1-5, W8 included; 1-1's
   data too). The ladder is null off 1-1. A1's tests are green in the suite.
4. tsc clean. seedlist 1-1 --check PASS (138). clipcheck PASS (83 known, none new; 190 s): the offer is judged upright and sideways on
   the fresh save, with a planted 26 px button inside `.ho-card` caught. Route: real put-backs (12 drops, A1 sets him back) on a
   NODE_ENV=development store build through the dev-only `window.__engine`; startServer fails if the production build carries
   `__engine` (it doesn't; grepped). Production main chunk 4,171,195 B (A1 4,164,708; HelpOffer is a lazy chunk). Full suite: below.
5. Stills in R-165.62/ (dsf 1, 412x915 and 915x412): {easy,normal}-{port,land}-03-line, easy-land-08-step, easy-port-08-on-step,
   normal-{port,land}-12-offer, normal-{port,land}-12-after-back (Escape = no: offer gone, no pause menu, nothing grown).
6. For the story keeper, via the lead: the four 03-line stills (the move line, touch words), the two 08 stills (the step line + the
   stone), the two 12-offer stills (the line + YES Pokey on the stone that grows / NO jump pose).
7. reference/handoffs/engine-core.md rewritten (header, §0b rulings, §1 open, §2 where the ladder lives, traps 15-18).

## 2. Polish check
- The offer over a black stage (asked under the set-back's closed iris): fixed, now asked once the iris is open and he stands.
- Her bubble showed none of the ladder's lines: fixed (struggle help, `soon`, takes the stage's own move tip's place).
- Upright step still, first take: Pokey dropped to the log below; replaced by on-step (he stands on the stone).
- Rough, named: NO's `jump_up` pose (arms up) reads a little like a cheer. Upright, the offer's line wraps to two lines (fits).
- Risk, named: in a browser run with lessons on, a first-time "gap" lesson (a teleport artifact) took the bubble and the step line
  never came back. With lessons off (a real player at the chain has had them) both lines show. A lesson landing in the same second
  can still drop it.

## 3. Pushback
PUSHBACK.md (accepted). Frozen inputs that were wrong: "No soft moss" in gen2 1-1 comes from w1.ts's hint.1-1.noMoss sockets, not
mixer:76 (the engine marks it heard in 1-1; the mixer line is also gone). The coach has no Pokey pose: NO is the hero's jump_up.
"Flick up and forward to jump." repeating: no source in 4 flights (RealPlay both settings x12; browser at the chain x4; browser fresh
save at the coach's first gap x6): said at most once, from the touch coach's jump step. No file edited for it.

## 4. Suggestions
- App.tsx (owner: UI): a web back swipe while the offer is up runs guardBack and opens the pause menu over it. Ask the back stack first
  in onBackSwipe as androidBack does. Done when a browser history.back() on the offer answers no.
- roadmapcheck can't run here ("shallow clone, proofs cannot be checked"); CI runs it with fetch-depth 0. knowncheck PASS.
- dotGuide.ts: a struggle line cut by a first-time lesson is not re-queued. Done when a test shows it comes back.

## 5. Unresolved: the NO picture's pose (above) waits on the story keeper's word.
- Found and fixed on the way: importing w1.ts's section tables into the engine pushed the main chunk to 4.48 MB (over the 4 MiB rule);
  the move a piece needs is now read from the piece as laid (pieceMoveLaid, tested).

## 6. Method update (methods/stage-fix.md): "A Dot line is done when it is in her bubble (`.dg-bub-body`) in the browser, on Help and Tips."

## 7. Turnover note: reference/handoffs/engine-core.md rewritten (commit 132134b2).
## Full suite (3 shards, final code): PENDING
