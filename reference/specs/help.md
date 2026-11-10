# Help: when it steps in, and what it does (R-165.60 item 3; R-165.62)

**Status: a design proposal built on benchmarks and on reach.md's flown numbers. The thresholds are NOT flown and NOT yet checked
against tester data; the Analyst's fall-point and stuck-time numbers tune them.** Rules kept: on Easy help steps in by itself; on
Normal it is offered, may be ignored, and the stage never changes by itself (R-165.62). Finishing is never blocked.

## 1. What counts
- **A spot:** one block or gap (the piece he must get onto), not the whole stage.
- **A failure:** a jump at the spot that ends back on the floor he left, or a fall at it. 1-1 has no lethal drops (R-165.53), so
  deaths cannot be the counter: the child tester's 37 minutes cost no lives. The engine already counts tries this way
  (`stuckHelper.ts`, `STUCK_TRIES` 3).
- **Seconds at the spot:** game time within about one screen of it with no new ground reached. The clock catches the player who
  stops trying, which a failure count never does.

## 2. The steps

| Step | Easy (steps in by itself) | Normal (offered; ignorable; the stage never changes by itself) | What it does | Benchmark |
|---|---|---|---|---|
| 1 Say the move again | 3 failures or 20 s | 3 failures or 30 s | Dot names the move the spot needs, once ("Jump, then jump again in the air"). Exists today for the second jump (`stuckLine`) | Crash 2 / 3: quiet help after repeated deaths at one section (STUCK-PLAYERS.md) |
| 2 Quiet forgiveness | 5 failures or 45 s | not given | At this spot only, until he passes: a Pad tap counts as a full jump (220 ms hold). Flown effect: tap,tap on the 128-132 px rise goes from 53% to 100% (touch.md §2). Never told | Crash's unannounced help; Kirby-style forgiveness. It keeps a child's pride |
| 3 Show it | 8 failures or 90 s | 5 failures or 90 s: Dot asks, "Want me to show you?" Yes / No | A ghost Pokey does the move once at the spot, at speed, with the press marks | Odyssey's assist arrows; NSMB U's Super Guide offer at 5 deaths (mariowiki.com/Super_Guide) |
| 4 Get him past | 12 failures or 150 s: a leaf step grows at the spot for this run | 8 failures or 150 s: Dot offers it; only a Yes grows it | One extra step that turns the block into a single jump (a 60 px step under a 128-140 px rise leaves 68-80 px: inside the single-rise band). The clear keeps its petals and stars with a small honest mark | NSMB Wii's Super Guide at 8 deaths, stars marked (mariowiki.com/Super_Guide; kotaku.com, "Your guide to Nintendo's Super Guide") |

## 3. Why these, and which help shames
- Super Guide plays the level for the child and marks the save: children read the green block as "you failed". Here step 4 changes
  one spot, the child still makes the jump, and on Easy nobody announces it.
- Celeste's Assist Mode is a menu the player must find and admit to needing: right for 12 and up, so Normal's help is always a
  question with a No. Easy never asks a child to choose.
- Step 2 before step 3: the cheapest help is the one the player never sees. Step 2 is not given on Normal, because a hop is a
  Normal skill.
- The worst case on Easy is 150 s at one spot, against 37 minutes observed.

## 4. What must be logged (the recorder), so the numbers can be tuned
Each step given, offered, taken or refused, with the spot's piece key and the failures and seconds at that moment. The spots where
step 3 or 4 fires most are the ones the bands are wrong for.

## 5. Not decided here
The words (the story keeper), the leaf step's art (Content, Matt's picture list), where the ghost is drawn (Architect). Each is a
packet after the lead rules on this proposal.
