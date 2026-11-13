# Cold review of the plan, by the new lead (session_01FhBbYNzGRJBDMzn6XbtQK2), written 2026-11-13 10:00 AM ET, before talking to the backup lead
Base: ccr-ea739a2f-dfcee4 = main d8d6a973 + the outgoing lead's docs from ccr-702d3c49-i33jeq@3eb5c1c0 (commit 4c82d041). Nothing here is
acted on until a cold Critic's PASS (PM.md:197; D35). No check or ruling of Matt's is loosened, removed or re-scoped (LAWS.md:81).

## A. The five handover questions, from the documents alone (PM.md:189-190)
1. **Live:** 0.9.7, merge d8d6a973 (git log), deploy + APK green, release v0.9.7-39 (STATE.md:834). Matt's link EnK5 = v252, the 0.9.7
   candidate (STATE.md:832); lead.md:16 still says v251 (stale: fixed in lead.md).
2. **Next three tasks:** (a) 1-5's build, the next level (lead.md:19), its order on 1-5.md:59 (creaky limb in gen2, marks goal, the level
   on plain splits, the limb trap load, the card road, polish); (b) the meter foundation, R-165.176 then the meter gate (lead.md:21-22;
   STATE.md:773); (c) 0.9.8's fixes (lead.md:23-24). Who: per models.json level design/building Opus xhigh, Fable only for core engine
   (models.json:33-39); a fresh Critic for each result (PM.md:80).
3. **Needs Matt:** his "go" (the pause, lead.md:28); his okay on three story-keeper lines (R-165.175 teach, R-165.171 coach, R-165.165 bell;
   story keeper 11-13 10:00 AM) and one optional About line. STATE.md:304's "Decisions waiting on Matt" is out of date (11-07 items; nothing
   from 11-12): a note that fell short, rewritten in STATE.md.
4. **A release:** reference/methods/release.md; PM.md:106-129 (candidate branch, full gate on the exact head, EnK5 first, PR not draft, Matt
   merges, check the 3 runs and the APK).
5. **Links:** PM.md:131-134 (live, testers ?fresh=1#ctest, EnK5, handoff doc).

## B. What I would change
1. **Four results were passed on the lead's look only, never by a Critic:** 1-5.md (STATE.md:801), 1-4.md's revision (STATE.md:806),
   FEEL-PAIR (STATE.md:805), LATTICE, which is engine code (STATE.md:831); also DIFF-ALGO's plan (STATE.md:781). The takeover rule is
   "every result not yet passed goes to a fresh Critic" (PM.md:245). Change: 1-5.md and DIFF-ALGO's S1 packet go to a fresh Critic before
   1-5's build or S1 starts (they are next); LATTICE goes to a Critic before it is integrated (1-4's turn, not now); FEEL-PAIR is superseded
   by LATTICE (built from it, STATE.md:831) and is not audited on its own.
2. **Order: fix the meter's inspector BEFORE 1-5's build is scored, not after.** 1-5's build is re-scored with score.ts --detail on BUILT
   stages (1-5.md:37), and the inspector has two known defects (R-165.176, ROADMAP.md:664; DIFFICULTY.md:51 on t-diff-algo). Building 1-5
   then fixing the meter would mean re-tuning 1-5 (D40, CLAUDE.md "No patching what is being replaced"). Change: S1 (R-165.176, tools only)
   runs alongside 1-5's two small engine pieces (WRITE files: tools/ vs src/game/gen2: no overlap, PM.md:21) and lands before 1-5 is laid.
   The meter GATE (S2) can follow 1-5; the builder checks its number by hand meanwhile.
3. **1-5's art is not planned.** 1-5.md:56-58 lists six art needs ("World 1 has no sign art"): leaf-signs, curtain, folded petal, her mark on
   bark, root tunnel, rotten trunk, dusk. CLAUDE.md:25 (painted art for major looks) and :27 (inventory first) apply. Change: an art packet
   (Hugging Face, the lead's call) runs in parallel with the engine pieces and is labelled into the inventory before the level is laid.
   Note: the Hugging Face connector failed to connect in this session (session start notice); the helper's own route (tools/README.md)
   is checked before the packet goes out.
4. **F15 should not be kept idle for the card road.** It holds 324k tokens of context (get_session 11-13), near the ~40% retire line
   (lead.md:227), and its card-road phase comes after 1-5's level is built (1-5.md:59). Every turn re-reads that context. Change: retire F15
   now; the card road goes to a fresh Fable member with 1-5.md as its frozen input (Fable is allowed there: models.json:33-39).
5. **The story keeper runs at 680k tokens of context, ,924 lifetime** (get_session 11-13). PM.md:220 lists "run very long" as a drift
   sign: it gets the closed-book health check now (PM.md:223-225). The role is never replaced (PM.md:229); a remake of the SESSION happens
   only on a failed test. Its cost is told to Matt as a fact, no ask.
6. **1-5.md:55 cites "the same piece as 1-4's #6"; 1-4's revised design (vine field, t-15-design@dee8c8c0) has no creaky limb** (grep of
   1-4.md for creak/crumbl finds only pods' "creaks"). So 1-5 is where World 1 first teaches the creaky limb, and 1-5.md beat 2 already
   teaches it safe (1-5.md:14). Change: the Critic checks this; nothing for 1-4 to wait on.
7. **The new mechanic rule (LEAD-PERSONA.md:161: Matt feels a new mechanic before a level is built on it):** 1-5's creaky limb is a crumble
   (types.ts:306 per 1-5.md:55), which the game already has and Matt has played; the split is walking. My call: no feel room for 1-5; Matt
   plays the built level. The card road is NOT built until he has played 1-5 on plain splits.
8. **Old sessions:** about 50 helper-era sessions sit IDLE, not archived (list_sessions 11-13), including an older lead
   (session_01FhBbYMoqqEdVR3qFjTCugy). They cost nothing idle but crowd Matt's list (PM.md:210: stop what nothing needs). Change: archive
   the ones whose work is merged or superseded, in one pass, after the Critic's PASS.

## C. What looks like the last lead's bias
- **Fable churn:** ENG-ASCENT started 10:00 PM and stopped 10:36 PM on usage (STATE.md:790-791, :812-817); F15 got six redirects in 30 minutes (STATE.md:795-806), most of them Matt's own notes relayed one by one mid-task
  rather than batched (PM.md:100, "ask well"). Matt then fenced Fable to core engine only (models.json:33-39). The plan still parks a Fable session idle for later work.
- **Lead's look as the pass:** five results were passed by the lead alone (B1), against PM.md:80.
- **The test link before the foundation:** the meter was named a foundation "before 1-4/1-5 are built" (STATE.md:773), yet the handover goes
  straight to building 1-5 (lead.md:19). B2 restores the order.
- Scheduled tasks: none for the team exist (list_triggers 11-13 shows only Matt's two personal ones), so nothing to re-create (PM.md:246).
