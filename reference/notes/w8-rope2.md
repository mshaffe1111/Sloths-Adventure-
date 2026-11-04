# w8-rope2 notes (helper; branch w8-rope2 only)

Updated: 2026-11-04 08:00 ET. Base: origin/ccr-0d59a91c-oy3imz at 4d458021.

## The job now: R-159.1, the combat triangle for World 1 (lead brief, 2026-11-04)
- Stomp vaults and bounces higher (hold jump) over pits; punch stuns (~1.5 s) and knocks back shots; kick breaks shields/armour and sends
  an enemy rolling into others or a switch. One readable trick per World 1 species with a ~0.5 s warning, tied to platform roles; ~1/3
  of each stage enemy-free; no enemy within 150 px of a landing. Easy stays a cruise; Normal bites (STAGE-RULES §0.5).
- **Plan first.** No game code until the plan is approved AND GPU stage 0 is merged into the lead branch; then I hold engine.ts (order:
  R-159.1, then R-160.1). Merge the latest base before starting and before every push.
- Plan (one page) goes to the quality supervisor (session_01FhBbYNn4i5tFfFZiFroKoi) AND the lead. Show-first: a mock-up clip or stills of
  the new moves before building them in. HF art: a picture list for Matt with cost; no spend without his approval ($72 left in all).
- Method: none exists for enemies. I write reference/methods/enemies.md.
- Status (2026-11-04 09:30 ET): plan revision 4 (kick taught in 1-5, the lead's call); show-first round 3 done: one escalation board per stage (1-3, 1-4, 1-5, 1-6, 1-8, 1-9), upright and sideways. Picture list and vine-snake choice with Matt. Code waits for GPU stage 0.
- Mock lessons (round 3): a real move stepped through the engine needs Pokey truly standing (snap to the platform) and no other animal near, and the camera's y held, or it becomes an air kick or a drifting frame; paste-ups go at screen points the shot records, never at guessed fractions; hold lianas still before pasting on them.
- Lead, 11-04: put a "Polish check" section in every report; World 1 bot runs with rescues don't count until R-150.7 (mushroom walls).

## Facts checked in code (2026-11-04)
- engine.ts ~4170-4178: a kick doubles the score (`* (kick ? 2 : 1)`) and the burst; `airKick` sets vy -420 (bounces him up). Melee
  results already carry `armored` ("TOUGH!") and `interrupt` (staggerPredator). Stomps: resolveStomps / stompTest / stompChain.
- World 1's animals (validator mechanics-world1.md): snakes (1-3, 1-5, 1-6, 1-8, 1-9), boas and a snake ring (1-9), eagle (1-7),
  little snakes in the Venom Fang fight. Every snake today is a roadblock answered by one punch (world1-baseline.md).

## Pitfalls I have paid for (and how I avoid them)
- Trusting a bot's numbers (Nov 1: the old first-timer's hops made a bloom "fix" look needed). Watch the bot move before using it.
- A fix right for one world can be wrong in another (the rope catch caught him on lower ropes in climbs). Run every stage with the
  changed thing before and after.
- Changing a shared section re-curates every stage that draws it (8-5). List every user of a piece before changing it.
- Times and ids are pasted from a command, never typed (I gave the lead a wrong commit prefix on Nov 1).
- Never force-push: w8-rope2 is reset to the lead branch only when the old work is already in it (a fast-forward), as on 11-04.
- Lead (2026-11-04 ~09:56 ET): ACCEPTED vine-hang s65-7 and boa-ball s60-7. Watch: s65-7's straight left edge must always sit against the liana and never show (flipped too, and through every clip frame); check the clips for it. Draw the vine snake ~20% larger sideways.
- HF APPROVALS (both relayed by the lead, verbatim in its messages):
  - Combat picture list (plan §Art, ~$2.32): "MATT APPROVED the R-159.1 picture list (Nov 4, ~9:05 AM ET): about $2.32, cap $4.00 including
    redos, with the vine snake option (a)" (lead message queued 14:22:59Z). The list is the plan's Art section, revision 3 at eabf7e88.
  - Pit list (~$0.88): "MATT APPROVED the pit list (Nov 4 ~9:50 AM ET) ... about $0.88, cap $1.40" (lead message queued 14:50:29Z);
    the list is PIT-LIST.md at 6944e22c. Combined cap $5.40.
  - Spend, measured per job from HF's created/finished times x $2.75/h (jobs.txt): $0.74 finished + the two vine-clip jobs running.
- Build round 1 (2026-11-04 ~10:40 ET, d5763d45): w1Tricks.ts (rules) + w1TrickDraw.ts (stars, glint, coil squeeze, roll turn), hooks in engine.ts (hitEnemy trickBlow, stomp bounce, roll bowling, tagWorld1 at load) and predatorAI.ts (lunge tell 0.5/0.8, boa 'roll'/'rolled'); tests w1Tricks(.test, Play.test).
- LESSON (self-caught): in mock-triangle.mjs Pokey's y is his FEET (RealPlay.stand puts y on the platform top); I had set y = top - height, so he fell and stomped (a "kill" on the first real stun shot, the "hop" in older kick boards). Check a stepped beat's start pose against the engine's own convention.
- Dev builds: the PWA step errors (dev bundle > 2 MiB) after "built in"; the page files are written and serve fine. Prod `npx vite build` must still pass at the gate.
- Next: painted ball + vine art cut-in; the vine snake (stiff liana in code); switch + 1-5 stump payoff; World 1 placements (1-3 cut); pits art; proofs; gates.
- Redo round (2026-11-04 ~12:50 ET): the QS's mash check (REDO x2) + the lead's stun (a). 18512458 rules: boa harmed only by a kick (any state; mid-attack punch = stagger back to coil; stomp always bounces; mega rolls it); dazed lunge snake ignores every blow, stomp finishes; a kick on an awake one dazes too (flagged). Mash tests. c4af0ca6 art cut in (ball + vine frames atlas). e3592a3f vine snake (tell 230 px, bite on grab, any blow stiffens, stiff liana straight + climbable). c0ddd3a0 evidence (clip-2 mash+stomp, botrec 1-9 boa mash).
- LESSON: botrec replays Pokey's fields only; other animals run their own AI in the browser, so a replay can drift from the logged run (1-3 27 s: snake 60 px off, no daze shown). Prove a rule with the headless log or a stepped clip; use botrec for feel, not for hit-by-hit proof.
- Waiting on the lead: teach the first-timer bot stomp/kick from Dot's words (shared measure); 1-3 wording + counts; 1-9 goal. Then placements (1-3 cut, vault spots, 1-5 kick teach + stump cache, 1-6/1-8 vine snakes, 1-9 master + switch), pits art, proofs.
- SLIP (2026-11-04 ~12:55 ET), a repeat of the Nov 1 lesson: two commit ids typed by hand in messages to the lead ("a7c...", then "ae8a8d7c"; the real one 0a9e74a3). Countermeasure (standard work from now): a message that names a commit carries the id copied from a `git log --oneline -1` printed in the same turn, the whole line pasted; never an id written from memory.
- LEAD'S MECHANISM (2026-11-04, replaces my countermeasure above): no commit ids in messages at all. Say what was pushed and to which
  branch; the lead and supervisors read ids from git.
- Matt's lines (2026-11-04, via the lead): 1-3 tip "Punch to daze it, then hop on it!" and 1-9 opening "A coiled boa! Punches bounce
  off. Kick it!" are in (dotLinesData new text). The vault line "Stomp it and hold jump to fly across!" FAILS dotLines.test.ts's
  touch-words gate ("hold jump" is listed as a keyboard phrase). It's not in; touch options were sent to the lead. LESSON: run the Dot
  line gates on a proposed line BEFORE it goes to Matt, not after he approves it.
- Bot defect found, reported to bot-fix (theirs to fix): thumbify() re-arms "late lift-off" every frame (lastSteer is never updated on
  the release early-return), so an intend() of {} never stops him. The kid can't stop by easing off. My trick moves time the kick and
  hop for a walking thumb, so they hold either way.
- Test-setup LESSON: the kid only starts looking after who.look (1.2 s). A bare-world case needs its animal far enough down the way
  (x 1000 from a start at 300), or the kid "doesn't react" for a reason that isn't the rule under test.
- Taught-bot counts (after the line merge, Worlds 1-10 baseline): 1-3 adult 2/5/7 of 6-8, kid 0 of 3-4 (kid 0 before too); 1-9 adult
  19-20 of 23, kid 5-7 of 10, but 1-9 adds "water" x3 every roll: masterStretch's real-drop vault, untaught until the vault line lands.
  Goals SNAKE_GOAL_13 / GUARD_GOAL_19 wait for the vault line + the bot's vault, then are set from its runs.
- DEFERRED to tomorrow (the lead, 2026-11-04 ~1:00 PM ET, budget): 1-9's master-stretch rework, the 1-5 kick-teach piece for
  fix-petals, and the vine snakes in 1-6/1-8. Tonight it's only R-159.1 (to accepted) and the 1-3 rebuild. Keep reports short.
- SLIP (2026-11-04, caught by the lead): I wrote "~5:00 PM ET" to the lead from a feel of elapsed time; `date` said 2:00 PM ET.
  Countermeasure (D20, standard work now): a message that names a time runs `TZ=America/New_York date` in the same step and pastes it.
- 1-3 rebuild (2026-11-04): 7 nodes on beatTrace, rolled ramp/climax; the validator learned N/O/Y and rhythm-token repeats; goals from
  the fixed bot (1-3 Normal 10, Easy 4; 1-9 Normal 11, Easy 8, the lead: one rule). The fun gate is judged on the lead's combined 1-1..1-5
  candidate, since w1-rhythm-b's levelCheck double rule re-reads 1-1/1-2/1-4/1-5.
- To do: merge origin/w1-rhythm (flagsInOrder) before my next engine.ts push; plug 1-3 into w1-rhythm's layout-distance hook when named.
- DEFECT (2026-11-04, found proving Matt's goal band per road): 1-3's ramp laid one long soft pit under a whole run of branches, a floor
  to walk along under every snake on them. The route took it, the fixed adult bot followed it and left 4-8 snakes, so the 75% goal was
  out of reach. 5 Whys: the snakes were off the way -> the way ran under the branches -> the pit floor ran the whole node -> traced()
  laid one pit from bank to bank unless only stumps stood between -> nothing checked what lies under a snake's branch. Countermeasure
  (a test first): stage13.test.ts "no snake on a branch ... stands over a pit floor" (fails on the old layout, seed 1 at 5144); the fix:
  a pit under each gap alone, ground under every stump and branch. Spread: 1-9's finish had the same shape (snakeBranches over one
  pit); its snakes moved onto the way. Other stages with snakeBranches: not changed tonight, named in the report.
- Bot fixes found on the way (the fixed adult first-timer): he punched a waiting snake from 100 px (out of reach) for seconds; now he
  walks into a punch's reach (72 px) unless it is rearing or striking at him. A hop onto a dazed snake at a run carried him past it; now
  his thumb steers the fall onto it, as at the vault. 5-9's kid runs moved (median still 10, goal unchanged; KID_RUNS_59 re-recorded).
- 1-3's sleeper sat 1 s past Dot's line, so a first-timer was on it before taking the line in (heed 0.9 s); it lies further along now.
