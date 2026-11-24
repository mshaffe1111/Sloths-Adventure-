# ENG-28 PUSHBACK (session 5, ENG-28e): ruling (b), "change the toy's shape so walking off the wall-step is the low road", has no shape

The ruling asks for a toy fork where, with NO bot change, the bot walks off the wall-step W onto the low road on the low route and still
reaches the high road on the high route, and the flood check (flood.ts highRoad, the widened rule) passes it. Read from the code, no such
shape exists. The proof, each step from a line:

1. The bot's edge press (tools/inspect/firsttimer.ts:3194-3201, `if (!ahead)`): at any edge with nothing within 40 px below ahead, a
   piece whose top is within 50 px of his height, starting within 150 + edgeAim px ahead (172-211 px for the middle and adult), is
   `across`: he jumps onto it "whatever the way does after it". He walks off (`drops`) only when nothing is across.
2. The flood check (flood.ts:113-150; floodLay.ts FLOOD_STEP 60, FLOOD_HOP 60): every next piece of the high road starts within 60 px
   ahead and is at most 60 px up or down; every step UP is a wall-step (its face where he stands, reaching down to his feet).
3. The first piece W is a wall-step on the near bank, so both routes meet its face and climb it (it is in the low road's lane). The two
   routes must part on W's top. From W's top the high road's next piece P is, by 2: (i) UP: a wall-step, its face on W's top, so in the
   lane: both routes bump it and climb (no walk-off); (ii) LEVEL or up to 49 px down: within 60 px ahead, so by 1 it is `across` from
   W's far edge: both routes hop onto it (today's toy: 'time enough' middle seed 1 goes high, session 4 FINDING 2a); (iii) 50-60 px DOWN:
   W's top is at most 60 px over the bank (2), so P is at most 10 px over the bank, at the low road's level, not a high road; and from the
   bank's lip P (within 50 px of the bank) is `across` again.
4. Moving the walk-off to the bank's lip instead (W not in the low lane) makes W a piece out over the water with room under it: the
   check refuses it by name ('starts with a bare edge hop'), as the ruling wants.
So every shape the check passes is either hopped onto from the low road's walk-off (1) or walked into (the wall-step's face).

## The options I see (the lead's call; I have built none of them)
A. A bot change after all, narrow: the edge press's `across` jump skips a piece on a flood's high road while the bot's way is the low road
   (the read made, no reroute): he walks off as the route says. The read's reroute already names the chain (floodRoad), so the bot knows
   which pieces are the high road. Risk: small; the hop is still taken on the high route and on every other stage (the flood's chain
   only exists on a flood stage). Proven on the toy as it is, lineBot 7 of 7 the target.
B. Keep the bot and the toy, and change what 'time enough' asserts (either road, nobody set back, all three home). That is a test changed
   to fit the bot, and the planted RED then needs a toy where the late low road is forced; I would not do it without the lead's word
   (law 22).
C. A different high road for 2-8 (the Designer's/Content's): a climb the line takes (a vine, a ramp), which is not in FLOOD_STEP's rule
   today. Out of my lane.
My recommendation: A. It is one condition in the edge press, read from the reroute the bot already makes, and it makes the bot behave
as the design says a first-timer leads: the low road when there is time.

Session 5's other results do not wait on this (rule 3: never wait mid-task): (a) is fixed and GREEN; (c) goes on.

## The lead's answer (recorded as asked, condition 4)
PUSHBACK ACCEPTED: the 'toy shape, no bot change' ruling was wrong; the reach numbers settle it. RULED: option A, written as a GENERAL
rule, not a flood special case: once the bot has read its road at a fork (today only the flood's read), the edge press does not take a
piece that belongs to the OTHER road; no fork read means no change. Conditions: (1) a toy each way: 'time enough' middle seed 1 goes LOW
with the rule, HIGH with it off (the planted split restored); (2) proof it touches no shipped stage: count the rule's trips on every
listed stage; 0 outside the flood toys, else stop and tell the lead the stage and count; (3) tierBots 9/9 and no calibration change;
(4) this answer recorded here. Then (c) and the rest as planned.
Read as: with the water read switched off (LINE_SKILL.leadLine false) he still has his road at the fork, the way's own (the low road),
so the planted 'read removed' toy keeps its late low road.

## What session 5 found building it (for session 6)
- BUILT (firsttimer.ts LINE_SKILL.keepRoad, ROAD_TRIPS): at the fork read the other road's pieces are kept aside (the high road's chain
  when he keeps the low road; the low road's pieces under the banks within its span when the read sends him round); the edge press
  neither reads a kept piece as his floor ahead nor jumps onto one across; a piece he stands on is never kept (without that, the adult who
  had fallen onto the walkway after a reroute read his own floor as gone and ended stranded: fixed, 'too late' 6/6 GREEN again).
- NOT ENOUGH: 'time enough' middle seed 1 still goes HIGH. The rule trips (ROAD_TRIPS counts it) but no jump is involved: Pokey is 44 px
  wide (engine.ts player width), so a 60 px LEVEL gap is about 16 px of air at a run; he walks off the wall-step at full speed and lands on
  the porch (trace: y 740 all the way from x 934 to 1007). On 2-8's real fork every level piece within FLOOD_HOP is the same: a run carries
  him onto the high road. Keeping the low road needs a STEP-OFF: at an edge where the rule tripped and the way drops, he stops at the lip
  and steps off from a stand, so he falls short of the other road's piece. That is the next step; it is inside the ruling (the edge press
  does not take the other road's piece) but it is a new move, so it is named here before it is built.
