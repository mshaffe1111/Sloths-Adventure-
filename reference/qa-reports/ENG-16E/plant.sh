#!/bin/bash
# ENG-16E planted faults (R-165.246): each a one-line break in a SIDE worktree ($1, never the tree a measurement runs from: BUILD-16d's
# lesson), its tests run, the file restored. Each must go RED. Usage: bash plant.sh <worktree>
WT=$1
plant() { F=$WT/$4; cp $F $F.orig; sed -i "$2" $F; if ! grep -qF "$3" $F; then echo "$1 NOT PLANTED"; cp $F.orig $F; rm $F.orig; return; fi
  r=$(cd $WT && timeout 900 npx tsx --test $5 2>&1 | grep -E '^# fail'); cp $F.orig $F; rm $F.orig
  echo "$1 $r $( [ "$r" != '# fail 0' ] && echo RED || echo GREEN-MISSED)"; }
P=src/game/petals.ts; PT=src/game/petalFill.test.ts
L=src/game/gen2/pipeline.ts; Y=src/game/physics.ts; LT=src/game/gen2/worlds/w1ForwardEnd.test.ts
plant "B1 the fill's off-path guard off (a trail on a pit floor, a thorn bed, off a creaky limb is picked)" "s/        if (away(t)) continue;/        if (false \&\& away(t)) continue;/" "if (false && away(t))" $P $PT
plant "B2 a creaky limb is on the path (offPath forgets fragile)" "s/ || p.type === 'fragile' || spans.some/ || spans.some/" "!!p.catch || spans.some" $P $PT
plant "B3 a hurt floor is on the path (offPath forgets pit 'hurt')" "s/  p.pit === 'hurt' || !!p.catch/  !!p.catch/" "  !!p.catch || " $P $PT
plant "B4 a heart-fall zone is no fall (fallSpans reads gen2 falls only)" "s/  const zones = (stage.heartFalls ?? \[\]).map/  const zones = ([] as NonNullable<GeneratedStage['heartFalls']>).map/" "([] as NonNullable<GeneratedStage['heartFalls']>)" $P $PT
plant "A1 the perch band ignores the testers' let-go (lianaBand's forward guard off)" "s/  while (hi >= lo \&\& !(linked(hi) \&\& forward(hi))) hi -= 20;/  while (hi >= lo \&\& !(linked(hi) \&\& (true || forward(hi)))) hi -= 20;/" "(true || forward(hi))" $L $LT
plant "A2 the forward-end let-go drifts from the bot's (FORWARD_END 0.75 -> 0.6)" "s/^export const FORWARD_END = 0.75;/export const FORWARD_END = 0.6;/" "export const FORWARD_END = 0.6;" $Y $LT
E=src/game/engine.ts; ET=src/game/swingLate.test.ts
plant "A3 the late press leaps off the engine's full swing (the sweet snapshot without the vine's amp, as before ENG-16E)" "s/len: sw.len, amp: sw.amp, dir: p.facing, at: this.gameTime/len: sw.len, dir: p.facing, at: this.gameTime/" "{ angle: sw.angle, omega: sw.omega, len: sw.len, dir: p.facing" $E $ET
echo restored
