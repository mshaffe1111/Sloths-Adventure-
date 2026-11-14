# FIX-15b PUSHBACK (R-165.212): the lay rule as packeted cannot be laid. With it 1-4 rolls 0 of 40. Engine, Opus 5.5. Branch t-fix-15b from t-fix-15 8afe53a9.

## The evidence (every figure from a command run on this branch or on base 8afe53a9; files beside this one)
- **Before, the same measure as FIX-15** (`tools/engine/gatereach.ts 1-4 --layouts 16 --margin 0`, layouts 0-15 x 2 settings): 192 gates,
  LOW 48, ONTO 93. That is FIX-15's exposure-16-layouts.txt line for line (gatereach-before.txt).
- **With the lay rule** (towerCatches' byGate refuses wood that `sealedNear` names, and towerGates refuses a roll that has it; the full
  change and its planted tests are in lay-rule-NOT-APPLIED.patch): `yield.ts 1-4 --from 1001 --count 40`: **Normal 0/40, Easy 0/40 clean**
  (base: 40/40 and 40/40). All 40 rolls are refused by towerFalls ("a fall off the piece ... drops N px"). Files: yield-lay-rule.txt and yield-base.txt.
- **Why this is geometry, not tuning** (seed 1 = layout 0, gate 594-1034 y 4909; I logged the lay step by step locally, no commit): the storey laid
  just above a gate (281 px up, its vine standing on the gate) leaves open ends 28-32 px past the gate's ends: piece 590-990 y 4628 under a
  40 px step up (350-590 y 4588), and piece 1090-1188 y 4628 past a section gap. A fall from those ends goes past the gate to its field's foot,
  661 px down. A catch has to sit within 450 px of the end (TOWER.fall, STAGE-RULES "Falls in climbs"). That puts it at most 169 px under
  the gate's line and 0-32 px from its end. Every such spot is within a double jump of the sagged top (LEAP.up 221 + GATE.sag 56 = 277 px).
  Step 3 (run on) is blocked by the step piece, and step 2 has no anchor. In step 4, every y from 40 px under the end down to the limit is refused.
  The old lay hung that catch at 476-656 y 5008 (99 px under the line). That is the wood INT-8 stood on to land on the gate.
- **The head-room half alone** (LOW in the lay and the verdict, ONTO not refused) is feasible: Normal 20/40, Easy 18/40 clean, about 2.2 seeds
  per kept roll (yield-headroom-half.txt). It does not answer Matt's "it let me go above the platform".

## Options (my recommendation first)
- **A (recommended): catches the lay hangs BESIDE a shut gate are held with the gate.** This is the mechanism its run-ons already use (`ClusterGate.with`:
  no footing and not drawn while it is shut, whole again when it opens). These catches only serve falls from the storey above, and he can only
  reach that storey through the open gate. LOW wood (under its span: his head is in the wood even when the gate is open) stays refused in the lay. It needs:
  the laid stage to name those catches (gen2.tower: Architect), 1-4's finish to add them to `with` (w1Arc14.ts: level builder or Content), and
  towerGates to skip held wood (Engine); then the relist. Expected yield is about the head-room half's (45-50%), still to be measured. Design call (the
  Designer, Matt's polish bar): boughs appearing beside the gate as it springs open. The gate-level `with` boughs already do this.
- **B: lay the storey above a gate so its ends lie over the gate** (the open gate catches them) or out of a jump's reach of it. This is the
  pipeline.ts sealed-exit placement (Engine). Bigger change; yield unknown.
- **C: the head-room half and the flag rule only.** He can still stand on the shut top from beside it. FIX-15 measured that he can't go on from
  there (0 of 1152 tries), and with the flag rule the top gives him nothing. Not recommended: Matt's ask stands.

## Done on the branch (no roll moves)
- Item 3, the gate's own flag: `FieldPlay.flagWaits` + the engine's claim loop. Planted test `fieldGate.test.ts` "a flag on a shut gate's own
  bough waits for the gate". It is red on today's engine ("normal layout 0 gate 4: the flag on the shut bough was claimed from its top") and green with the fix, on both settings.
- `tools/engine/gatereach.ts`: the exposure measure (self-contained, so it runs on any base).

## Not done (waits on the ruling; D40: no relist on a lay about to change)
The lay rule and verdict, the 1-4 relist and re-pins, castBots, the clips, the full Checks.
