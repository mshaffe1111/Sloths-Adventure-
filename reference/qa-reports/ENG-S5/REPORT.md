# ENG-S5 REPORT (t-eng-s5 from origin/t-eng-s4@4bafe110; packet reference/packets/2026-11-14/ENG-S5.md on the lead's branch)
Start 10:29 AM ET (pasted from date). Code head **a71b5c484**. Context at the report: about 40% of the 1M window (my estimate; the lead quoted ~29% at 11:01). Stop 12:37 PM ET (pasted from date): past
the 90-minute box, for the lead's 11:38 REDO and the gates (nothing left running, D59).

## Done-items
1. **levelCheck lays liana -> liana -> liana** (no perch between). ONE measure, the engine's press: physics.ts `chainWindow` = pressWindow on A hitting canGrabSwing on B at B's stage phase
   (swingSetup: chainPhase). The walk (levelCheck 3a, gen2-built stages only, as roofedDrop): ledge -> A (lianaCaught), A -> B (`chainLines` >= 6, the stage's double rule), B -> platform
   (`heldLandings`, pressWindow from his holds). gen2 `chainRelease` sizes the lay: this setting's swing, A's grip-dial holds, a press counts only with B's WHOLE swing (anchor + foot's reach) within
   SWING_SEEN 414 of him. Easy wider on every link (test). The swing camera leads with that whole swing upright (cameraFollow.ts `lianaBox`), so the rule is what he sees; and on a swing a perch ACROSS
   the gap now beats the floor of the drop under him (`under`): over the thorn hollow that floor out-scored the chain's last perch and the view never led to it as he pressed (seen in my upright still
   at the press on l3; fixed in landingAhead, swing only, planted). The lead's 11:38 REDO (the hollow under the chain did not read as danger): while he swings over a hurt floor the view keeps its
   thorn bed in its lower part, him whole first (cameraFollow.ts `hurtFocus` through engine.ts camFocus, ENG-S3's focusY; a piece's own focus wins); before/after at the middle liana, both ways:
   before-after/before-sheet.jpg, after-sheet.jpg (before also had MY shooter's bug: a floorArt look on the floor, which the painter bakes no thorns for). Measured: chainband.out.txt (spacing x
   window).
2. **W1 chain rows** (w1Swing.ts): `W1_CHAIN_SECTIONS` = chain2 (SHORT, LONG) and chain3 (SHORT, SHORT, LONG), `w1ChainSection`, `w1Chain`. Ends are moss-stone BANKS (the thorn hollow paints only
   between banks that reach its floor: off a 24 px bough w1Pits found no lips and the thorn bed was never painted; pits probe, then the planted test). Normal: one thorn hollow under the whole chain
   (hurt, no steps out); Easy: the soft moss pit with its stair back (1-6.md "moss under every chain"). The chain's LAST leap is laid whole in view as he presses (lianaRelease `held`: the press link
   has no ~370 px cap, and my first upright still had the perch off screen at the press), so its perch is narrow (120-140 px, FAR's; Easy's pad makes 173-187). Laid (lay.out.txt, 1-6 + 6-3 kits, 4
   rolls, both rows): dx 244-260 px, both lianas 0.24-0.26 rad, chain windows Normal 2.37-2.87 s, Easy 3.07-3.30 s (Easy wider every link); last perch 277-336 px past the last liana (Easy 232-297);
   chain3's last-leap window, whole-perch presses only: Normal 433-833 ms, Easy 767-1000 ms; the top hold drops short (0 ms) on 3 of 4 rolls (top.ts probe in the REPORT's pushback f). Tests:
   w1Chain.test.ts (6), planted (planted.out.txt): 9 of 9 red without their piece (walk, lay, seen, camera, easy, banks, heldseen, under, hurtfocus).
3. **Clips (D63), real page, the engine's own catch/let-go/camera**: shots/ (on a71b5c484; the row laid by gen2 on the page, set into 1-2 at its spawn): Normal + Easy x upright 412x915 + sideways
   915x412: all four fly l1 -> l2 -> l3 -> perch, down on the PERCH, 0 lives lost; Normal's last leap takes the second jump. Stills at each press, on the middle liana and at the end; labels print the
   game's setting. Gates (full CLAUDE.md Checks on a71b5c484, own worktree; buildcheck last and ALONE): tsc 0; unit 3 shards 3423 pass, 1 fail (hurtFloor.test.ts: my engine.ts comment named the floor;
   reworded, that test + w1Chain re-run on the head: 23/23); build, chunkcheck, artcheck, knowncheck, generality, kbdcheck, seedlist 1-1 (257), engine tools, tierBots, drawcheck (512 s), clipcheck (83
   known): PASS; buildcheck ALONE: PASS (Normal p95 121 ms). roadmapcheck: exit 2, 'shallow clone, proofs cannot be checked' (this container's clone, as ENG-S4's; UNRUN in effect). gates.out.txt.
   lockall: 102/102 unchanged vs 4bafe110 (lock-check2.out.txt, on dde790f32; after it only gen2 chain code (no shipped stage lays a chain) and the camera, which the lock does not hash).

## How BUILD-16 lays beat 4 with the row (exact)
- Kit: `withSwing(w1World())` with `manifest.hurtFloor: THORN_ROW` (w1Arc12.ts, as 1-2/1-5 do) and `W1_CHAIN_SECTIONS` in its sections (chain2 then chain3 = "Two lianas, then three"). Nothing else:
  the row lays its own lianas, perch and the gap under the whole chain.
- The flag before beat 4 and the heart after it (STAGE-RULES; 1-6.md) are the stage's. Petals: 1 on the bank, 2 on the perch (sockets).
- The LONG leap off the last liana needs the second jump (the window counts it, LETGO_FLIGHTS; 1-6 allows the double): Dot's line should say "slide down, leap, jump again" if the stage teaches it
  there. Chain gaps fly on one press.
- Shoot it with reference/qa-reports/ENG-S5/shoot.mjs (STAGE=<id> ROLL=<n> CLIP=1): lays the row with gen2 on the page.
## Pushback / rough spots (named)
(a) The chain gaps are EASY by measure: at the laid 244-260 px a press catches the next liana for 2.4-2.9 s of a 2.85 s swing (the catch is the whole liana's line, +-60 px). The band runs to ~300-320
    px before B's whole swing leaves the view; `share` toward its far end asks more (a Designer's number). The beat's timing test is the last LONG leap (433-833 ms Normal, whole perch in view). (b)
    Both lianas keep >= VINE.amp / 2 (0.225 rad): MY floor so "the next always coming" is a swing he times; the Designer should confirm it. (c) Easy's moss is under the whole chain, not only "the
    middle" (beat 4's row): a split floor is one more pipeline feature if the lead wants it. (d) Old-generator stages keep the old walk (14 hang lianas within a chain's reach; their pickups and flags
    moved in the first lock run). (e) Pre-existing, not changed: levelCheck swingLandingsIn's cache key lacks TIMED, so a dialled liana's Normal answer can be reused on Easy. (f) On 1 roll in 4 (both
    settings) the last perch lands where the TOP hold still flies it (shareFor's tempo scales `share` down): not a true "slide down" LONG there. Fix: a `topShort` rule on land (the band's near end
    where gripsOf('high') gives 0 ms). (g) My clips set the row into 1-2 at runtime (the floor under it as the pipeline lays it); 1-2's own Dot line pops its tap box mid-chain (the stage's, not the
    row's; TIPS owns line timing). Easy's floor in them is a moss STAND-IN with no root stair; BUILD-16's Easy still shows the real soft pit.
## Polish check
Judged on the real page, upright and sideways, both settings (shots/, before-after/): the next liana is drawn and in view at each press; the chain's last perch is whole in view at the press (upright,
after the two fixes); the thorn bed reads along the bottom of the view under the chain both ways, him whole (lead PASS 11:47). Named, not mine: 1-2's own Dot tap box pops mid-chain (TIPS owns line
timing). Named stand-in: Easy's floor in the clips has no root stair (the pipeline lays it). Named design points: pushback (a), (b), (f).

**Method used:** stage-piece.md (data first, planted test first, 2+ worlds, lock). **Lessons applied:** D19 (the walk, the lay and the bot all fly physics pressWindow / chainWindow, the engine's
press), D40 (built on A1's dial, ENG-S1's SWING_SEEN, chainPhase; nothing this sprint replaces them), D43 (no stage literal: the 14-stage list is a comment, the gate is gen2Built), D57 (queue read at
every push), D59 (nothing left running), D62 (labels print the GAME's setting: localStorage, e.easy, the swing period), D63 (clips of the whole chain), D64 (context of 1M), D67 (no wait loops).
**Method update:** stage-piece.md step 6 add: "a runtime edit of a stage on the dev page must refresh the engine's start-time lists (drawnVines, plainVines, swingVines, drawPlats, paintedPlats) or new
pieces are not drawn; drive input with key events (a write to input.state.jumpPressed is cleared by the press buffer); shoot on a stage whose painter is live (a hand-painted stage like 1-6 draws no
injected ground)". **Learned:** 1) A check that changes reach changes every OLD stage's pickups: run lockall before trusting "no stage lays it". 2) A row's look depends on the painter's reading of it
(banks vs boughs): probe the painter (findW1Pits) on the laid row, not just the physics. 3) A LONG liana leap relies on the second jump: a bot without it never lands. 4) The press frame, upright, is
the still that matters: two defects (the perch laid past the view; the camera leading to the floor) showed only there, after every unit test was green.
## EXACT NEXT STEP
1. Lead: merge t-eng-s5 with BUILD-16 (no shared file but w1Swing.ts if BUILD-16 edits it). 2. Designer: rule (a) the chain share,
(b) the 0.225 rad floor, (c) Easy's moss extent. 3. Suggestion packet: TIMED in swingLandingsIn's cache key (+ lockall).
