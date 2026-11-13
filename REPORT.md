# CRITIC: LEAD-REVIEW-1113. Verdict: REJECT (2026-11-13 ET). Subject: reference/notes/lead-review-2026-11-13.md @05d76f84
Docs audit, no game code changed: no gates needed (LAWS 5 scope). Lessons applied: D49 (a design table never beats a rule), D34/PM.md:194 (cite = checked fact).
## Violations (each blocks acting on the review: PM.md:197, D35)
1. B6 FALSE FACT (LAWS 3). It says 1-4's revised design "has no creaky limb" (grep creak/crumbl). origin/t-15-design@dee8c8c0
   reference/design/1-4.md:30 beat 2 "Rotting boughs (T)": bracket fungus, notched underside, "goes at 1.1 s (engine.ts:2583)", the SAME piece
   as 1-5.md:14; :37/:47 rotten stairs; :56-57 engine piece "6 Rotting boughs (S; with 1-5)", "7 ... drop-trap load". 1-4 is played before 1-5,
   so in game order 1-4 teaches it first and 1-5's beat 2 is a second teach. The conclusion "1-5 is where World 1 first teaches" is wrong.
2. CITES WRONG AT THE SUBMITTED SHA (PM.md:194 "checked in the same step"). The commit inserted 5 lines at STATE.md:305-309, so every STATE
   cite past 304 points 5 lines early at 05d76f84: :834 (live) is :839, :832 (v252) is :837, :801 (1-5.md pass) is :806 (and :801 is now
   Matt's 10:06 note), :805/:806/:831/:781/:790-817 likewise. lead.md got 1 line on top: :21-22 -> :22-23, :23-24 -> :24-25, :28 (pause) -> :29.
3. B2 BREAKS THE ORDER IT INVOKES (CLAUDE.md:26 D40). It runs only S1 before 1-5 and puts S2 (meter gate) after, with S3 unaddressed; but
   DIFFICULTY.md:72 (t-diff-algo) "N1 first: the builder takes the target, then the stages are laid to it", ROADMAP.md:664 S1->S2->S3,
   lead.md:23 and STATE.md:778 ("before 1-4/1-5 are built") all put the gate and targets ahead of a build. C's "B2 restores the order" is
   false. Either S2/S3 land first, or B2 states why S3 does not replace 1-5's build (D40: name what replaces it) and puts that to a Critic.
4. B7 rests on an uncited fact (PM.md:194): "a crumble... which Matt has played". 1-5.md:54-55 says crumble is World 7's ruin tile, OFF the
   main route; no file cited shows Matt played it, and 1-5 also adds a falling limb as a drop-trap load (1-5.md:56, a new load). Self-exempting
   from LEAD-PERSONA.md:161 needs a cite, or the rule holds (feel room, or Matt plays the rot in 1-4's feel room per 1-4.md:59).
## Minor
- B3 "six art needs" lists seven (1-5.md:57-58: item 6 is the art line). "Hugging Face connector failed": HF runs from tools/README.md with
  the token, not a connector; the failed servers in the session notice are unnamed. B5 ",924 lifetime" is a garbled number.
- B5 omits "ended" from PM.md:229 (remake if ended OR failed). B1 says "Four" then lists five.
## Missed (a new lead must know)
- 0.9.7's after-merge steps are open: PM.md:125-127 / LAWS 12. No 0.9.7 debrief (newest reference/debriefs/ is 2026-11-01-0.9.3.md); ROADMAP
  rows R-165.163/.125 (shipped, STATE.md:839) do not name PR #70; no EnK5 rebuild from merge d8d6a973 recorded; no retro.
- ENG-ASCENT's WIP (t-eng-ascent@7499d79f, untested, STATE.md:822 at the SHA) is not in B: PM.md:241-242 says re-issue as a fresh packet.
## Holds
A1-A5 match the documents (content checked; only the line numbers drift). PM.md cites (:21,:80,:100,:106-129,:131-134,:189-197,:210-246),
LAWS.md:81, CLAUDE.md:25/:27, models.json:33-39 (card road is Fable's, :38; F15's phase 2 stays Fable, STATE.md:824), 1-5.md:14/:37/:55/:59,
DIFFICULTY.md:51, ROADMAP.md:664 say what is claimed. B1 true (no Critic entry after STATE.md:700). B4, B5, B8 loosen no ruling of Matt's.
