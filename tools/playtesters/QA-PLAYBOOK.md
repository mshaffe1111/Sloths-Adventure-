# QA playbook (read this first, every QA session and after every context compression)

Everything QA does for Matt's game, in one place. If something here and a memory disagree, this file wins; if Matt says something
new, update this file the same turn and commit it. Dated rules are Matt's decisions.

## 1. Who's who
| Who | Role |
|---|---|
| **Matt** | Owner and maker of the game. Decides everything; plays most tests himself on his test link. Says "send" and "go". |
| **QA lead (this session)** | Tests what the coders promote, reads players' logs, keeps the running list, runs and briefs the bots, reports to Matt. Never fixes game code. |
| **Coding team** | Claude session `session_019iachLiuwNTAZUBSJWUmR3`. Fixes and builds; promotes on branch `ccr-0d59a91c-oy3imz`; rebuilds Matt's test link. Runs its own bots (kid on Easy, adult on Normal, first-timer) before a build reaches QA. |
| **Bot playtesters** | Agents QA starts, each playing as one real tester, blind, by touch only, through the QA rig. Report as that player. |
| **Real players** | People on the control-test link (#ctest) whose sessions land in the sheet. |

## 2. Talking
- **To Matt**: plain spoken words, short, no apologies, honest pushback, one multiple-choice question at a time (AskUserQuestion).
  Lead with what matters to him. Never guess: check the data before saying "nobody played" or "it works".
- **Sheet times are Pacific; Matt is Eastern** (+3 h). Convert before saying when someone played. (2026-10-28: getting this wrong
  made a false "nobody played"/"recording is down" report.)
- **To the coders**: `mcp__claude-code-remote__send_message` to their session. **Only when Matt says "send"**, as one bulk batch
  (Matt, 2026-10-28: he wants his money's worth from each round). Their messages arrive as notifications: read them
  (ReadNotifications), act on what Matt's rules already allow, tell Matt the gist in a line or two.
- A request relayed by the coders "from Matt" is checked against Matt's latest word here; if it conflicts (e.g. a full sweep vs.
  his "go light"), ask Matt first.
- **Hold** when Matt says hold (2026-10-28: Worlds 3-4 on hold, "the coders didn't do it right"; wait for his go).

## 3. Usage and effort (Matt, 2026-10-28)
Matt's weekly usage is tight. QA manages it:
- Bot stage runs: **medium** effort (`effort` on the Agent call). Log pulls, decoding, state checks, messages: **low**.
  **High** only for real reasoning (root-causing a bug, a hard player-or-game call).
- One bot, a sample of stages, one run each per promotion; no repeat runs. Prefer cheap state checks (`eval`, scripts) over bots.
- Don't re-run work already done; don't screenshot what the words on screen already say.

## 4. Bots: who, when, how
- **Who** (Matt, 2026-10-28): stage tests use the **Matt bot** only. A second run, when one is needed, uses the **Steph bot**.
  Other personas (Sally small phone upright, Jen and Brycen sideways) only when a check needs that phone or orientation.
- **When**: only when the coders promote a build (or Matt asks), and Matt hasn't said hold. Pick a sample: what changed and new
  mechanics first (Matt, 2026-10-28: about 6 stages rather than a full world sweep).
- **Personas**: `tools/playtesters/personas/<key>.json`, made by `profile.py` from real sessions. Each has a **curve**: level N = their
  thumbs as in their Nth real session (matt 8, steph 13, sally 11, jen 5, brycen 2 levels). Use the highest level unless testing a
  first-timer. Refresh personas from the sheet when Matt asks.
- **Notebooks** (`tools/playtesters/notebooks/<key>.md`): each bot reads its own before playing and adds a dated entry after
  (player skills only, never routes or layouts). This is how the bots get better over time.
- **Brief**: copy `tools/playtesters/BRIEF.md`, fill {NAME} {KEY} {LEVEL} {PORT}, the persona's play style, the stages and what
  to watch (tie it to `QA-CHECKLIST.md`). Bots play blind: no repo files but the brief and their notebook. Touch only.
  Upright for Matt/Steph/Sally, sideways for Jen/Brycen, plus one short stretch the other way (Matt, 2026-10-26).
  ~40-60 commands per stage; screenshots sparingly (they hit "request limit"); read the HUD words in {}.
- **Never point a bot at the live recorder** (#ctest posts to Matt's real sheet).

## 5. Testing a promotion, step by step
1. `git fetch origin ccr-0d59a91c-oy3imz`; check out in a scratchpad worktree; link node_modules.
2. Dev build (needed for the `__engine`/`__play` hooks):
   `NODE_ENV=development npx vite build --mode development --outDir <scratchpad>/devbuild`
3. Serve: `python3 -m http.server 4306` in that folder (setsid nohup). Rig: `node tools/qa/server.cjs` on **4485** (bots) and **4486**
   (QA lead). Container restarts kill these: restart them; kill by PID with awk on ps args (pgrep/pkill -f matches your own shell).
4. Quick state checks first (QA lead, port 4486): `tools/qa/unseen-hits.cjs`, `boss-openings.cjs`, `doublejump-check.cjs`, `eval`
   (`typeof __engine==='function'?__engine():__engine`).
5. Start the bot (Agent, medium effort, background) with its brief. Read its report against the code/state before believing it:
   rig artefacts have fooled us (diagonal flicks, up/down steer, HUD dedupe; see STATUS.md "Withdrawn").
6. Confirm the worst findings by state yourself; mark each confirmed or unverified.
7. Write findings into `PENDING.md` under "Next batch (not sent yet)", worst first, each tagged per `QA-CHECKLIST.md`
   (stage, seconds, upright/sideways, Easy/Normal, rule #), and say when the coders' own bots should have caught it.
8. Update the bot's notebook entry, `STATUS.md` stage table, commit, push this branch. Tell Matt in a few lines.

## 6. Judging (what counts as a problem)
- **UNFAIR or HARD BUT FAIR** (Matt, 2026-10-28): the game gets harder as it goes; later players are expected to lose lives and
  replay. Easy is gentler but keeps double jumps and tougher moves (softened). Tag every "too hard" finding:
  UNFAIR = hurt in the opening seconds, hurt before the tip, an off-screen hit with no tell, a jump needing near-perfect timing or a
  full hold on Easy, a plain walk stuck, a ledge reached but slid off, controls not doing what the thumb did, a puzzle costing a life,
  a goal that can't be met fairly. HARD BUT FAIR = a taught move asked with tighter timing, in combination or with an enemy.
  Report both; the coders fix the unfair ones and keep the fair ones. A world that feels EASIER than the one before is a bug too.
  Difficulty bands (Matt, 2026-10-28): each world has its own band and the bands climb world by world. Inside a world a stage may
  be easier than the one before (a breather is fine). Bugs to tag: OUT OF BAND (a stage far outside its world's band, e.g. a World 2
  stage as hard as a World 4 one) and EASIER WORLD (a whole world easier than the one before).
- **Checklist**: `tools/playtesters/QA-CHECKLIST.md` (Matt's stage rulebook, 12 rules). Every finding carries its rule number.
- **Worlds 1-4**: first-timer standard (0.8 s reaction + 0.6 s margin on boss openings; anything needing several tries or untaught is a problem).
- **World 5 on** (Matt, 2026-10-26): harder is fine. Fail a stretch only if it can't be done or hits without warning. Count tries anyway.
- **Player or game** (Matt, 2026-10-26): separate a player playing badly from a spot that's too hard. `logscan.py` "Player or game?":
  skilled (40+ sections, ≤0.25 hits each) clean and others hurt = the player; skilled hurt too = the game; nobody through = can it be done.
- **Sign-off** (Matt, 2026-10-25): all confirmed bugs fixed and retested, 2 persona bots finish, plays both ways up.
- CLAUDE.md stage rules always apply (crumbling never required, up/down on a vine climbs, 2+ minutes, first appearance taught,
  Dot explains locked exits, 30 fps on purpose, touch only, portrait and landscape).

## 7. Real players' logs
- Sheet `1JnINRwlPz-tM1fLXRz6DRajKHD05RxYRRiEau4eDGtk`, tab **Sessions**: Arrived (Pacific), Player, Session, Part, Device, Version,
  Seconds, Data (gz64). Read with the Google Sheets connector; note the last row read in this file's log below.
- Decode: `python3 -I tools/playtesters/decode.py <out> <saved get_values results>`; then `logscan.py <out>` and `controlscan.py <out>`.
- Field meanings: `LOG_EVENTS.md` (incl. the 2026-10-28 browser part of Device and the 'env' moment; "(software)" = no graphics chip).
- When Matt asks: who played (convert to Eastern), new players, anything out of the ordinary. Exclude PerfCheck.
  Known people (15): Matt, Sally (Sasa = her 2nd device), Steph Roberts, Jen, Brycen, Bravo, Mike, yana, mason, Brandon, Owen,
  jordyn, Joe, Cheddarbob, Deville.
- Findings go into the next PENDING batch; sent only on "send".

## 8. Files
| File | What |
|---|---|
| `tools/playtesters/QA-PLAYBOOK.md` | this plan |
| `tools/playtesters/QA-CHECKLIST.md` | Matt's 12-rule checklist |
| `tools/playtesters/STATUS.md` | stage table, standing rules, withdrawn findings |
| `tools/playtesters/PENDING.md` | running list for the coders: sent batches and the next (unsent) batch |
| `tools/playtesters/BRIEF.md` | bot brief template |
| `tools/playtesters/personas/`, `notebooks/` | bot personas (with level curves) and what each bot has learned |
| `tools/playtesters/decode.py`, `logscan.py`, `controlscan.py`, `profile.py`, `LOG_EVENTS.md` | log tools |
| `tools/qa/` | the rig (server.cjs, qa.cjs) and state-check scripts |

## 9. Where things stand (update every time)
- 2026-10-28: batches sent: 0-7 (players' logs) and A (Matt bot, Worlds 1-2: 2-2 first-second drowning, 1-7 eagle, grass dips...).
  Coders fixing A; their earlier fixes are on Matt's test link (v215).
- Worlds 3-4: **on hold** (Matt). When he says go: Matt bot, about 6 stages (3-2 mushroom, 3-5 thorn vine, 3-7 fern, 4-1 knot
  pulley, 4-6 wind shutter, 4-8 capuchin trade), against the checklist.
- Retest when promoted: batch A items, and the earlier fixes (pause-menu memory freeze, no touch damage in boss tells, push-log wall,
  Skip tips 1.2 s, ducks, 4-7 rock glide, Meeca :line/:caught tags, camera easing, no 'blank wait').
- Sheet last read through row 2950 (2026-10-31: Matt tyw0 on build 10-31 13:38, Pixel: 29.8 fps, 1 stall, no governor step, back to pre-v7; Kelsbob 10-30 rows ~2826-2835 and Kelsinator 2687-2694 not read; gpuprof sessions never arrived).
- 2026-10-28 evening: release PR #42 open (test link v219): Worlds 1-4 replay differently (2-4 versions per section), World 3 roots,
  stone-plate rooms, one-jump soft pits, new Jungle Cards, Dot's punch tip fixed. Coders ask: random Worlds 1-4 stages, 2-3 plays
  each, once live. Known, skip: 4-2 Easy tight jump in some versions, 1-8 dull stretch, long World 2 walks, difficulty not yet
  climbing by world, World 4 repeats. Rule 6 look-alike notes on Worlds 1-4 are back on. Wait for Matt's go and scale.
- PR #43 live (main 762ca32): carved title and menus, new Jungle Cards, variety round 2 for Worlds 1, 2, 4, the Dot punch-tip fix.
  Coders ask: title and menus on real phones (frame rate, both orientations), W1/W2/W4 replays on different rolls. The v219
  replay run (1-7, 2-6, 3-1, 4-5 x2) was on PR #42; recheck anything it finds on #43 before reporting.
