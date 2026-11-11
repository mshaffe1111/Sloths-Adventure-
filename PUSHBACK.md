# PUSHBACK: R-165.62 (A2), attempt 1. Engine, branch t-engine-help

## The blocker: Dot's guide drops the ladder's lines. Done-items 5 and 6 can't be met inside the WRITE files
The engine says each line at its rung (`guide()` → `onGuide`). Dot's guide (`src/components/dot/DotGuide.tsx` engineLine → `src/game/dotSay.ts`
allows → `src/game/dotGuideHelp.ts` helpAllows) then filters them as ordinary stage tips:
- **Normal (Tips, its default):** both lines are refused outright. `"Jump, then flick up again in the air!"` is a `teach` tip for a
  known move (dotGuideHelp.ts:136, dotSay.ts:52); `"Ooh, look! A step. Up you go."` is `info` and not new. Proof, the real DotSay:
  `reference/qa-reports/R-165.62/dotsay-filter.probe.ts.txt`: `reminders: move line false, step line false`.
- **Easy (Help):** `allows` says yes, but in the browser flight the line never reaches her bubble. The engine sent the move line at
  5.5 s and the step line at 20.4 s; the bubble showed only the stage's own `"Flick up again midair to jump twice."`
  (`bubble-vs-sent-easy.txt`, `shoot.mjs`). Her calm queue holds or drops a second `double` tip.
So on the real screen the player gets no move line at 3 and no step line at 8 on either setting. The steps grow, the pad jump works and
the offer shows, but there is no still of Dot's line for the story keeper (done-items 5 and 6). The engine has no other way into her
bubble: the feed carries text only, and `App.tsx`, `DotGuide.tsx`, `dotSay.ts`, `dotGuideHelp.ts` and `dotLines.ts` are not WRITE files.
(The packet names DotGuide.tsx and dotGuideHelp.ts only as possible sources of the "Flick up" repeat, to be edited if a flight points at
them. No flight did: see below.)

## Suggested fix (ready packet, about 10 lines plus a test)
- WRITE `src/components/dot/DotGuide.tsx`: in `GuideRun.engineLine`, a line that is one of the ladder's own (export
  `HELP_LINES: ReadonlySet<string>` from helpLadder.ts: the six move lines, STEP_LINE) is queued straight, as
  `{ key: 'help:' + text, text, kind: 'struggle', who: 'Dot', source: 'struggle', ms }` with `run.queue.push`, on Help and Tips, never
  Quiet. The ladder is the one place that decides help (PACKETS E2), so the guide shows its line and doesn't judge it again.
- Test: `dotGuide.test.ts` (or a new `DotGuide` run test): on Tips and on Help, after the stage's double teach line has been heard, the
  ladder's move line and the step line each come up once; on Quiet neither does. Planted red: the same test on this branch.
- Done when: a browser still shows each line in her bubble, upright and sideways (the shooter is written: `R-165.62/shoot.mjs`).

## Two frozen inputs that were wrong (handled inside my files, named here)
1. "No soft moss up here!" (mixer/stages.ts:76): the shipped gen2 1-1 says it from **gen2 w1.ts's `hint.1-1.noMoss` sockets** (w1.ts:610,
   1127, 1131, 1293, Content's file). The mixer edit alone left it playing (`red-on-a1.txt`). Fixed in engine.ts: in 1-1 the hint is
   marked heard at load. The stage data is unchanged, so no roll moves. The mixer line is removed as the packet asked.
2. "The NO picture is the coach's existing jump pose": the coach (CoachOverlay.tsx) draws a gesture glyph, not Pokey. NO uses the hero
   atlas's `jump_up` pose (already in the game). Polish note: arms up, it reads a little like a cheer.

## "Flick up and forward to jump." repeating: no source found in this build, so no file edited for it
- RealPlay, both settings, 6 to 12 put-backs at the chain: 0 extra (`red-on-a1.txt`).
- Browser at the chain, 4 runs: 0 or 1 time. The 1 was the first-run touch coach's jump step, said once.
- Browser, fresh save, coach on, 6 walk-offs at the coach's first jump spot: said once at 2.7 s, never again. That gap has ground: no
  put-back (`coach-first-gap.txt`).

## Done so far (all pushed; nothing below is waived)
- 1 PASS: helpLadder.test.ts, 10/10 with HelpOffer.test.ts; planted 4/6/9/13 (and each one alone) fails.
- 2 PASS at engine level (helpLadder11.test.ts, 3/3): Easy line at 3, pad tap rise 62 px before, 97 px at 5, steps at 8, then the whole piece on
  plain jumps (6 jumps, 4 grown: 3 steps + 1 pad); Normal line at 3, offer at 12 with the stage held, no, re-ask at 20, no, never again; yes grows the steps and the piece
  passes; steps in the draw list and gone on stop/restart; no stuckHelp, no "Too tall". Red on 41c2e248: 12 put-backs a setting, 0 help
  events. **The on-screen half (her bubble) fails, as above.**
- 3 PASS: `lockall --layouts 16 --intended 1-1 --check` against A1's lock (41c2e248): `lock: 102/102 stages unchanged` (1-1 too: no
  stage data moves; 1-2, 1-5 and World 8 byte-identical). seedlist 1-1 PASS (138 seeds). The ladder is null off 1-1 (engine.ts).
- 4: tsc clean; full suite, 3 shards on 41c2e248+A2's first commit: 927 ok, 0 fail. Not yet done: clipcheck route (planned: a
  NODE_ENV=development build only for the offer step, driving real put-backs through the dev-only `__engine`; prod dist grepped).
- Fixed in my own work after looking at the stills: the offer came up over the set-back's closed iris (a black stage behind it). It now
  waits until the iris is open and he stands. Stills (upright, dsf 1) in R-165.62/: `normal-port-12-offer.png` (stage visible
  behind; YES = Pokey on the stone that grows, NO = jump pose), `normal-port-12-after-back.png` (Escape = no: offer gone, no pause
  menu, nothing grown), `easy-port-08-step.png` / `easy-*-08-on-step.png` (the grown stone, stood on). `*-03-line.png` shows the
  blocker: her bubble still holds the stage's old double line, not the ladder's. The sideways Normal re-shoot hit a dev-server
  fetch flake and was not retaken.
