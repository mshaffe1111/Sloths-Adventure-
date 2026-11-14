# FIX-14b PLAN: 1-4 built to the mocks Matt saw (R-165.212, .229, .227, .206; .216 folded in). 11-14 ~2:20 AM ET
Branch t-fix-14b from origin/t-fix-14@f35253ba + merge of origin/t-len-14@d56cd915 (the rotten fork lives there, not on main; step 4
needs it; one conflict in castBots.test.ts, both tests kept). Packet: ccr-ea739a2f-dfcee4:reference/packets/2026-11-14/FIX-14b.md.
Box: 90 min (to ~3:40 AM ET) or 400k tokens. Built AS SHOWN (the lead's pick); Matt's "drop the pods" stays one line of data.
## Built on (D40)
- The mock patch (FIX-14/mock/mock.patch, t-fix-14-mock) is the shape, rewritten as real code (no MOCK markers, tests, no code-drawn art).
- Art: ART-MATT pushed Matt's sheet 1 + 2 cuts on t-art-matt@11490e83 (w1m-tie-taut/strain/snap, w1m-leaf-lid, w1m-dust-puff,
  w1m-bark-chips-1..7, HF w1m-pod-hang/fall). I bring those files + their catalog rows over (inventory first), never a stand-in.
## In order (cut from the bottom if the box runs out; never a check)
1. Fig gate: GATE.headDrawn (89, heroSprite's drawn height) in vineField.ts; FieldPlay.shutBoughAt/capY: under a shut gate his FEET stop
   at the drawn bough underside + his drawn height, on the one-hand climb, the two-hand climb, the plain climb and the jump (GATE.lid
   becomes the head rule). A fig frees when its top passes the DRAWN (sagged) bough top. Lock moment: tie taut -> straining (by push %) ->
   SNAP (painted sheet-1 states + chips burst), thatch (leaf lid) thrown off on the last. Planted tests (fieldGate.test.ts): Matt's case
   (push full, hold up, jump, climb the gate's own vine: head never above the underside) + R-165.223's skip probe (jump/climb/walk-around
   a shut gate: never on the bough). Each planted fault: red then green.
2. Two vines: a side push while climbing takes the other hand (today only when up/down are NOT held: the stop-start); two hands 1.6x up
   measured; one vine slides 2x down (exists, measured); petals on a paired stretch laid BETWEEN the pair (mid x) + planted test: every
   such petal is inside the pickup reach of a two-hand hang; the reward pair (two petals side by side between the vines).
3. Pods: one data block in w1Arc14.ts (on, speed 300, tell 1.5, beats 4.6/4.2/3.6; Easy x1.5): dropping them = `on: false`. The
   tell: the vine itself brightens + shakes along its length for the whole tell (a lit pass over its own painted art), dust-puff + bark
   chips sifting (sheet 2), HF pod art for hang/fall. Planted: speed and tell read from the data.
4. Fork: >= 80 px of ledge past a ledge-end link vine (proposed level.md rule + its lay test over every roll), creak dip re-chased,
   castBots 40 before/after, adult Easy >= 100 s.
5. ONE relist (addlevel --relist); clips (stepped frames) upright + sideways, Normal + Easy; full CLAUDE.md Checks on the head; REPORT.
