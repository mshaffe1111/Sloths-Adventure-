# Every Pokey move: frames today, how it looks, what it needs (2026-10-30, after pokey-anim @ 40fab0f)

Ranked by how often a player sees it (my estimate from the stages: seconds on screen per minute of play). "Video" = cut from a Wan clip
(heroClips), "painted" = Matt's standard sheets, "code" = turned or squashed by code.

| # | Move | Frames today | How it looks | Needs (best first) |
|---|---|---|---|---|
| 1 | Run | 15 video (move-run), footsteps keyed 4/9/13 | Smooth, on model. Good. | Nothing. Leave it. |
| 2 | Jump (single) | 13 video (new tonight), picked by vertical speed | Fluid arc, arms up. The fall keeps his arms up; no arms-out "catch" before landing | Maybe 2 painted fall frames with arms out for the last ~0.15 s (small) |
| 3 | Standing / idle | idle + blink painted, breathing bob; 5 idle clips (49 frames each) after 4 s | Good | Nothing |
| 4 | Landing | land/recover painted, 3 on a hard drop (new) | Good; the engine's own landing dust is very big next to him | Smaller landing dust (engine.ts, needs an owner) |
| 5 | Turn / skid / run start | new tonight: front-view turn, painted brace skid + 2 puffs, lean | Crisp, physics unchanged | Nothing |
| 6 | Walk (slow steer) | 8 painted (standard sheet, second take) | Steppy next to the 15-frame video run; visible on every gentle steer | **A video walk (the move-walk slot exists, never filled): one Wan job, ~$0.50** |
| 7 | Double jump flip | painted roll, 5 poses + up to ~80 degrees of code turn (new) | Reads as a forward roll; still a little code-spun | Wan can't roll him (2 seeds failed). A Qwen-Edit pass on his tuck at 90 and 270 degrees would close the gaps |
| 8 | Punch combo (jab, cross, hook) | 6 / 7 / 7 video | Fine but short; the jab wind-up is 1-2 frames, so it pops | Re-cut from a longer clip with a held wind-up and recover (frames exist in a-punch-2) |
| 9 | Climb (trunk, vine) | 8 painted (first-round sheet), one frame per 12 px; climb-down plays the same cycle backward | Choppy at speed, no settle at the top | **A video climb (the move-climb slot exists, never filled); a top-out settle.** Don't touch climb physics (build1-play) |
| 10 | Kick (two kicks take turns) | 10 + 10 video | Good | Nothing |
| 11 | Hurt | 3 painted + the 41-frame "ouch" clip when standing | Good | Nothing |
| 12 | Vine swing | 3 painted (still, forward, back), the real vine | Swaps poses at the ends of the swing | A video swing (the move-swing slot exists, never filled) |
| 13 | Rope shimmy | 7 painted hand-over-hand (Gemini, rope painted out) | Matt called it awful (qa-notes/rope-traverse-2026-10-28.png): the hands jump between frames | **Wan in-betweens failed before (rope/jobs.txt). Re-roll from the 7 cells with the last frame pinned, or a 12-frame redraw** |
| 14 | Duck | duck painted, half crouch in and out (new) | Good | Nothing |
| 15 | Air punch / air kick | 3 + 3 painted | Fine | Nothing |
| 16 | Stomp dive, bounce, spring | 2 + 3 + 3 painted | Fine | Nothing |
| 17 | Mega punch | 16 video | Good | The new charge-and-release glow pose (CT-31, Build 4) |
| 18 | Push (1-6 log) | 49 video | Good | Nothing |
| 19 | Swim (World 6) | Matt's tread/under sheets + 2 clip loops | Not checked tonight | Check when World 6 is played |
| 20 | Ledge teeter / step back | 10 + 16 video | Good | Nothing |
| 21 | Cheer, knocked out | 30 video / 1 painted | Fine | Nothing |
| 22 | Slide (7-4) | none for Pokey yet | n/a | A belly-dive slide clip is on file (pa-slide-s3, a clean loop) if 7-4 wants it |

**My order for tomorrow:** the walk (seen constantly, cheap, the slot is ready), then the rope shimmy (Matt's own complaint), then the
climb, then the punch wind-ups. The flip's last gaps and the vine swing after those.
