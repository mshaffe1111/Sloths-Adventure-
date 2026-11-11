# TASK R-165.62 (fix A2: help after put-backs in 1-1)   to: Engine   model: claude-opus-5-5   effort: high (R-165.91)   due: <date at dispatch + about 4 h>
## First, before any tool call
`git fetch origin main ccr-ca657d3c-n09zty t-engine-putback t-designer-reach t-r165-61-verdicts t-w11-analyst`. Read with
`git show origin/ccr-ca657d3c-n09zty:<path>`: reference/roles/README.md, reference/roles/ENGINE.md and its pack, reference/LAWS.md,
reference/LESSONS.md (D37: prove every engine-behaviour claim with a run), reference/ONE-ONE-FIX-PLAN.md ("The help schedule", its
amendment, and Matt's calls), reference/specs/help-lines.md (Dot's words, from the story keeper). Read with `git show
origin/t-designer-reach:reference/specs/help.md` (§4 and §5) and `git show origin/t-r165-61-verdicts:reference/architecture/PACKETS.md`
(section E2: your file list). Push back, suggest, go beyond inside your WRITE files.
## Objective
In gen2 stage 1-1, a player set back again and again at one piece gets help, by setting: on Easy it steps in by itself; on Normal it is
offered, may be ignored, and the stage never changes by itself. Build it on top of fix A1 (branch t-engine-putback@41c2e248, passed).
## Why it matters
With A1 no fall in 1-1 costs a life, so a player who can't clear a piece is set back with no end: in the window one Easy player was set
back 152 times in one piece over 22.5 minutes with no help (t-w11-analyst WINDOW.md §4). Matt chose to ship A1 and A2 together so that
loop never reaches a player without its help.
## Frozen inputs (do not change)
- The schedule (the lead's ruling, ONE-ONE-FIX-PLAN.md; where it differs from help.md §4, the ruling wins), put-backs counted per piece:
  | Put-backs in the piece | Easy (by itself) | Normal (offered) |
  |---|---|---|
  | 3 | Dot says the move the piece needs (help-lines.md) | the same |
  | 5 | quiet: a pad tap is a full jump at this piece, no words | nothing |
  | 8 | steps grow by themselves under EVERY rise and in EVERY gap of that piece that a plain jump can't clear (see below), kept for the run | nothing |
  | 12 | (past) | Dot offers the step; a yes grows them as Easy's do; after a no she asks once more 8 put-backs later, then never at that piece |
- The step (the lead's ruling, 11-11, on the packet Critic's run: s3747's w1-log-chain-rise has three rises, Easy 114 / Normal
  140-142 px, none cleared by a plain jump, so one step would leave the loop): at the rung, a step grows under every rise in the
  piece whose height a plain running jump does not clear, each step tall enough that the climb left on top of it is 60 px (step
  height = measured rise - 60, so the climb left is inside both settings' single-rise band), and a 60 px wide pad at the middle of
  every gap a plain jump does not clear. Heights come from the piece as laid (meta.pieces), never from a constant. The whole piece
  must then be passable to its exit with plain jumps only, flown.
- The count: per piece (the piece he was trying to reach when he fell). Reset by standing on the piece beyond, or the stage ending
  (cleared, left, restarted). NOT reset by a put-back, a pause, time, a refused offer or a step already given. Each rung fires once.
  COUNT ONLY in this packet: help.md §2's seconds triggers are NOT built (a later packet).
- The ghost that shows the move is CUT from this test link (both settings). Nothing past 1-1 changes: assist.ts, assist.test.ts and
  GameOverCard.tsx's offer are NOT edited (PACKETS.md E2: BLOCKED until help.md §5 passes); the ladder is off on every stage but 1-1.
- The grown step uses a platform sprite already in the game's World 1 atlas (no new art in this packet; Content may swap it later).
  It must look standable and be standable. 1-1 draws `paintedPlats`, a copy filtered at load (engine.ts:934), and `e.platforms` is
  the stage object's own array: so ONE engine method, addStep(), adds the step to the platforms AND to the draw list, never edits the
  stage definition a later roll reads, and every grown step is cleared on stage end and on restart.
- The yes and no of Normal's offer work as pictures for a player who can't read (help-lines.md says what they show), tap targets at
  least 44 px and inside the phone's insets, upright and sideways (clipcheck rules; PLAY-STORE-RULES §6 for a new pop-up).
- Dot's words are help-lines.md, word for word, with its two story guards. Her existing "Flick up and forward to jump." stops
  repeating after set-backs (help-lines.md §4): teach once, silent until the line at 3, silent again until the step or the offer.
- The YES picture is Pokey on the same sprite the grown step uses; the NO picture is the coach's existing jump pose. Both drawn from
  sprites already in the game (no new art).
- Logging: use the existing `recorder.event(what, detail)` (playRecorder.ts:395; ONE detail string) with `help` detail
  "<rung> <pieceKey> <count> <E|N>" and `helpOffer` detail "<shown|yes|no> <pieceKey> <count>". Do NOT change playRecorder.ts's shape (E1 owns it); LOG_EVENTS.md gets the two new rows.
- RealPlay stubs loseLife (realPlay.ts:141); 1-1 now sets back instead of dying (A1). Any test of the ladder drives real put-backs.
- Frame budget: design to 8 ms of our own work per frame; the ladder adds no per-frame scan beyond one integer check per put-back.
- New replaces old: in 1-1 StuckWatch never speaks (its line "Too tall for one jump!" (stuckHelper.ts:52) breaks story guard 1);
  the ladder's line at 3 replaces it there. Outside 1-1 StuckWatch is unchanged.
- The pad seam: helpLadder exports padFullJump() (true at Easy's rung 5 for the piece he is at); padControl reads it at :142 and :197
  and passes no hold (a tap with hold undefined rises 97 px, measured), so the touch path is untouched.
- The offer pauses the stage while it shows; Back means no (PLAY-STORE-RULES §6).
- In 1-1 Dot's "No soft moss up here!" (mixer/stages.ts:76) no longer plays: since A1 every fall in 1-1 is soft, so the line is false.
## Files
- READ: the files above; src/game/engine.ts (the softFall path A1 uses), src/game/stuckHelper.ts, src/game/padControl.ts
  (PAD_HOP_MS:115, :142, :197), src/game/dotGuide*.ts and DotGuide.tsx, src/game/realPlay.ts, the gen2 1-1 tests.
- WRITE (PACKETS.md E2, minus the BLOCKED part): NEW src/game/helpLadder.ts (+ helpLadder.test.ts), NEW src/components/HelpOffer.tsx
  (+ its test), src/game/stuckHelper.ts, src/game/padControl.ts, src/game/engine.ts (softFall at :4996 calls the ladder; addStep()),
  src/game/mixer/stages.ts (the one 1-1 line above), the ONE file a flight shows is the source of the repeating "Flick up and forward
  to jump." (count those lines over 5 put-backs first; the coach ends after one jump, touchCoach.ts:149-153; the candidates are
  dotGuideHelp.ts, DotGuide.tsx and the gen2 w1.ts teach table: edit only the one the flight names), tools/perf/clipcheck.mjs (the
  route to HelpOffer), tools/playtesters/LOG_EVENTS.md (two rows), tests beside each file, reference/handoffs/engine-core.md.
## Definition of done (the Critic checks each)
1. helpLadder.test.ts: for each setting, a scripted run of put-backs at one piece fires each rung at exactly its count, once, and
   nothing else; the count resets past the piece and on a stage end, and not on a refused offer or a pause. Its red: the same test with
   the thresholds planted off by one (4/6/9/13) fails, shown.
2. A realPlay flight on 1-1 (seed 3747, w1-log-chain-rise), running real put-backs: Easy, Dot's move line at 3, the pad tap is a full
   jump at 5 (the hop height read before and after), the steps grow at 8 and Pokey then passes the WHOLE piece to its exit with plain
   jumps only; its red: the same flight on t-engine-putback@41c2e248 shows 0 `help` events after 12 put-backs. Also: StuckWatch says
   nothing in 1-1, and "Flick up and forward to jump." plays at most once per piece; Normal,
   the line at 3, the offer at 12 (the stage paused; Back = no), "no" grows nothing, the re-ask at 20, a second "no" never asks again;
   a "yes" grows the steps and the piece is then passed with plain jumps. A spy on the draw list shows each grown step drawn, and gone
   after a restart.
3. Nothing moved outside 1-1: 1-2, 1-5 and one World 8 Normal stage build byte-identical to t-engine-putback, and the ladder never
   fires there. A1's tests stay green.
4. `npx tsc --noEmit -p .` clean; the tests you touched and src/game/gen2/*.test.ts green; `npx tsx tools/engine/seedlist.ts 1-1
   --check` green; `node tools/perf/clipcheck.mjs` covers HelpOffer upright and sideways and passes. Its route to the offer is real put-backs in the
   built game, or a flag that exists only in non-production builds: prove the production bundle does not contain it (grep dist/).
5. Polish check (LAWS 1): stills, upright and sideways, of Dot's line at 3, the grown step at 8 on Easy, and Normal's offer at 12 with
   its pictures. Name anything rough.
6. The story keeper's review (session_019iachLiuwNTAZUBSJWUmR3): the lead sends it the built lines and pictures; its OK counts
   before the Critic's PASS (TEAM.md). Show the lines in a still each.
7. The turnover note rewritten.
## Return
Branch t-engine-help from t-engine-putback@41c2e248 (it builds on A1), pushed (git ls-remote). REPORT.md with "Method used" and
"Lessons applied" first, then the 7 sections of roles/README.md, 60 lines or fewer. Then ONE send_message to the lead, 10 lines or
fewer. Then stop.
## Attempt
1
