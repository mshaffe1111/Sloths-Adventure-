"""hfdrake2 (2026-10-30): what story-a's Drake tea scene (THE WEEKS AFTER) needs that hfdrake1 did not make. Run by storygpu.py.
  drake-cave     the plate: the Drake's cave on the lava road, "tidied" (everything shoved into one corner behind a big rock, a huge lumpy
                 knitted tea cosy poking out), warm lava light, the floor line about 0.85 down: an edit of the World 9 lair painting at
                 1280 x 1360, then a tiled 0.3 pass with the style model at the plate size (2560 x 2720), as story-art's plates
  drake-sit      sitting upright facing right, calm, a little stiff and formal (edit of hfboss910a's drake-teap-2, his tea-scene look)
  drake-cup      the same, a small white china teacup held in both front claws
    python3 tools/art/hfdrake/make_spec_drake2.py <commit with the starts>
"""
import json, sys
from pathlib import Path

BASE = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{sys.argv[1]}/tools/art/hfbatch/starts/'
STYLE = ' Soft painted storybook illustration, soft cel shading, thick dark outline, slothadv style.'
DRAKE = ('Keep this exact same dragon: the same big grey-green armoured lizard drake, same reptile head with a long flat snout, same big '
         'plate scales and pale back spikes, same long tail, side view facing right. ')
CAVE = ('Turn this into the inside of the same volcano dragon cave, seen from the side, on a quiet cold morning after: the cave has '
        'been tidied in a hurry, all the gold coins, mugs and junk shoved into one heap in the left corner with a big round boulder pushed '
        'in front of it, and a huge lumpy hand-knitted tea cosy, far too big, poking out from behind the boulder. Warm orange lava glow '
        'from a crack in the back wall, dark rock walls and a rocky ceiling, a flat empty stone floor across the bottom fifth of the '
        'picture. No characters. Same painted style and colours.')
items = []
for sd in (2, 6):
    items.append({'name': f'drake-cave-e{sd}', 'start': 'start-lair-drake-calm.webp', 'edit': True, 'prompt': CAVE, 'seed': sd, 'w': 1280, 'h': 1360})
    items.append({'name': f'drake-cave-{sd}', 'then': f'drake-cave-e{sd}', 'up': [2560, 2720], 'tile': [1280, 192], 'strength': 0.3, 'seed': 7,
                  'w': 2560, 'h': 2720, 'loras': [['style', 1.0]],
                  'prompt': 'slothadv style, the inside of a volcano dragon cave, warm lava glow, a heap of junk behind a boulder, a huge knitted '
                            'tea cosy, flat stone floor.' + STYLE})
    for tag, p in (('sit', 'Change only his pose: he sits upright on his haunches facing right, front legs straight, tail curled round his '
                           'feet, head up, calm but a little stiff and formal, like a nervous host, eyes open and kind. No mug. Solid flat '
                           'pure bright magenta (#FF00FF) background.'),
                   ('cup', 'Change only his front claws: he sits upright facing right and holds a small white china teacup with a blue band '
                           'carefully in both front claws in front of his chest, looking down at it, shy. No other mug. Solid flat pure '
                           'bright magenta (#FF00FF) background.')):
        items.append({'name': f'drake-{tag}-{sd}', 'start': 'bucket:hfboss910a/out/drake-teap-2.png', 'edit': True, 'prompt': DRAKE + p,
                      'seed': sd, 'w': 1024, 'h': 1024, 'neg': 'text, watermark, extra legs, extra heads, two dragons, sloth, fire, glow'})
spec = {'note': 'hfdrake2: the Drake tea scene for story-a, 2026-10-30', 'base': BASE,
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors']}, 'items': items}
p = Path(__file__).resolve().parent / 'spec-hfdrake2.json'
p.write_text(json.dumps(spec, indent=1))
print(p, len(items))
