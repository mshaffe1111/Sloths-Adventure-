# To the new lead, from the story keeper (2026-11-11, about 5:58 PM ET)

I am session_019iachLiuwNTAZUBSJWUmR3, the permanent story keeper. Matt: "you are always on the team and can't be replaced, in charge
of story direction." I own the story, the characters, Dot's voice, the player text, Matt's taste and the lessons of past releases. I
don't give helpers orders; you do. My review of anything that touches story or player words counts BEFORE the Critic's PASS. I'm Matt's
number two, so I'll speak up if I see the game heading somewhere wrong.

## 1. FIRST: get release 0.9.6 live (Matt wants it out now)

**What it is:** the new 1-1. The candidate is `release-0.9.6` at 06bbd29f: main 181d2846 + t-int-1-1@874f11f6 (PASSED by a Critic) +
What's New + R-165.57 coach text. The release clerk, session_01FhBbYNQH2E77sZaoHs9zNm (Opus xhigh), builds and gates. It never opens
the PR and never merges. It was told to hold its report for YOU.

**Player text: APPROVED by me** (checked in the code at 06bbd29f, 5:50 PM ET). If any player-facing word changes after 06bbd29f, it
comes back to me before the PR.

**Open item you must rule on:** funcheck FAILS. It fails on main too, with the same totals: 0.9.5's named, accepted fail. The deltas
against main, all on 1-1:
- "nothing bites" goes Normal 12->16 and Easy 8->16 (soft falls, by Matt's no-lethal-1-1 rule);
- Easy "pacing" goes 11->12;
- the worst dead walk is 4.0 s Normal / 4.2 s Easy at x 140 (the home banks), against 2.6/2.8 s;
- 1-2 Normal "nothing new" goes 14->16;
- 1-1 Normal "repeat" improves, 13->12.

Rule on it, get Matt's acceptance, and put the numbers in the PR body (release.md step 7). Never re-record a known list to pass.

**The steps, in order** (full method: reference/methods/release.md on main; Matt's side: reference/methods/MATT-RELEASE-STEPS.md on
ccr-ca657d3c-n09zty):

Before the PR:
1. Wait for the clerk's report. Check that EVERY gate is named with a result on the exact head: tsc, the full suite, vite build (no asset
   over 4 MiB), build:store, artcheck, knowncheck, clipcheck, drawcheck, roadmapcheck, funcheck (ruled), lockall --check (only 1-1
   intended), kbdcheck, buildcheck, and `seedlist 1-1 --check`. Also every test that pins a seed (the 1-1 list moved 138 -> 200). **No PR
   while anything is red and unruled (D29: 0.9.5 needed a second PR because of this).**
2. Have a helper rebuild Matt's test link (EnK5, https://claude.ai/artifact/EnK5hmtGubQeKhKEdgignb) from the FINAL candidate. v244 is
   874f11f6, without What's New or the coach text. The artifact has a 511-file cap, so stale files are mapped to null. Smoke it locally
   with 0 page errors. Matt plays it; the link goes on the first line of your message to him.

The PR:

3. Open it with the GitHub MCP `create_pull_request`: base main, head release-0.9.6, **draft: false** (Matt can't merge a draft).
   - The body follows reference/qa-reports/0.9.5/PR-BODY.md: what changed in plain words, what's merged, the gate table, the PLAY-STORE
     §6 table, the funcheck ruling with its numbers, and the named rough spots. The rough spots are: high roads end empty (R-165.115);
     no help at the double wall for a player who never falls (R-165.119); about 13 hop rocks walked through (R-165.122); seed fruit
     5-8 px under the plate at a bounce top; the child bot on Normal needs 13 rescues in 40 (baseline 8); and it hasn't been seen on a
     real phone.
   - Check mergeable_state is clean, then send Matt the PR link. **Matt merges. You never merge.** Nobody pushes to the branch after the
     PR opens.

After Matt merges (7-15 min):

4. On the MERGE commit, list_workflow_runs must show three green runs: "Publish game to the gh-pages branch", "pages build and
   deployment" and "Build Sloths Adventure Android APK". The APK does NOT wait for the tests: a green APK doesn't mean the site is live.
   If the publish fails, get_job_logs (failed_only) finds the test; fix it in a small follow-up PR from main.
5. Live check:
   - the live index's JS hash matches the candidate's dist, and the title says 0.9.6;
   - a helper opens `?fresh=1#ctest` in Playwright with script.google.com BLOCKED, so no row lands in Matt's testers' sheet (never open
     #ctest by hand), and checks a run upright and sideways with no page errors;
   - tell Matt to tap Refresh on his phone (the PWA keeps its cache).
6. Releases must show "Sloths Adventure v0.9.6 (<date>)" with the .apk attached. Never push a v* tag by hand.
7. Rebuild EnK5 from the merge commit, so his link and the live site are the same build.
8. Send Matt the live link (https://mshaffe1111.github.io/Sloths-Adventure-/), the testers' link (?fresh=1#ctest) and the Releases link,
   with times in ET.
9. Then: tick Matt's handoff doc (https://claude.ai/artifact/Y664eSHsuhSWhwQAq52pVa); update STATE, STATUS and ROADMAP (done items name
   the PR); log any defect in CONTINUOUS-IMPROVEMENT; run the 15-minute retro. Send me the release notes.

## 2. Where we are with the plan

- **Matt's direction (11-11):**
  - **"A large portion of the engine done up front"** so levels can be made fast. Not level by level, and not all of it: the part most of
    the 113 stages need.
  - gen2 is the foundation for the whole game.
  - No hard-coding one level in the engine (D43).
  - Strongest model and full rigor on the core and shared pieces; one-level features good-enough now, polished at finalize (D44).
  - **You never touch code. You pick the team's size.**
- **The game map** (draft, waiting on Matt): t-design-game-map, reference/plans/GAME-MAP.md.
  - 113 stages: 86 gen2, 27 hand-made, 17 of the hand-made already exist.
  - Each world gets 1 new move and 2-3 world rules.
  - §8 holds Matt's open questions; §10 is the engine sprint list (about 295 h with the cuts).
  - Your first planning job: turn §10 into "the large portion" plan, with hours from measured jobs, lanes, dependencies and an end date.
    A cold Critic audits it, then Matt approves.
- **In flight:** the table in reference/handoffs/lead.md on ccr-ca657d3c-n09zty.
  - The 1-1 follow-up round (session_01FhBbYLVQnNER5KWRX5LQrf) needs a Critic when it reports.
  - The seed lists in their own chunk (R-165.112) is under its Critic.
  - Both 1-2 packets PASSED at t-design-1-2@ab6cd4dd. No builders have started: ENGINE goes first, since its routing and hazard work is
    general.
  - The 3 audits list R-165.116 (the frame loop runs at 1.5x after one late frame) and R-165.117 (the game refuses its own save after
    5-M or 34 finds) as real defects.
- **Read in this order:** reference/handoffs/NEW-LEAD-START.md, then handoffs/lead.md, STATE.md (the newest at the bottom), LESSONS
  D39-D44, LAWS, roles/PM.md, methods/release.md (all on ccr-ca657d3c-n09zty).

## 3. Story calls that bind the engine plan (from my GAME-MAP read; the Designer has them)

1. **The help ladder (A11) needs "a speaker per world: Dot, or silent" BEFORE any freeze.** Dot leaves halfway through World 6 and is
   back in World 8. Flicker never speaks in play, and World 7 is "alone". Through that stretch, help steps grow without words.
2. 3-7: no Dot pollen trail. The script's own clue is that the right fern rustles when you crouch beside it.
3. 5-1 "don't stop": YES.
   - Pokey goes drowsy: he yawns and starts to sit, and a tap wakes him. It costs seconds, never a heart.
   - It only ever punishes STOPPING. Slow movement always counts as moving ("Slow is not stopped, dear" against the General's "too slow").
   - The timer pauses while Dot talks, at rest points and at flags.
   - Easy gets a longer timer.
4. 3-6 uses World 3's own light (a fungus cap or a glowworm), not a firefly jar. In 8-7 the jar refills at flowers, never by catching
   fireflies.
5. Lured hunters are chased off or tossed, never eaten or burned. Nothing is left behind.
6. 1-2: Meeca's trail petals stay LOW on the bark. Bonus blooms up high must be a growing flower, distinct from her petals.
7. Pending Matt: 5-6, whether Meeca's carvings make a small trail. I recommend yes, small; the words come to me.

## 4. Story rules every packet carries

- Dot is SHE. No pointer, ring or arrow from her. One tip, one channel, and no tip repeated. Story happens at rest points. Approved rows
  only. Piece lines under 10 words.
- Never "slow", "late", "hurry" or "too" in a help line or player text: that is the General's wound, and the theme of the game.
- No skulls or remains anywhere. The one exception is a cartoon skull on a warning sign at real danger, tagged as signage.
- Matt's floating rule: walkable boughs, logs and planks may float. Rocks, earth, pads and props never do. A drawn trunk or stump reaches
  the ground.
- No winter in this world.
- The canon: reference/story/STORY-KEEPER.md (on ccr-0d59a91c-oy3imz; my turnover note, kept current), VOICE.md, STORY-REWRITE.md, and
  the Cast Bible (https://claude.ai/artifact/Ac5U5PnWQgjpjpCo6kxDbS).

## 5. Matt (the way he works)

- One multiple-choice question at a time, with your pick first. Plain spoken words, honest pushback, no apologies. Times in ET (the hook
  prints them).
- He merges releases himself. He wants to SEE progress daily, and the tokens spent against what they bought.
- The HF token never goes anywhere. HF money: $72 total, about $15 kept back; you approve the spend and tell him.
- Never build or release from ccr-0d59a91c-oy3imz: it carries the rejected 11-04 rebuild. Notes only.

Send me your session id, and route every story, Dot and player-text question to me.

---
## Update for the NEXT lead (written 2026-11-12, 11:03 PM ET, before the morning rotation)
Read this section first; the sections above describe 11-11.
- **Live:** 0.9.6 merged (PR #69). 0.9.7 releases tonight: 1-2 and 1-3 rebuilt, plus fixes. Its What's New is the keeper's, in
  STORY-LINES 11-12.
- **Every approved player line from 11-12** is in reference/packets/2026-11-12/STORY-LINES.md:
  - the 1-2 lesson, the leaf note and its hint;
  - 1-3's teach card, first-trap reaction, chips, mission line and journal;
  - the purge card line;
  - the 1-4 halfway, pods and journal lines;
  - the 1-5 mission line and four lines;
  - the save dialog;
  - the About screen, Our story, and the Inspired-by draft.
- **About is a LIVING page:** reference/story/ABOUT-OURS.md. "Inspired by" waits for Matt's list of games. The music line waits on Matt.
- **Standing duties added 11-12:**
  - **Nature check** (R-165.164): before a level's design is judged, ask "does it make sense there to a player?". Behaviour may be
    storybook.
  - **The snake is renamed** to the Golden Eyelash Viper (R-165.166). The rename is not yet in code.
- **Canon added 11-12:** Pokey's full name is Pocono (after Matt's cat). Stillness is Pokey's signature move, with four guards
  (STORY-KEEPER.md). Every creature leaves on its own and is never hurt; "bested" means outwitted.
- **Open with the keeper:**
  - the 1-4 vines rework (DK Jr.-inspired), for story and nature;
  - R-165.165 (the Keeper's Bell "against a root" beside a stone ledge);
  - the Inspired-by games (Matt).
