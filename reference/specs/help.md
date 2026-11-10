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
| 2 Quiet forgiveness | 5 failures or 45 s | not given | At this spot only, until he passes: a Pad tap counts as a full jump (220 ms hold). Expected effect, inferred and not flown as such: a tap held 220 ms is the flick, and flick,flick climbs the 128-132 px rise on 100% of the grid, where tap,tap manages about half (a fixed grid of 165 tries with a 66 ms press I chose; not a player rate until the hold data is read). Never told | Crash's unannounced help; Kirby-style forgiveness. It keeps a child's pride |
| 3 Show it | 8 failures or 90 s | 8 failures or 90 s: Dot asks, "Want me to show you?" Yes / No | A ghost Pokey does the move once at the spot, at speed, with the press marks | Odyssey's assist arrows. The 8 is a proposal, set to match §4 |
| 4 Get him past | 12 failures or 150 s: a leaf step grows at the spot for this run | 12 failures or 150 s: Dot offers it; only a Yes grows it | One extra step that turns the block into a single jump: 70 px high on Easy (under a 128-132 px rise it leaves 58-62, inside Easy's 63) and 60 px on Normal (136-140 leaves 76-80, inside 80). Arithmetic on the bands, not flown. The clear keeps its petals and stars with a small honest mark | NSMB Wii's Super Guide at 8 deaths, stars marked (mariowiki.com/Super_Guide; kotaku.com, "Your guide to Nintendo's Super Guide") |

## 3. Why these, and which help shames
- Super Guide plays the level for the child and marks the save: children read the green block as "you failed". Here step 4 changes
  one spot, the child still makes the jump, and on Easy nobody announces it.
- Celeste's Assist Mode is a menu the player must find and admit to needing: right for 12 and up, so Normal's help is always a
  question with a No. Easy never asks a child to choose.
- Step 2 before step 3: the cheapest help is the one the player never sees. Step 2 is not given on Normal, because a hop is a
  Normal skill.
- The worst case on Easy is 150 s at one spot, against 37 minutes observed.

## 4. Help after put-backs in ONE piece (for the Engine's help packet; ships with the no-lives fix)
A **put-back** is the game setting him back after a fall. They are counted per **piece** (the piece he was trying to reach when he
fell). The tester data behind it (the lead's figures, aggregates): one Easy player was put back 152 times in one piece over 22.5
minutes with no help, one put-back every 9 s; on Normal put-backs cluster at the double gaps.
**Every number below is a PROPOSAL** (benchmarks and that data), none flown, except where marked.

| Put-backs in the same piece | Easy: steps in by itself | Normal: offered, may be ignored, the stage never changes by itself |
|---|---|---|
| 3 | Dot says the move the piece needs, once | the same line, once |
| 5 | Quiet forgiveness at this piece: a Pad tap is a full jump (220 ms hold; effect inferred from the flown flick, §2 step 2) | nothing |
| 8 | A ghost Pokey shows the move once | Dot asks "Want me to show you?" Yes shows the ghost; No does nothing |
| 12 | The step grows by itself: 70 px under a rise; on a gap, a 60 px wide pad at its middle. It stays for this run | Dot offers the step (60 px under a rise; on a 252-262 px gap a 60 px pad leaves two gaps of about 100 px, inside 143). Only a Yes grows it. After a No, Dot asks again once, 8 put-backs later, then never at that piece |

- **At the tester's rate (9 s a put-back) Easy's last step lands at about 1 min 50 s**, against 22.5 minutes with nothing.
- **What resets the count:** standing on the piece beyond (he passed), or the stage ending (cleared, left or restarted). **What
  does not:** a put-back, a pause, time passing, a refused offer, a help step already given.
- **What stays:** a step that grew stays until the stage ends. The quiet forgiveness ends when he passes the piece.
- **ONE count drives the steps: put-backs in the piece, on this table** (Easy 3 / 5 / 8 / 12; Normal 3 / none / 8 / 12). §2's
  "failures" are this same count and carry the same numbers; §2 adds only the seconds, for the player who stops trying. A step
  fires at its count or its seconds, whichever comes first, and never twice.
- **The record:** a clear with a grown step keeps its petals and stars with the small honest mark (§2 step 4).

## 5. What must be logged (the recorder), so the numbers can be tuned
Each step given, offered, taken or refused, with the spot's piece key and the failures and seconds at that moment. The spots where
step 3 or 4 fires most are the ones the bands are wrong for.

## 6. Not decided here
The words (the story keeper), the leaf step's art (Content, Matt's picture list), where the ghost is drawn (Architect). Each is a
packet after the lead rules on this proposal.
