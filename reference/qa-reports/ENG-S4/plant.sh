#!/bin/bash
# ENG-S4 planted failures: each mutation applied alone, snakeCam.test.ts run, the tree restored
cd /home/user/Sloths-Adventure-
H=$(git rev-parse --short=8 HEAD)
echo "# ENG-S4 planted failures on the working tree over $H (each mutation applied alone, snakeCam.test.ts run, tree restored)"
plant() { # name file python-replace
  echo "## $1"
  cp "$2" /tmp/plant.bak
  python3 -c "import sys;p='$2';s=open(p).read();a=sys.argv[1];b=sys.argv[2];assert a in s,'PLANT MISSING';open(p,'w').write(s.replace(a,b,1))" "$3" "$4" || { echo "PLANT NOT APPLIED"; return; }
  npx tsx --test src/game/snakeCam.test.ts 2>&1 | grep -E "^not ok|^# (pass|fail)"
  cp /tmp/plant.bak "$2"
}
plant "M1 the verdict ignores the level's top and foot (vineSnake.ts: the view's top is the focus's aim)" src/game/vineSnake.ts "const top = Math.max(v.lo, Math.min(v.hi, aim));" "const top = aim;"
plant "M2 no tell rule where the box fits (vineSnake.ts)" src/game/vineSnake.ts "if (fits && tellsSeen + 1 < tells) {" "if (false) {"
plant "M3 settledView forgets the level-height floor on the zoom (cameraFollow.ts)" src/game/cameraFollow.ts "const zoom = Math.max(usualZoom(w, h, levelH), h / levelH) / widen;" "const zoom = usualZoom(w, h, levelH) / widen;"
plant "M4 the verdict judges sideways only (vineSnake.ts default phones)" src/game/vineSnake.ts "phones: ReadonlyArray<readonly [number, number]> = [...VIEW_PHONES.side, ...VIEW_PHONES.up]" "phones: ReadonlyArray<readonly [number, number]> = [...VIEW_PHONES.side]"
plant "M5 the band in world px is the sideways one upright too (cameraFollow.ts settledView)" src/game/cameraFollow.ts "band: (h > w ? HUD_BAND.port : HUD_BAND.land) / zoom" "band: HUD_BAND.land / zoom"
plant "M6 snakeFaults judges the stage's lianas as if roomy (vineSnake.ts)" src/game/vineSnake.ts "{ anchorY: v.topY, levelH: st.config.levelHeight }" "ROOMY_SITE"
plant "M9 the level check counts a false liana as a way on (levelCheck.ts)" src/game/levelCheck.ts " && !isFalseLiana(v));" ");"
git status --short src/
