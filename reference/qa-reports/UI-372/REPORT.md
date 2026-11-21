# UI-372: an edge marker for a spooked little one off screen (R-165.372)
Designer, Opus 5.5 high. Base origin/t-build-23 @ 66775dabf (2-3 GREEN). Branch t-ui-372. Started 4:05 PM ET (by `date`).

## UI-372b: the stills re-shot on the 48 px ruling, and THE FULL SET one heavy run at a time (top section, newest)
Designer, Opus 5.5 high, a fresh member. Base origin/t-ui-372 @ 7a638985c. Started 4:31 PM ET (by `date`). Push: t-ui-372.

### Stills (re-shot on 7a638985c; CAPTIONS.md updated; commit 6b4d65a00)
Shooter `stills372.mjs` (dev server 5181), Normal then Easy, ONE run at a time. Settings read from the engine: normal `{"easy":false,"cages":5}`,
easy `{"easy":true,"cages":5}` (localStorage sloth_difficulty only; the HUD shows 3 slots). 'gone' stops on the FIRST frame spookMarks().n === 0:
the otter's left side is 75-76 world px inside the left edge in all four (past the 48 px line).

### Polish check (each still looked at the way Matt will on a phone)
| Item | Verdict | Still |
|---|---|---|
| Whose face it is reads at a glance (the worried otter with the amber '!', the same as the HUD slot) | pass | ui372-normal-left-upright.jpg |
| Which way: the amber wedge points out, on both sides | pass | ui372-normal-left-upright.jpg, ui372-normal-right-sideways.jpg |
| Reads on the bright sky and on dark trees | pass | ui372-normal-right-sideways.jpg (dark trees), ui372-easy-left-sideways.jpg (reeds) |
| Clear of the HUD plates, the pad band and the edge | pass | all: x 45 / 367 / 870, y 559 upright / 204 sideways |
| Still up while its body is off the screen | pass | ui372-{normal,easy}-nearing-*.jpg (n = 1) |
| Gone only once the whole body is 48+ px inside | pass | ui372-{normal,easy}-gone-*.jpg (n = 0, 75-76 px in) |
| Easy is really Easy | pass | ui372-easy-left-sideways.jpg (3 slots) |
| NAMED, not fixed: in 'gone' the otter is on screen and clear of the edge, but it is crouched in its hiding pose among green reed blades, so it reads SMALL (sideways most of all). The HUD face keeps its '!' until he fetches it. The lead judges whether it is plain enough. | named | ui372-normal-gone-sideways.jpg, ui372-easy-gone-sideways.jpg |
| NAMED, seen, not explained: in the 'gone' frames, after the shooter's long walk back, the duck and capybara HUD slots show grey instead of green-ringed (in 'left' they are green) | named | ui372-normal-gone-upright.jpg vs ui372-normal-left-upright.jpg |

The lead judged 'gone' at 2x: ACCEPTED (the otter's face shows in the reeds, 75 px in, and a short search in cover is the mechanic).
The grey duck/capybara slots: (b) the game, by design. followFaces.ts lineFaceState is 'hid' only when the little one is in cover AND still;
anything out of cover or moving is 'open', which LineFace draws dim with a grey ring (not the spooked grayscale + amber '!'). In 'left' he stood
still in the reed bed for 120 frames (both 'hid', green); in 'gone' he has walked about 400 px back and the duck stands by him on open ground
(ui372-normal-gone-upright.jpg): 'open'. The lead agreed. NOT YET CONFIRMED from e.lineFaces() in that frame: the shooter now logs it
(289e6cb2b: `faces` and `line` on every nearing/gone note), one browser run (see EXACT NEXT STEP 2).

### Gates (THE FULL SET, gates.md D96; one heavy run at a time on 7a638985c + report/stills/shooter commits only, no code change)
| Gate | Verdict |
|---|---|
| npx tsc --noEmit -p . | PASS |
| artcheck | PASS |
| knowncheck | PASS |
| generalitycheck | PASS |
| coveragecheck | PASS |
| timecheck (after `git fetch --unshallow`) | PASS |
| roadmapcheck, this branch's own ROADMAP | PASS |
| roadmapcheck, the lead's ROADMAP (origin/ccr-ea739a2f-dfcee4) copied into a scratch tree | FAIL (6), none on R-165.372 (its row passes): 5 rows (R-165.252/343/353/364/368) name PR #77, merged on main (2a87f4cda) but main is not in this branch; and BUILD-PLAN's "953" vs the lead's Day 1 964. Both are the mix of the lead's ROADMAP with this branch's history, not this work: they clear on the integration head that holds main |
| unit suite (CLAUDE.md line) | RUNNING at hand-over: 1851 ok, 0 not ok so far (log /tmp/claude-0/suite.log; the verdict is the `suite rc` line at its end) |
| vite build + chunkcheck, drawcheck, clipcheck, lockall --check, paintcheck 0/3 1/3 2/3, registry seed lists, tipwalk, registrycheck, the CI tool line (engine-tool tests), kbdcheck, tierBots, buildcheck ALONE | NOT RUN (box) |

### EXACT NEXT STEP (UI-372c)
1. Read the suite's verdict (if this container is gone, re-run the CLAUDE.md suite line alone with run_in_background, never `&`).
2. ONE heavy run at a time, each with run_in_background: `npx vite --port 5181 --host 127.0.0.1` (run_in_background), then
   `node reference/qa-reports/UI-372/stills372.mjs /tmp/x` and read the `gone` lines' `faces`: expect `duck:open`, `capy:open` (and the
   otter `spooked`); one line in this section. Kill vite.
3. `BASE_PATH=/Sloths-Adventure-/ npx vite build` + `node tools/perf/chunkcheck.mjs`; `node tools/perf/drawcheck.mjs` (2-3 within limits.json);
   `node tools/perf/clipcheck.mjs` (no new entry); lockall: `git worktree add /tmp/base 66775dabf` → there `npx tsx tools/engine/lockall.ts
   --layouts 4 --out /tmp/lock-base.json`, then here `--check /tmp/lock-base.json` (nothing moves: a HUD change); `npx tsx
   tools/engine/paintcheck.ts --part 0/3` (and 1/3, 2/3); `L=$(npx tsx tools/engine/registrycheck.ts --lists)` then `seedlist` each;
   `npx tsx tools/engine/tipwalk.ts --layouts 4`; `npx tsx tools/engine/registrycheck.ts`; the CI tool line (gates.yml line 157, the
   whole list); `node tools/perf/kbdcheck.mjs`; `npx tsx --test tools/inspect/tierBots.test.ts`; `node tools/perf/buildcheck.mjs` ALONE.
4. Fill this table with PASS/FAIL words; anything red is fixed at its root.

### Learned
- The suite ran with run_in_background (it wakes the member when it ends; `&` does not). I ended my turn to wait for it, and was then idle about 10 minutes of a 28-minute box. The report and the next step should have been written in that time (light work), not after.
- In a 28-minute box, THE FULL SET does not fit after a still re-shoot: the suite alone takes 13+ minutes here. A packet with both should size the box, or split the stills and the gates.

### Lessons applied
D62/D108 (settings read from the engine, captions name the built setting), D96 (the full set from gates.yml, with coveragecheck/timecheck/
tipwalk/registrycheck/paintcheck named), D102/D111 (handed over at the time box with the exact next step), D105 (ReadNotifications at every
step and push), D107, D109 (no clock times in messages to the lead), D113 (no foreground wait on a background run), and the packet's one heavy run at a time.



## What
On a stage whose little ones follow him (any stage with a following line, never a stage id), a little one that a look spooked back
off the screen now gets a small marker at the screen's edge on its side, at its height: its own worried face (its Sad painting from
w2-props, the pose it hides in) in a 44 px circle, an amber ring that breathes gently (brightness only, still under reduced motion), the
HUD face's own amber '!' badge, an amber wedge pointing out to it, and a soft drawn shadow so it reads on the bright sky. It shows only
while that little one is spooked AND off the screen, and goes away the moment it is on the screen, rejoined or home. Both sides, both
orientations. It is drawn on the game canvas (not tappable), under the iris.

- `src/game/edgeMarker.ts` (new): `edgeMarks()` pure placement into a reused array (side; x inside the safe inset; y at its body's height,
  clamped below the HUD band (130 px) and above the pad band (150 px); two on one side stacked apart); `drawEdgeMarks()`; `safeInsets()`
  (an env() probe made once, read once per screen size); `stillMarks()` (the reduced-motion query made once, read live).
- `src/game/engine.ts`: `spookMarks()` (public, for the test), `countMarks()`, `drawSpookMarks()` called once per frame in the screen pass
  (device-pixel transform, before the iris), only when the stage has a following line. Reuses the view object and marks array.
- `src/game/riverArt.ts`: `w2Sheet()` (the already-loaded w2-props image; no new load, no new canvas).

## The mock-up (SHOW FIRST)
`stills/ui372-mock-normal-{left,right}-{upright,sideways}.jpg` (drawn over the real 2-3 frame, nothing built; script `mock372.mjs`).
The lead's yes, with three notes, all taken: (1) the soft shadow: yes (drawn as two translucent discs: shadowBlur is banned in a frame,
PERFORMANCE-RULES §1); (2) a gentle pulse by brightness only, still with reduced motion (the game has no setting of its own; the phone's
prefers-reduced-motion is read, as screenShake.ts does); (3) a worried face: w2-props HAS Sad paintings for all three, used
(`stills/sad-heads.png`).

## The plant
`src/game/edgeMarker.test.ts`, 3 tests:
1. The real engine on 2-3 (RealPlay), three freed by the stage's own cages: one set spooked 330 px off the left edge: one mark, side -1,
   its own kind; off the right: side +1; on the screen: none; rejoined off screen: none; home: none.
   **RED on 66775dabf** (the base worktree with only the test and edgeMarker.ts copied in: `the engine places edge marks`, no spookMarks:
   no marker for an off-screen spooked one), **GREEN** here.
2. Pure placement: at its height; clamped under the HUD band + inset and over the pad band + inset; arrow inside the left and right insets;
   two on one side stacked without overlap; the array reused, not reallocated; a little one half on the screen gets none.
3. The draw with a stub context: one face blit per mark from its Sad frame; none for none; and no shadowBlur, filter or gradient.
   Planted: a `ctx.shadowBlur = 8` in the draw turns it RED (`no shadowBlur, filter or gradient in a frame`), checked in the base worktree.

## Stills (CAPTIONS.md names the built setting of each)
2-3, 2x, upright 412x915 and sideways 915x412, Normal (built easy:false, 5 slots) and Easy (localStorage only; built easy:true, 3 slots):
`stills/ui372-{normal,easy}-{left,right,nearing,gone}-{upright,sideways}.jpg` (16).

## Polish check (looked at each the way Matt will on a phone)
| Item | Verdict | Still |
|---|---|---|
| Whose face it is reads at a glance (the worried otter, matching the HUD slot's '!') | pass | ui372-normal-left-upright.jpg |
| Which way: the amber wedge points out to the edge, both sides | pass | ui372-normal-left-sideways.jpg, ui372-normal-right-sideways.jpg |
| Reads on the bright pink sky and on dark trees (the drawn shadow) | pass | ui372-normal-right-sideways.jpg, ui372-easy-left-sideways.jpg |
| Clear of the HUD plates and the pad band, inside the edge | pass | all; upright y 559, sideways y 204; x 45 / 367 / 870 |
| At its height: level with the little one's ground | pass | ui372-easy-nearing-upright.jpg (level with the reed bed) |
| Still up while it is just off screen | pass | ui372-{normal,easy}-nearing-*.jpg (n = 1) |
| Gone the frame it is on screen | pass | ui372-{normal,easy}-gone-*.jpg (n = 0) |
| Easy is really Easy | pass | ui372-easy-left-sideways.jpg (3 slots) |
| Named, not fixed: in `gone`, the otter is on screen but crouched in its reed tuft at the very edge, so it is subtle for a moment; the HUD face keeps its '!' until he fetches it | named | ui372-normal-gone-sideways.jpg |
| Named: the marker sits over the heron's look wash when the look is on that side (it is meant to: it is the thing to fetch) | named | ui372-normal-left-sideways.jpg |

## Gates
Run on t-ui-372 at 0ad902c41 (the code; this REPORT commit adds no code). At hand-over (the box):
| Gate | Result |
|---|---|
| `npx tsc --noEmit -p .` | PASS (clean) |
| `src/game/edgeMarker.test.ts` | PASS 3/3; plant RED on 66775dabf; the shadowBlur plant RED |
| THE SUITE (the full `npx tsx --test ...` line) | RUNNING at hand-over. It CAUGHT one of mine: fonts.test 'no fourth family' (the '!' badge used a bare `sans-serif`); fixed at the root (the game's FONT_UI, made once), fonts.test and edgeMarker.test GREEN alone; the rest 1179 ok, no other failure so far (log: scratchpad suite.txt; started on 6f43157d5, before the shadow swap, which only touched edgeMarker.ts, re-run alone GREEN) |
| `BASE_PATH=/Sloths-Adventure-/ npx vite build` | PASS |
| `node tools/perf/chunkcheck.mjs` | PASS |
| `node tools/perf/artcheck.mjs` | PASS |
| `node tools/perf/knowncheck.mjs` | PASS |
| `npx tsx tools/engine/generalitycheck.ts` | PASS (26 literals, 26 known: none new) |
| `node tools/roadmapcheck.mjs` | NOT RUN to a verdict: "shallow clone, proofs cannot be checked (fetch-depth 0)" (this container's clone); also R-165.372 has no row on ROADMAP.md on this base (grep found none) |
| `node tools/perf/drawcheck.mjs` | RUNNING at hand-over: 13 of 20 scenarios done, no breach printed so far (2-3 not reached yet). Note: drawcheck never builds a spooked-off-screen state, so the marker's own frame is guarded by edgeMarker.test.ts test 3 (no shadow, filter, gradient) |
| `node tools/perf/clipcheck.mjs` | RUNNING at hand-over: its planted cases caught as they must; no verdict yet (the marker is on the canvas, not a DOM screen) |
| `npx tsx tools/engine/lockall.ts --layouts 4` | base recorded on 66775dabf (816 builds of 102 stages, EXIT 0); `--check` of t-ui-372 against it RUNNING |
| `npx tsx tools/engine/seedlist.ts 1-1 --check` | PASS (161 seeds, both settings) |
| engine tools' tests, `buildcheck`, `kbdcheck`, `tierBots` | QUEUED behind seedlist in one background chain |


## EXACT NEXT STEP
0. The lead's ruling on 'gone' is BUILT at the hand-over commit (edgeMarker.ts INSIDE = 48 world px: the marker goes only when the whole
   body is inside the screen by 48 px, both sides; edgeMarker.test.ts test 2 planted: RED on 0199a3475 'half off the left edge: marked',
   GREEN here, 3/3). FIRST: re-shoot the stills, the 'gone' pair above all (the shooter now stops on the first frame spookMarks().n === 0):
   `npx vite --port 5181 --host 127.0.0.1 &` then `node reference/qa-reports/UI-372/stills372.mjs reference/qa-reports/UI-372/stills`
   and the same with `easy`; judge `ui372-*-gone-*` (the otter must be plainly visible, clear of the edge) and update CAPTIONS.md
   (the 'nearing'/'gone' lines). The stills in the folder now are from 0ad902c41 (before the font and the margin).
1. THE FULL SET again from scratch on the hand-over commit, ONE heavy run at a time: the kernel killed a process for memory while
   the suite, drawcheck, clipcheck, lockall and the stills ran together, so none of the in-flight verdicts below count. Verdicts that DID
   finish before that: tsc, build, chunkcheck, artcheck, knowncheck, generalitycheck, seedlist PASS; the suite had caught one failure
   (fonts.test, fixed, GREEN alone). Order: the suite line from CLAUDE.md; `node tools/perf/drawcheck.mjs`; `node tools/perf/clipcheck.mjs`;
   lockall (on 66775dabf `npx tsx tools/engine/lockall.ts --layouts 4 --out /tmp/lock-base.json`, then on t-ui-372 `--check
   /tmp/lock-base.json`: nothing should move); the engine tools' tests, `node tools/perf/buildcheck.mjs`, `node tools/perf/kbdcheck.mjs`,
   `npx tsx --test tools/inspect/tierBots.test.ts`.
2. `git fetch --unshallow`, then `node tools/roadmapcheck.mjs`; if it asks for an R-165.372 row (none on this base), the lead adds it.
3. Fill the gates table with each verdict; anything red is fixed at its root before the merge after t-build-23.

## Learned
- Canvas text in a new draw uses the game's font constants (fonts.ts), never a bare family: fonts.test catches it, but only in the full suite.
- The ban list in PERFORMANCE-RULES §1 (no shadowBlur) is easy to forget on a "small code-drawn touch"; a stub-context test that records
  setters catches it in seconds and is cheaper than waiting for drawcheck, which never builds a spooked-off-screen state on 2-3 anyway.
  Proposed: any new per-frame draw ships with a stub-context guard like edgeMarker.test.ts test 3.
- Mock-up by drawing over the real frame in page.evaluate (mock372.mjs) took one round and made the build's numbers exact.
- The engine cannot render headless in node (scenery devScale); test the draw with a stub context, the placement pure, the wiring through
  a public read (spookMarks).

## Lessons applied
Built-setting labelling (LESSONS.md line 85: the shooter prints e.easy before any still); Easy by localStorage only; SHOW FIRST before
building; check the fact (the shadowBlur ban found in limits.json before drawcheck, then planted); every gate run (table); new replaces
old (no switch). The D-numbered lessons named in the packet (D62, D96, D102, D105, D107, D108, D109, D111) are not labelled by number in
LESSONS.md on this base; applied by content: built setting in captions (D62/D108), lean read (D102), no clock times to the lead (D109),
the box and the exact next step (D111), THE FULL SET (D96).
