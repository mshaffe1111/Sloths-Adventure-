# ENG-S5 REPORT (t-eng-s5 from origin/t-eng-s4@4bafe110; packet reference/packets/2026-11-14/ENG-S5.md on the lead's branch)
Start 10:29 AM ET (pasted from date). Code head **4f77f7473**. Context at the report: GATES_CONTEXT. Stop: STOP_TIME.

## Done-items
1. **levelCheck lays liana -> liana -> liana** (no perch between). ONE measure, the engine's press: physics.ts `chainWindow` = pressWindow on
   A hitting canGrabSwing on B at B's stage phase (swingSetup: chainPhase). The walk (levelCheck 3a, gen2-built stages only, as roofedDrop):
   ledge -> A (lianaCaught), A -> B (`chainLines` >= 6, the stage's double rule), B -> platform (`heldLandings`, pressWindow from his holds).
   gen2 `chainRelease` sizes the lay: this setting's swing, A's grip-dial holds, a press counts only with B's WHOLE swing (anchor + foot's
   reach) within SWING_SEEN 414 of him. Easy wider on every link (test). The swing camera leads with that whole swing upright
   (cameraFollow.ts `lianaBox`), so the rule is what he sees. Measured: chainband.out.txt (spacing x window, both settings, both holds).
2. **W1 chain rows** (w1Swing.ts): `W1_CHAIN_SECTIONS` = chain2 (SHORT, LONG) and chain3 (SHORT, SHORT, LONG), `w1ChainSection`, `w1Chain`.
   Ends are moss-stone BANKS (the thorn hollow paints only between banks that reach its floor: off a 24 px bough w1Pits found no lips and
   the thorn bed was never painted; pits probe, then the planted test). Normal: one thorn hollow under the whole chain (hurt, no steps out);
   Easy: the soft moss pit with its stair back (1-6.md "moss under every chain"). Laid (lay.out.txt, 1-6 + 6-3 kits, 4 rolls each):
   dx 244-260 px, both lianas 0.24-0.26 rad, chain windows Normal 2.37-2.87 s, Easy 3.07-3.30 s; LONG perch 387-434 px past l3, Normal
   533-767 ms, Easy 800-1200 ms. Tests: w1Chain.test.ts (6), planted (planted.out.txt): PLANTED_LINE.
3. **Clips (D63), real page, the engine's own catch/let-go/camera**: CLIPS_LINE
   Gates (full CLAUDE.md Checks on 4f77f7473, own worktree; buildcheck last and ALONE): GATES_LINE
   lockall: 102/102 unchanged vs 4bafe110 (on dde790f32; the head since changes only the unlaid row's piece shapes and a test).

## How BUILD-16 lays beat 4 with the row (exact)
- Kit: `withSwing(w1World())` with `manifest.hurtFloor: THORN_ROW` (w1Arc12.ts, as 1-2/1-5 do) and `W1_CHAIN_SECTIONS` in its sections
  (chain2 then chain3 = "Two lianas, then three"). Nothing else: the row lays its own lianas, perch and the gap under the whole chain.
- The flag before beat 4 and the heart after it (STAGE-RULES; 1-6.md) are the stage's. Petals: 1 on the bank, 2 on the perch (sockets).
- The LONG leap off the last liana needs the second jump (the window counts it, LETGO_FLIGHTS; 1-6 allows the double): Dot's line should
  say "slide down, leap, jump again" if the stage teaches it there. Chain gaps fly on one press.
- Shoot it with reference/qa-reports/ENG-S5/shoot.mjs (STAGE=<id> ROLL=<n> CLIP=1): lays the row with gen2 on the page.

## Pushback / rough spots (named)
(a) The chain gaps are EASY by measure: at the laid 244-260 px a press catches the next liana for 2.4-2.9 s of a 2.85 s swing (the catch is
the whole liana's line, +-60 px). The band runs to ~300-320 px before B's whole swing leaves the view; `share` toward its far end asks
more (a Designer's number). The beat's timing test is the LONG leap (533-767 ms Normal). (b) Both lianas keep >= VINE.amp / 2 (0.225
rad): MY floor so "the next always coming" is a swing he times; the Designer should confirm it. (c) Easy's moss is under the whole chain,
not only "the middle" (beat 4's row): a split floor is one more pipeline feature if the lead wants it. (d) Old-generator stages keep the
old walk (14 hang lianas within a chain's reach; their pickups and flags moved in the first lock run). (e) Pre-existing, not changed:
levelCheck swingLandingsIn's cache key lacks TIMED, so a dialled liana's Normal answer can be reused on Easy.

## Polish check
POLISH_LINE

**Method used:** stage-piece.md (data first, planted test first, 2+ worlds, lock). **Lessons applied:** D19 (the walk, the lay and the bot
all fly physics pressWindow / chainWindow, the engine's press), D40 (built on A1's dial, ENG-S1's SWING_SEEN, chainPhase; nothing this
sprint replaces them), D43 (no stage literal: the 14-stage list is a comment, the gate is gen2Built), D57 (queue read at every push), D59
(nothing left running), D62 (labels print the GAME's setting: localStorage, e.easy, the swing period), D63 (clips of the whole chain),
D64 (context of 1M), D67 (no wait loops). **Method update:** stage-piece.md step 6 add: "a runtime edit of a stage on the dev page must
refresh the engine's start-time lists (drawnVines, plainVines, swingVines, drawPlats, paintedPlats) or new pieces are not drawn; drive
input with key events (a write to input.state.jumpPressed is cleared by the press buffer); shoot on a stage whose painter is live (a
hand-painted stage like 1-6 draws no injected ground)". **Learned:** 1) A check that changes reach changes every OLD stage's pickups:
run lockall before trusting "no stage lays it". 2) A row's look depends on the painter's reading of it (banks vs boughs): probe the
painter (findW1Pits) on the laid row, not just the physics. 3) A LONG liana leap relies on the second jump: a bot without it never lands.

## EXACT NEXT STEP
1. Lead: merge t-eng-s5 with BUILD-16 (no shared file but w1Swing.ts if BUILD-16 edits it). 2. Designer: rule (a) the chain share,
(b) the 0.225 rad floor, (c) Easy's moss extent. 3. Suggestion packet: TIMED in swingLandingsIn's cache key (+ lockall).
