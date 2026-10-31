# Every Pokey move: frames today, how it looks, what it needs (2026-10-30, after pokey-anim @ 40fab0f)

Ranked by how often a player sees it (my estimate from the stages: seconds on screen per minute of play). "Video" = cut from a Wan clip
(heroClips), "painted" = Matt's standard sheets, "code" = turned or squashed by code.

| # | Move | Frames today | How it looks | Needs (best first) |
|---|---|---|---|---|
| 1 | Run | 15 video (move-run), footsteps keyed 4/9/13 | Smooth, on model. Good. | Nothing. Leave it. |
| 2 | Jump (single) | painted take-off + 10 video (new tonight), picked by vertical speed | Fluid arc, arms up. The fall keeps his arms up; no arms-out "catch" before landing | Maybe 2 painted fall frames with arms out for the last ~0.15 s (small) |
| 3 | Standing / idle | idle + blink painted, breathing bob; 5 idle clips (49 frames each) after 4 s | Good | Nothing |
| 4 | Landing | land/recover painted, 3 on a hard drop (new) | Good; the engine's own landing dust is very big next to him | Smaller landing dust (engine.ts, needs an owner) |
| 5 | Turn / skid / run start | new tonight: front-view turn, painted brace skid + 2 puffs, lean | Crisp, physics unchanged | Nothing |
| 6 | Walk | 17 video (new tonight, seamless loop) | Only seen for a frame or two as he speeds up or slows down, and in the sleepy fog: there is no slow steer (my first ranking was wrong) | Nothing |
| 7 | Double jump flip | painted roll, 5 poses + up to ~80 degrees of code turn (new) | Reads as a forward roll; still a little code-spun | Wan can't roll him (2 seeds failed). A Qwen-Edit pass on his tuck at 90 and 270 degrees would close the gaps |
| 8 | Punch combo (jab, cross, hook) | 6 / 7 / 7 video | Snappy reach (good); the jab's way back popped to a twisted pose, fixed tonight by reordering its own frames | 4 Wan punches failed tonight (off-model wraps, lost face, back turned). A cross/hook-matched re-roll from the cross's own frame as the start |
| 9 | Climb (trunk, vine) | 21 video (new tonight), hugging the trunk; down plays it backward | Smooth | A top-out settle (no clip yet); a real climb-down (the Wan try hardly moved) |
| 10 | Kick (two kicks take turns) | 10 + 10 video | Good | Nothing |
| 11 | Hurt | 3 painted + the 41-frame "ouch" clip when standing | Good | Nothing |
| 12 | Vine swing | 3 painted (still, forward, back), the real vine | Swaps poses at the ends of the swing | A video swing (the move-swing slot exists, never filled) |
| 13 | Rope shimmy | 7 painted hand-over-hand (Gemini, rope painted out) | The hands jump between cells; the 2026-10-28 shot Matt called awful predates these cells | **2 more Wan tries failed tonight (no rope in the picture). Next: the game's rope drawn into the start and cut back out, or Qwen-Edit in-betweens** |
| 14 | Duck | duck painted, half crouch in and out (new) | Good | Nothing |
| 15 | Air punch / air kick | 3 + 3 painted | Fine | Nothing |
| 16 | Stomp dive, bounce, spring | 2 + 3 + 3 painted | Fine | Nothing |
| 17 | Mega punch | 16 video | Good | The new charge-and-release glow pose (CT-31, Build 4) |
| 18 | Push (1-6 log) | 49 video | Good | Nothing |
| 19 | Swim (World 6) | Matt's tread/under sheets + 2 clip loops | Not checked tonight | Check when World 6 is played |
| 20 | Ledge teeter / step back | 10 + 16 video | Good | Nothing |
| 21 | Cheer, knocked out | 30 video / 1 painted | Fine | Nothing |
| 22 | Slide (7-4) | none for Pokey yet | n/a | A belly-dive slide clip is on file (pa-slide-s3, a clean loop) if 7-4 wants it |

**My order for tomorrow:** the rope shimmy (Matt's own complaint; Wan has now failed it 9 times, so a different route: Qwen-Edit in-betweens
of his 7 cells, or a 12-cell sheet), then a cross/hook-matched punch re-roll, a top-out settle for the climb, the flip's last gaps and the vine swing.
