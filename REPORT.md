# CRITIC: LEAD-REVIEW-1113. Attempt 2 verdict: PASS (2026-11-13 10:17 AM ET). Subject: reference/notes/lead-review-2026-11-13.md
Attempt 1 @05d76f84: REJECT (this branch @4e771886: B6 false, cites off at the SHA, B2 order, B7 uncited; missed ENG-ASCENT + 0.9.7 steps).
Attempt 2 @5b4e2b8d (ccr-ea739a2f-dfcee4), delta only, as the lead asked. Lessons applied: D49, D34 (a cite is a checked fact at the SHA).
## The four violations: each fixed
1. B6 now says 1-4 teaches the bough first (1-4.md:30 beat 2, engine #6 at :56-57 on t-15-design@dee8c8c0), and 1-5's beat 2 holds the
   one tip until 1-4 ships. The move follows "one tip, one channel" (STORY-KEEPER.md:111 and :207 on ccr-0d59a91c-oy3imz). True.
2. Cites re-checked at 5b4e2b8d. STATE.md :304 :778 :786 :795-796 :806 :810 :811 :817 :822 :836 :837 :839; lead.md :16 :19 :22-23 :24-25
   :29 :227. Each says what is claimed. The new STATE entries sit after :839, so nothing above shifts. `git diff f63ac487 d8d6a973` is
   empty, so A1's "EnK5 already equals live" holds.
3. B2 is now S1 -> S2 -> S3 -> 1-5's lay, matching DIFFICULTY.md:72, ROADMAP R-165.176, STATE.md:778 and lead.md:23. Running pieces
   alongside is limited by PM.md:21. C's "B2 keeps the foundation first" is now true.
4. B7 keeps LEAD-PERSONA.md:161: a crude room on Matt's link, and 1-5 is laid only after he plays it. Moving piece 3 ahead of 1-5.md:59 is
   rule over table (D49). No rule is loosened.
## Misses: both added
- B8: ENG-ASCENT re-issued as a fresh packet from 7499d79f (PM.md:241-242; STATE.md:822). Timing it to 1-4 is allowed (1-5.md:58 needs no ascent).
- B9: 0.9.7's after-merge steps. ROADMAP R-165.125 and .163 are "done (2026-11-13, PR #70, d8d6a973)": true, since 9442c9ec/5fa60568 are in
  d8d6a973. The debrief and retro are named as the lead's next job (still owed, LAWS 12).
## B11 (ROADMAP/BUILD-PLAN): forms only, no scope changed (row-by-row column diff 05d76f84..5b4e2b8d)
- No row added or removed. 24 Time cells were rewritten "N h (no history: <old text>)": each N is inside the old range, and the old text is kept.
- R-165.158 moves its note from the ID cell to What (word for word). .165/.167/.169 add a reason for grade C (grade unchanged).
- .171 goes C->B and .176 S->M: both raise priority or size, neither lowers one. State changes only on .125/.163 (done, above).
- I ran roadmapcheck: 05d76f84 FAIL (30), 5b4e2b8d PASS (Day 1 825.75). knowncheck PASS at 5b4e2b8d.
## Minor (not blocking)
- BUILD-PLAN.md:70 says the rows "add 67.5 h". That is 825.75 minus the stale printed 758.25. Against the 763.75 that 05d76f84 actually
  computed, they add 62 h.
- B5's story-keeper remake waits on Matt's go: stricter than PM.md:229, which allowed it.
