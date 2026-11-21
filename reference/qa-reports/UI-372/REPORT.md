# UI-372: an edge marker for a spooked little one off screen (R-165.372)
Designer, Opus 5.5 high. Base origin/t-build-23 @ 66775dabf (2-3 GREEN). Branch t-ui-372. Started 4:05 PM ET (by `date`).

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
| THE SUITE (the full `npx tsx --test ...` line) | RUNNING at hand-over: 1031 ok, 0 not ok so far (log: scratchpad suite.txt; started on 6f43157d5, before the shadow swap, which only touched edgeMarker.ts, re-run alone GREEN) |
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
Merge-ready once THE FULL SET is green. On t-ui-372 @ (this commit), with node_modules installed (`npm install --legacy-peer-deps`):
1. Read the tails of the runs still going (scratchpad suite.txt, draw.txt, clip.txt, lockcheck.txt, ci5.txt); if this container is gone,
   re-run them: the suite line from CLAUDE.md; `node tools/perf/drawcheck.mjs` (2-3 within limits.json); `node tools/perf/clipcheck.mjs`
   (no new entry); lockall: on 66775dabf `npx tsx tools/engine/lockall.ts --layouts 4 --out /tmp/lock-base.json`, then on t-ui-372
   `--check /tmp/lock-base.json` (expect nothing moved: no layout code changed); then the engine tools' tests, `node tools/perf/buildcheck.mjs`,
   `node tools/perf/kbdcheck.mjs`, `npx tsx --test tools/inspect/tierBots.test.ts`.
2. `git fetch --unshallow` and `node tools/roadmapcheck.mjs`; if it asks for an R-165.372 row (none on this base), the lead adds it.
3. Fill this table with each verdict; anything red is fixed at its root before the merge after t-build-23.

## Learned
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
