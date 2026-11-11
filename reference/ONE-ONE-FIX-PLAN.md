# The 1-1 fix plan (the lead, 2026-11-09 8:59 PM ET; Matt: "Start fixing 1-1 after test data is evaluated. Make plan and start making change", R-165.84)

Built from the analyst's window report (branch t-w11-analyst, reference/qa-reports/window-2026-11-10/WINDOW.md, pulled 11-09 8:39 PM ET
with the window still open: 95 gen2 1-1 runs by 9 players since 0.9.5; Normal 81 runs / 8 players, Easy 14 / 3). A Critic checked its
six main claims against the code and found them true (two small report fixes are with the analyst as attempt 2; no finding below
depends on them). Every fix has a roadmap number. Money: $75 at most before Matt's next test link, promote included (STATE.md ledger).

## What the players showed
1. Every life lost on Normal was a pit under a raised piece: 7 of 8 players; w1-log-chain-rise 10 lives, w1-mushroom-chain-back 8,
   w1-log-chain 6. Practice does not cure it: the most-practised player still loses about 1 life per 2-3 runs.
2. Taps are read as punches: 1-1 has nothing to punch, yet 154 of 700 punches were followed by a jump within 0.6 s, 9 of 10 players (corrected 11-11 from 475; D38).
3. No help exists for a player set back again and again: one Easy player was set back 152 times in one piece over 22.5 minutes
   (ONE player; the pattern is the child-bot's). stuckHelp watches walls only (engine.ts:4524).
4. Put-backs cluster at the double-jump gaps (canopy-rungs-level, dip-double-teach, double-teach) on both settings.
5. The mushroom bounce is the longest stretch (median 32.5 s) and the most-picked "hardest".

## Test link A (first; engine only, no new art, no layout numbers needed)
| Fix | What changes for the player | R | Who | Waits on |
|---|---|---|---|---|
| A1 | No fall in 1-1 costs a life, on Easy or Normal: every fall sets Pokey back on the ledge he left (the lead's ruling R-165.53, now with the data behind it). Normal's bite starts at 1-2. | R-165.86 | Engine (Fable 5.2, medium), Critic proves | its packet's Critic PASS |
| A2 | Help after repeated put-backs in one piece: by itself on Easy, offered on Normal (R-165.62's per-setting ruling) | R-165.62 | Engine, on the Designer's help.md thresholds | the Designer's PASS |
| A3 | A tap that was meant as a jump is a jump: the touch rule for a tap followed by a jump, decided on the Designer's touch.md | R-165.87 | Designer rules, Engine builds | the Designer's PASS |

## Test link B (second; the re-lay, with Matt's art)
| Fix | What changes | R | Who | Waits on |
|---|---|---|---|---|
| B1 | 1-1 re-laid on the flown reach: the three chains get gaps inside the real single-jump band or a catch road; the double-jump gaps get a practice gap first; fewer or shorter bounce pieces | R-165.72 | Content, Critic proves | Designer, Architect |
| B2 | Matt's art placed: the 91 weekend pieces, the 15 sheets of 11-09, the repainted near strip; one mock-up sheet for Matt's yes first | R-165.85, R-165.72 | Content | cutting and cataloguing |

## Checked, smaller
- The double hint never shown to one player: check tipMemory on a shared device (R-165.88).
- 6 jitter lines, 1 camera jump and 1 blank moment, with seeds, in WINDOW.md §3-4 (R-165.89).
- The recorder is not broken (R-165.58): the 11-07 "impossible" numbers were report maths, fixed in report.py. What is left of
  R-165.58: `move double` counts runs, not uses.
- Step-downs in resolution: 89 of 131 come from one device; fps median 30. No new work beyond R-3.1 (WebGL).

## Order and money
A1's packet goes to a Critic now, then to the Engine member. A2 and A3 follow the Designer's PASS. The promote (gates, the test link)
is counted inside the $75. If the money runs short, Test link A ships with A1 alone and says so.

## The help schedule: the lead's ruling, 11-09 9:15 PM ET (Matt asked "Are you going to approve the help schedule?"; design calls are the lead's, Matt 11-07)
Approved with two changes to the Designer's proposal (t-designer-reach help.md §4: 3 / 5 / 8 / 12 put-backs in one piece).
| Put-backs in the piece | Easy (steps in by itself) | Normal (offered; the stage never changes by itself) |
|---|---|---|
| 3 | Dot says the move | Dot says the move |
| 5 | quiet: a tap on the pad becomes a full jump at that piece | nothing |
| 8 | a step grows by itself (the Designer had 12) | nothing in test link A (the ghost offer comes later) |
| 12 | (already past) | Dot offers the step; only a yes grows it; after a no he asks once more 8 put-backs later, then never at that piece |
- Change 1, Easy's step at 8, not 12: our own research already said quiet help after 3 falls and an offer after 5 (roles/ENGINE.md,
  reference/research/STUCK-PLAYERS.md), and R-165.62 says "about 5 tries". At the testers' 9 s a put-back, 8 is about 72 s; 12 is
  108 s, long for a child who is stuck. Normal keeps 12: a Normal player wants to solve it.
- Change 2, the ghost that shows the move (the Designer's step at 8) is cut from test link A: it needs animation and must be
  flown first. It keeps its place in help.md for a later link.
- Counted per piece; reset by standing on the piece beyond or the stage ending; a grown step stays for the run (as proposed).
- Every number is a proposal until flown and until a play window judges it. The test: on Easy no player spends more than 2 minutes
  in one piece; on Normal the offer is taken or refused, never missed.
- AMENDED 11-09 9:22 PM ET on Matt's point ("somebody may not have 12 tries because they'll run out before that. They only have X
  amount of lives"): he is right for every stage where a fall costs a life. In 1-1 after A1 no fall costs a life, so the counts
  above are reachable there. Everywhere else the count must be of FAILURES at the piece (a put-back or a life lost), it must
  carry through a lost life and through a game over and retry of the same stage (it resets only when he gets past the piece or
  leaves the stage for the map), and a game over at a piece jumps Normal straight to the offer. The game already offers extra
  lives after repeated game overs (src/game/assist.ts shouldOfferHelp): the Designer makes the two one system, so a player is
  never offered two different helps at once. This is the Designer's next packet (help.md §5), before the help is used past 1-1.
- Matt, 11-09 9:25 PM ET: "It's only the first level that they're getting that many tries, because technically I didn't even think we
  were going to drop anybody." Confirmed: the long count is for 1-1 only, and his picture of 1-1 is that nobody is dropped. The
  lead's reading, told to him: A1 makes sure nobody loses a life in 1-1 now; the re-lay (B1) goes further and puts ground or a
  catch road under the raised chains, so a miss is a short fall and a walk back, not a set-back. Past 1-1 the amended rule applies.
- Dot's words go to the story keeper before they are built; the yes and no must work for a player who can't read (pictures).

## Matt's call, 11-09 9:10 PM ET
Test link A ships A1 and A2 together ("A"), so the put-back loop never ships without its help. A3 goes to the next link.

## Calls the lead made, and their known cost
- Engine first, layout second. The analyst ranks the three chains "layout, else engine". The lead chose the engine fix first
  because it needs no reach numbers and no art, and the layout fix (B1) follows on the Designer's passed numbers.
- A1 without A2 has a cost: with no lives to lose, a player who can't clear a chain is set back again and again with no help, the
  loop one Easy player was in for 22.5 minutes. A1 alone trades lost lives for that loop. A2 is the cure and ships with A1 if the
  money allows; if not, Matt is told plainly before the test link goes out.
- After A1 every pit in 1-1 is harmless but looks the same as a deadly one elsewhere. The Architect's "lethal vs soft" visibility
  work (R-165.61) and the re-lay (B1) must make the two look different.

## The lead's ruling on ADR-001's scope (11-11)
ADR-001 §3 freezes an "easy-any" scope for the verdicts. For E0a the lead narrows it to 1-1 only: the verdicts gate 1-1's rolls;
every other stage keeps today's closed-form checks and reports the verdicts as notJudged, until each world is flown and moved on
purpose. Reason: only 1-1's reach has been flown (reach.md) and only 1-1 is being re-laid; judging other worlds by numbers flown on
1-1 would move stages nobody has looked at. The Architect's ADR-001 gets this note when its branch merges.

## The lead's ruling on made things in 1-1 (11-11)
The 11-06 rule (no made things in the home forest: rope, planks, sawn or carved wood and stone, crates, ladders, frames) now covers
all art (Content applied it to all four cut sets). Today's 1-1 cut atlas (w1-cut.webp) draws 5 planks. They stay until the re-lay; the
re-lay (B1, C1) replaces each with a natural piece of the same footprint (a flat-topped fallen log or a cut stump from Matt's batches),
and the C1 packet names it as a done-item.


## Lead ruling 11-11 5:46 AM ET (A2 attempt 3, for the C1 re-lay packet)
A2's help grows a stair (faces 60 px or less, treads 80) under a rise only where there is room; 228 Easy / 253 Normal rises on today's 1-1 have no room, so nothing grows there. No planks are added for them. The C1 re-lay lays only rises that a stair fits or a plain single jump clears, so every rise in the new 1-1 can be helped. C1's packet carries this as a done-item checked by A2's sweep.


## Matt's call 11-11 8:13 AM ET: made things in World 1
The inventory (t-art-catalog-a@34146615) found 15 made things in World 1. Matt: swap the 3 plank ledges, the sawn wide stump (w1-stump-wide) and the trail post for natural pieces (C2, at finishing; the planks' footprints are kept by C1). World 1's gate, the 2 puzzle doors and the 6 keepsake pickups STAY as built story and puzzle items.
