# ENG-S2 PLAN (t-eng-s2 from origin/t-eng-s1@a1739b43; packet reference/packets/2026-11-14/ENG-S2.md on the lead's branch). Written 4:00 AM ET 11-14.
Box: 3:55-5:25 AM ET or 40% context (400k of 1M). Context now ~10%.

Read: LAWS, LESSONS (D40, D59, D61-D64), roles/README, ENGINE.md, ENG-S1 REPORT (EXACT NEXT STEP), 1-6.md on t-16-design@c99917f1,
stage-piece.md, PREDATORS.md (tell >= 0.5 s), the art on a93e335 (beside-2: hang 115 u, slide 62.7 u, liana 36 u, hiss 60 u; ART's -28 deg brown).

Built on (D40): the piece hook (pieces/index.ts, ENGINE-678 W0), the self-swing (physics.ts vineAngle; the engine writes v.swingAngle
on the stage's own Vine objects each step BEFORE pieces step, engine.ts:1683-1688 then :1782), the stage clock (clock.ts; ClockDef with
'warn' before 'on' enforced by checkClock). Nothing planned this sprint replaces them.

## Order (cut scope from the bottom, never a check)
1. **host.letGo()** (lead ruling 3:55): one method on PieceHost (stagePiece.types.ts), engine: if he holds a liana he lets go with a
   startle hop (never a bite, no heart), that liana is not caught again for a cooldown; documented in stage-piece.md; planted test.
2. **The vine snake piece** (src/game/vineSnake.ts pure + src/game/pieces/vineSnakePiece.ts): by data on a liana, a snake row on the
   stage clock (off -> warn = the tell >= 0.5 s at its start end -> on = travels the grip line -> rest). Routes: down-and-off,
   down-and-back (stops at a share, climbs back), up-from-the-foot. Drawn on the liana at its swing angle, head first. Touching his
   HANDS (his grip share) during 'on'/'rest' -> host.letGo(). Never hurts (hurts() returns null).
   DATA: needs one optional field on Vine (types.ts, the Architect's): `snake?: import('./vineSnake.ts').VineSnake`, the Platform.ride
   precedent. Asked the lead (message at plan push); built so the field is the only types.ts line.
   Planted tests: pure position/route/tell math; RealPlay on 2 worlds' real lianas (pieceHook.test.ts template): he lets go when it
   reaches his grip, not before the tell, never when he holds above/below it; red without the piece.
3. **Art**: a93e335's four w16-vinesnake-* cuts recoloured BROWN (lead ruling) by a script; a still beside a green liana FIRST.
   Catalog rows for what ships (inventory first).
4. **Clips** (D63): the whole action on the real page, upright 412x915 + sideways 915x412: snake's tell, slide, his let-go.
5. **Gates**: the full CLAUDE.md Checks + CI's lists in their own worktree (D36), waited for (D59); lockall shows 0 stages changed.
6. If time: item 2 of the packet (the false liana: a still snake from a bough, the startle-drop via letGo). Item 3 (chains, LIANA
   length per row, LONG with a dial) and the gen2 snake lay + letter: EXACT NEXT STEP if the box ends first.
