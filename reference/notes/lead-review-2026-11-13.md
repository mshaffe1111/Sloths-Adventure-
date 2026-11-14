# Cold review of the plan, by the new lead (session_01FhBbYNzGRJBDMzn6XbtQK2). Attempt 2, 2026-11-13 10:11 AM ET (attempt 1 at 05d76f84: REJECT,
t-crit-lead-review-1113@4e771886). Written before talking to the backup lead. Nothing here is acted on until a cold Critic's PASS
(PM.md:197; D35). No check or ruling of Matt's is loosened, removed or re-scoped (LAWS.md:81). Cites checked at this commit; the only
later edits to STATE.md are appended at its end (no shift above line 839).

## A. The five handover questions, from the documents alone (PM.md:189-190)
1. **Live:** 0.9.7, merge d8d6a973, deploy + APK green, release v0.9.7-39 (STATE.md:839). EnK5 = v252, the 0.9.7 candidate
   release-0.9.7@f63ac487 (STATE.md:837); `git diff f63ac487 d8d6a973` is empty, so EnK5 already equals what is live (PM.md:125's rebuild
   from the merge would change nothing; recorded instead). lead.md:16 said v251 (fixed in 05d76f84).
2. **Next three tasks:** (a) 1-5's build, the next level (lead.md:19), pieces and order on 1-5.md:54-59; (b) the meter foundation
   R-165.176 -> S2 meter gate -> S3 builder targets (lead.md:22-23; ROADMAP R-165.176; STATE.md:778); (c) 0.9.8's fixes (lead.md:24-25).
   Who: level design/building Opus xhigh, Fable only for core engine incl. the card road (models.json:33-39); a fresh Critic per result (PM.md:80).
3. **Needs Matt:** his go (lead.md:29); his okay on the story keeper's three lines and one optional About line (now at the top of STATE.md:304's
   list, which was 11-07-stale before 05d76f84).
4. **A release:** reference/methods/release.md; PM.md:106-129.
5. **Links:** PM.md:131-134.

## B. What I would change
1. **Five results were passed on the lead's look only, never by a Critic:** 1-5.md (STATE.md:806), 1-4.md's revision (STATE.md:811),
   FEEL-PAIR (STATE.md:810), LATTICE, engine code (STATE.md:836), DIFF-ALGO's plan (STATE.md:786). PM.md:245: every result not yet passed
   goes to a fresh Critic. Change: 1-5.md and DIFF-ALGO's plan go to a fresh Critic before S1 or anything of 1-5 starts; LATTICE and
   1-4.md before 1-4's work; FEEL-PAIR is superseded by LATTICE (built from it, STATE.md:836) and is not audited alone.
2. **Order (D40, CLAUDE.md:26): the whole meter foundation lands before 1-5 is laid.** DIFFICULTY.md:72 (t-diff-algo): "N1 first: the
   builder takes the target, then the stages are laid to it"; STATE.md:778: the meter + gate before 1-4/1-5 are built; R-165.176 then S2
   then S3 (lead.md:22-23). So: S1 (R-165.176) -> S2 (meter gate) -> S3 (N1-N3, builder reads the target) -> 1-5's lay. What may run beside
   them, only where the Architect's WRITE files do not overlap (PM.md:21): 1-5's engine pieces that S3 does not replace (the rotting/creaky
   bough, marks as a gen2 goal, the falling limb load: 1-5.md:54-57) and 1-5's art (B3). The handover's "1-5 next" (lead.md:19) skipped S2/S3.
3. **1-5's art is not planned.** 1-5.md:56-58 names the art: leaf-signs and curtain, folded petal, her mark on bark, root tunnel, rotten
   trunk, dusk ("World 1 has no sign art"). CLAUDE.md:25 (painted art for major looks) and :27 (inventory first). Change: one Hugging Face
   art packet (the lead's call, CLAUDE.md:25), run with the token per tools/README.md:12, labelled into the inventory before 1-5 is laid.
4. **Retire F15 now; the card road goes to a fresh Fable member later.** F15 holds 324k tokens of context (get_session 11-13), near the
   ~40% retire line (lead.md:227); its card-road phase comes after 1-5's level (1-5.md:59), days away. Fable stays the card road's model
   (models.json:38). Its frozen input: 1-5.md on t-15-design@dee8c8c0.
5. **The story keeper's session** runs at 680k tokens ($3,924 lifetime, get_session 11-13): "run very long" is a drift sign (PM.md:220).
   Done 11-13 10:01 AM: the closed-book test scored 2 of 3 (STATE.md, last entry), so its SESSION is remade (PM.md:225-229: remake if it
   has ended or fails the test; the role is never replaced), on Matt's go.
6. **The rotting/creaky bough is taught in 1-4 first in game order** (1-4.md:30 beat 2, the same piece, engine #6 "with 1-5" at
   1-4.md:56-57; 1-5.md:14 beat 2). 1-5 is built before 1-4 (lead.md:19), so until 1-4 ships 1-5's beat 2 is the first teach, and its
   approved "creaky teach" line (STATE.md, 11-12 10:20 PM) is the one tip. When 1-4 ships, 1-4 teaches the bough and that line moves to
   1-4 (one tip per move: STORY-KEEPER.md §3 on ccr-0d59a91c-oy3imz). Change: the bough is ONE general engine piece serving both levels
   (D43); a new R-number tracks moving the teach line when 1-4 lands; the story keeper is told.
7. **Matt feels the bough and the falling limb before 1-5 is laid** (LEAD-PERSONA.md:161). No file shows he has played a crumble on a main
   route (1-5.md:54-55: World 7's tile, off the main route), and the falling limb is a new drop-trap load (1-5.md:56). Change: the bough /
   limb engine packet ships a crude QA room (code shapes, as LATTICE's, STATE.md:836) on Matt's test link; 1-5 is laid after he has played
   it. This moves piece 3 (the limb load) ahead of the lay, against 1-5.md:59's order; the rule wins over the table (D49).
8. **ENG-ASCENT's WIP** (t-eng-ascent@7499d79f, untested, STATE.md:822) is re-issued as a fresh packet with that head as frozen input
   (PM.md:241-242) when 1-4's build is next (1-4.md:59 puts the ascent lay first there; 1-5 needs none, 1-5.md:58).
9. **0.9.7's after-merge steps were open** (PM.md:125-127; LAWS 12): ROADMAP R-165.125/.163 now name PR #70; the debrief and retro are
   written by the lead next; EnK5 needs no rebuild (A1).
10. **Old sessions:** about 50 helper-era sessions sit IDLE, not archived (list_sessions 11-13), one an older lead
   (session_01FhBbYMoqqEdVR3qFjTCugy). Change: archive those whose work is merged or superseded (PM.md:210), one pass.
11. **The roadmap check was red on the docs I inherited** (30 failures: 11-12 rows' times not in the "N h (...)" form, Day 1 C grades,
   R-165.158's row malformed). Fixed in the lead's own file: forms only, no row's scope changed; R-165.171 graded B (the first tip a new
   player reads); R-165.176 sized M (2.5 h); BUILD-PLAN.md:70 re-stated. roadmapcheck and knowncheck PASS.

## C. What looks like the last lead's bias
- **Fable churn:** ENG-ASCENT started 10:00 PM and stopped at 10:36 PM on usage (STATE.md:795-796, :817-822); F15 got six redirects in
  30 minutes (STATE.md:800-811), most of them Matt's own notes relayed one by one rather than batched (PM.md:100). Matt then fenced Fable to
  core engine only (models.json:33-39), yet the plan parked a Fable session idle for later work.
- **The lead's look as the pass:** five results (B1), against PM.md:80.
- **Building before the foundation:** the meter was named a foundation "before 1-4/1-5 are built" (STATE.md:778), yet the handover goes
  straight to building 1-5 (lead.md:19). B2 keeps the foundation first.
- **Release follow-through skipped:** no debrief or retro for 0.9.7 (B9).
- No team scheduled tasks existed (list_triggers 11-13: only Matt's two personal ones), so nothing to re-create (PM.md:246).
