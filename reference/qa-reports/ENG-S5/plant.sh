#!/bin/bash
# ENG-S5 planted failures: each piece taken out in a throwaway worktree at HEAD, the chain tests run; each must go red.
# bash reference/qa-reports/ENG-S5/plant.sh <scratch dir>
set -u
SP=$1; REPO=$(pwd); HEAD=$(git rev-parse HEAD)
run() { # name, python snippet that edits the tree
  local W=$SP/plant-$1; rm -rf $W; git worktree add -f -q $W $HEAD; ln -s $REPO/node_modules $W/node_modules
  (cd $W && python3 -c "$2" && timeout 900 npx tsx --test src/game/gen2/worlds/w1Chain.test.ts > $SP/plant-$1.txt 2>&1)
  echo "$1: $(grep -E '^# (pass|fail)' $SP/plant-$1.txt | tr '\n' ' ') $(grep -E '^not ok' $SP/plant-$1.txt | cut -c1-90 | tr '\n' ';')"
  git worktree remove --force $W
}
# 1. the walk's chain step (levelCheck 3a) gone
run walk "
p='src/game/levelCheck.ts'; s=open(p).read()
s=s.replace(\"if (A === B || !isChain(A, B) || chainLines(A, B, allowDouble) < 6) continue;\", \"if (true) continue;\",1); open(p,'w').write(s)"
# 2. the gen2 chain lay gone (a swing after a liana lays as after a ledge, as before ENG-S5)
run lay "
p='src/game/gen2/pipeline.ts'; s=open(p).read()
s=s.replace(\"} else if (pl.kind === 'swing' && ref(pl.after).hang?.kind === 'liana') {\", \"} else if (pl.kind === 'swing' && false) {\",1); open(p,'w').write(s)"
# 3. the view rule gone from the chain window (every press counts)
run seen "
p='src/game/gen2/pipeline.ts'; s=open(p).read()
s=s.replace('(px) => far <= px + SWING_SEEN) / 1000;', '() => true) / 1000;',1); open(p,'w').write(s)"
# 4. the swing camera's lead onto the next liana's whole swing gone
run camera "
p='src/game/cameraFollow.ts'; s=open(p).read()
s=s.replace('if (whole && best.sweep) return lianaBox(best.x, best.sweep, best.y, f);', '',1); open(p,'w').write(s)"
# 5. Easy's moss: the hurt floor on every setting
run easy "
p='src/game/gen2/pipeline.ts'; s=open(p).read()
s=s.replace(\"const hurt = !!pl.hurt && !pl.water && budget.difficulty !== 'easy';\", 'const hurt = !!pl.hurt && !pl.water;',1); open(p,'w').write(s)"
# 6. the chain row's ends as 24 px boughs again (the thorn hollow has no lips: never painted)
run banks "
p='src/game/gen2/worlds/w1Swing.ts'; s=open(p).read()
s=s.replace(\"const bank = (pc: SectionPiece): SectionPiece => ({ ...pc, shape: 'bank', style: 'moss_stone' });\", 'const bank = (pc: SectionPiece): SectionPiece => pc;',1); open(p,'w').write(s)"
