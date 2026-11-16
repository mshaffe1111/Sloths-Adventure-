# ENG-16F: 1-6's last bot reds, frame by frame, fixed where they live (engine for any level, data for 1-6 only). Opus 5.5 xhigh. Written 3:12 PM ET 11-14 by the lead.
Branch: continue t-build-16 from ENG-16E's final head. READ ONLY THESE FIRST (lean, do not read whole reports): ENG-16E's REPORT
"EXACT NEXT STEP" section and its castBots table; level.md rules 21-22 (two paragraphs); tools/inspect/firsttimer.ts only around the code
you trace. The kid Normal rescues on 1-6 seeds 1-6: chain:m s1, risers:b2 s2+s4, gorge d2/gb1/b2 s3-s5, first liana s5.
0. FIRST, from ENG-16E's REPORT (head 88da57f1): (a) the FAR ruling (lead, 3:55 PM): option (b): FAR is defined by what the testers'
   forward-end let-go from the liana's foot lands (Matt's shorter swings, R-165.225); rewrite w1Swing.test.ts:48/:123 to that intent (FAR
   is the farthest swing a real player makes, measured by the testers' let-go, FORWARD_END 0.75), and write the rule into level.md's World 1
   notes. (b) the 26 reds already on the start head (never run by BUILD-16..16d): tests of the OLD hand-built 1-6 (stage16, roomLogReset,
   vineFollowUps, vineFlickMirror, puzzleCamera...) retire WITH the old proto 1-6 (R-165.238: delete it whole, grep proves nothing else
   reads it; new replaces old), each retirement named with the grep; tests that need the NEW 1-6's row (judgedTable, listed, verdicts,
   writtenKeys, vineSelfSwing) get it; w4RealReach's TODO stays a TODO. Never delete a test to get green: each one either moves to the
   new 1-6 with its intent or goes with the dead code it tested.
1. Frame-trace each (FT_FRAMES/FT_TRACE): name the frame where it goes wrong and classify: BOT (fix in firsttimer, planted toy test,
   tierBots unmoved), STAGE fault any level could have (fix in the engine/lay, planted, every listed stage re-checked), or STAGE fault
   one-off to 1-6 (fix in w1Arc16 data), or HONEST MISS (a real first-timer misses there too: name the evidence). No timing tweak to fit
   the bot to the stage.
2. Goal: Normal kid at least 5/6 with any remaining rescue located and honest (the 1-1 L10 standard), every other bot 6/6 both settings.
3. Then 1-6 to GREEN: relist + bots 1-40 both settings, stills upright + sideways Normal + Easy of every beat, CLIPS (first liana, the
   chain, snake on your vine, the false liana, the gorge, sealed + open exit; name the frame, D69). Gates scoped by what you touched (LAWS 5).
   Send GREEN to the lead AND to INT-9 (session_01FhBbYKSqV5AeZmMEkQ1msT), which merges t-build-16 into link #3.
No until/sleep wait loops (D67); read the queue at every push (D57). BOX: 2 hours or 40% context (400k of 1M by your own last turn's number).
Lead: session_01FhBbYNzGRJBDMzn6XbtQK2 (after ~8 PM ET: the session on reference/handoffs/lead.md's top line).
