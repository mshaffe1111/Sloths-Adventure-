# FIX-14: 1-4 from Matt's own play (12:06 AM ET 11-14, two clips + notes): rocks, fig gate, vines, the rotten fork.
Opus 5.5 high (content). Written 12:15 AM ET 11-14 by the lead. Branch t-fix-14 from origin/main@73e7bed0 (0.9.8, what Matt plays).
Read first: reference/methods/level.md (Building rules), STAGE-RULES, DIFFICULTY, gates.md, LESSONS D61-D63, and Matt's words in
ROADMAP R-165.227, R-165.212 (REOPENED), R-165.216, R-165.206. His clips: ask the lead for frames if you need them.
**D63 (new): every interaction here is judged on a CLIP of the whole action from a fresh player's eyes, then a try to cheat it. Stills
alone pass nothing.** Stills/clips print the built setting (D62); the lead judges pass/fail (D61).
## Matt's words (verbatim, the bar)
- Rocks: "too hard. They just drop too quickly... super hard... maybe we have the vines change colors to let us know that there's about
  to have something drop, because there's just too much going on in the screen." "4 is only hard because of those rocks."
- Fig: "there has to be a better way of indicating the fruit is the whole way up... something that is tying down the thatch, and it
  shows that it's breaking... or have a lock... right now it's only a guess." "It still goes over the top... it cannot go above the
  platform above it... like on Pokey's head as a collision thing with the platform... his shoulders... Just enough to get the fruit up."
- Vines: "aren't easy to navigate through"; the clips "show how wonky the play is".
## In order
1. **Measure, before any change (one table in PLAN.md):** rockfall.ts drops on 1-4 (every, warn, fall speed, count per screen, how the
   warn is drawn today and whether it reads on the backdrop); the fig gate today (what happens at full push, where Pokey's head can go:
   reproduce Matt's "goes over the top" on the real page, with a clip); vine climb speed + air steer off a vine vs 1-5 (Matt likes 1-5).
2. **SHOW FIRST (CLAUDE.md), before building:** two mock clips for Matt, upright: (a) a rock telegraph: the vine/bough a rock comes from
   shakes and changes colour, dust trickles, for a set warning time before the drop; (b) the fig lock: a tied-down thatch whose ties
   visibly strain and SNAP when the fruit is fully up (painted-art rule: if the ties/thatch need art, name the pieces for the next HF
   batch; a code-drawn stand-in is fine for the MOCK only). Send the lead both; nothing is built past the mock until Matt picks.
3. After Matt's pick: rocks slower, fewer, telegraphed (min warn time in one place, every stage that uses rockfall), Easy gentler; a
   head/shoulder stop under the gate bough so only the fruit passes (planted test from Matt's case: push to full, hold up, jump: Pokey's
   top never above the bough's underside) + R-165.223's skip probe for this gate; the lock moment.
4. Vines (R-165.216): only from the step 1 numbers, matched to 1-5's feel; planted tests.
5. R-165.206 rotten fork (w1Arc14.ts ROTTEN_FORK on t-len-14@d56cd91; t-int-6 REPORT step 2): the creak is the way UP, or the exit
   hidden till he is down; castBots before/after; adult Easy >= the 100 s climb floor (STAGE-RULES:77); ONE relist at the end.
Not yours: 1-1 (POLISH-4/5), engine pieces for 1-6..1-8 (A1/B1), art generation (the lead runs HF).
BOX: 90 minutes or 40% context: push, REPORT (30 lines + Learned) with EXACT NEXT STEP, stop; never stop with a gate running (D59).
Full CLAUDE.md Checks on your head before you report. Context % in every message. Lead: session_01FhBbYNzGRJBDMzn6XbtQK2.
