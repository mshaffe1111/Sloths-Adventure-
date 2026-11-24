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
