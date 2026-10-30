"""The Drake tea scene's pieces for the story (story-a wires them; THE WEEKS AFTER), cut from hfdrake1/hfboss910a/hfdrake2 takes into
src/assets/story/drake/, each keyed off magenta and trimmed, facing right:
  tea-cup0.webp, tea-cup1.webp   the two good china cups on saucers (hfdrake1 tea-s68-23)
  tea-pot.webp                   the good china teapot
  tea-mugbig.webp, tea-pottin.webp  his huge tin mug and his battered tin pot (the hoard's)
  drake-bowed.webp               sitting, grey, head bowed over a mug (hfboss910a drake-teap-2; the mug cut away)
  drake-sit.webp, drake-cup.webp sitting upright, stiff; holding a china cup in both claws (hfdrake2, when picked)
  drake-cave.webp                the cave plate, 2560 x 2720 (hfdrake2, when picked)
    python3 -I tools/art/hfdrake/storycut.py <takes dir> <game checkout> [sit pick] [cup pick] [cave pick]
"""
import sys
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / 'hfbosses'))
sys.path.insert(0, str(HERE))
TAKES, GAME = Path(sys.argv[1]), Path(sys.argv[2])
extra = sys.argv[3:]
sys.argv = [sys.argv[0], str(TAKES), str(GAME)]
from bosscut_lib import cut, review  # noqa: E402
from keyfix import flatten_key  # noqa: E402

OUT = GAME / 'src/assets/story/drake'
OUT.mkdir(parents=True, exist_ok=True)
tea = Image.open(TAKES / 'tea-s68-23.webp').convert('RGB')
done = []
for name, box, mw in (('tea-cup0', (180, 660, 540, 940), 240), ('tea-cup1', (530, 660, 880, 940), 240), ('tea-pot', (960, 600, 1420, 930), 300),
                      ('tea-mugbig', (1140, 130, 1520, 470), 260), ('tea-pottin', (1520, 110, 2040, 470), 360)):
    p = cut(tea, 'magenta', box, mainOnly=True)
    if p.width > mw:
        p = p.resize((mw, round(p.height * mw / p.width)), Image.LANCZOS)
    done.append((name, p))
# (the mug at his claws is painted out: in the story Pokey brings the cups)
bim = flatten_key(Image.open(TAKES / 'drake-teap-2.webp'))
bim.paste((255, 0, 255), (745, 630, 880, 745))
bow = cut(bim, 'magenta', mainOnly=True)
done.append(('drake-bowed', bow))
for name, pick in zip(('drake-sit', 'drake-cup'), extra[:2]):
    done.append((name, cut(flatten_key(Image.open(TAKES / f'{pick}.webp')), 'magenta', mainOnly=True)))
for name, p in done:
    p.save(OUT / f'{name}.webp', 'WEBP', quality=90, method=6)
    print(name, p.size)
if len(extra) > 2:
    Image.open(TAKES / f'{extra[2]}.webp').convert('RGB').save(OUT / 'drake-cave.webp', 'WEBP', quality=86, method=6)
    print('drake-cave')
review('drake-story', done)
