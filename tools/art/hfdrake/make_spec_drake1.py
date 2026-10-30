"""hfdrake1 (2026-10-30): the Drake's teacup ending (9-10). Run by tools/art/hfdrake/storygpu.py (story-art's, copied as is).
  drake-sit-*   edits of his own idle painting (the bucket's stills/w9d-idle.png) by Qwen-Image-Edit-2509: sitting quietly, tail curled,
                every glow gone grey, looking at a tin mug in front of him; then a 0.3 pass with the style model (drake-sitp-*)
  tea-*         his tea things from teastarts.py, 2 strengths x 2 seeds, with the style model
    python3 tools/art/hfdrake/make_spec_drake1.py <commit with the starts>
"""
import json, sys
from pathlib import Path

BASE = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{sys.argv[1]}/tools/art/hfbatch/starts/'
STYLE = ' Soft painted storybook illustration, soft cel shading, thin dark outline, slothadv style.'
SIT = ('Keep this exact same dragon: the same huge dark green armoured lizard drake, same head, same scales, same pale bony back spikes, '
       'same long thick tail, same proportions, side view facing right. Change only his pose and mood: he has given up the fight and sits '
       'down quietly on his haunches like a tired old dog, front legs straight, his long tail curled round in front of his feet, his head '
       'lowered, eyes half shut and gentle, looking down at a small rusty tin tea mug standing on the ground in front of his front claws. '
       'All his colours a little paler and greyer, as if his fire has gone out, a little grey ash dusted on his back, no glow anywhere. '
       'The whole dragon fully in the picture with space all round. Solid flat magenta background, nothing else.')
SIT2 = ('Keep this exact same dragon: the same huge dark green armoured lizard drake, same head, scales, pale bony back spikes and long '
        'thick tail, side view facing right. Make him lie down quietly on his belly with his chin resting on the ground and his tail '
        'curled round, eyes open and soft, looking at a small rusty tin tea mug just in front of his nose. His colours paler and greyer, '
        'his fire gone out, a little grey ash on his back, no glow. The whole dragon fully in the picture. Solid flat magenta background.')
items = []
for tag, p in (('sit', SIT), ('lie', SIT2)):
    for sd in (2, 6):
        items.append({'name': f'drake-{tag}-{sd}', 'start': 'bucket:stills/w9d-idle.png', 'edit': True, 'prompt': p, 'seed': sd,
                      'w': 1024, 'h': 1024, 'neg': 'text, watermark, extra legs, extra heads, two dragons, sloth, fire, flames, glow'})
        items.append({'name': f'drake-{tag}p-{sd}', 'then': f'drake-{tag}-{sd}', 'strength': 0.3, 'seed': 7, 'w': 1024, 'h': 1024,
                      'loras': [['style', 1.0]],
                      'prompt': 'slothadv style, a big dark green armoured drake with pale back spikes, calm and tired, a small rusty tin mug '
                                'in front of him, on a flat magenta background.' + STYLE})
TEA = ('slothadv style, a sprite sheet of separate props on a flat magenta background, side view, evenly lit: top row six small rusty, '
       'dented old tin tea mugs, one huge battered tin mug, and a big dented old tin teapot with a spout and a lid; bottom row a small '
       'fine china tea set kept with great care: two white china teacups with a blue band and a gold rim, full of tea, on saucers, and a '
       'little round white china teapot with a blue band and a gold knob. Each piece separate with clear space round it.' + STYLE)
for s in (0.55, 0.68):
    for sd in (7, 23):
        items.append({'name': f'tea-s{round(s * 100)}-{sd}', 'start': 'start-tea-things.webp', 'prompt': TEA, 'strength': s, 'seed': sd,
                      'w': 2048, 'h': 1024, 'loras': [['style', 1.0]]})
spec = {'note': 'hfdrake1: the Drake teacup ending, 2026-10-30', 'base': BASE,
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors']}, 'items': items}
p = Path(__file__).resolve().parent / 'spec-hfdrake1.json'
p.write_text(json.dumps(spec, indent=1))
print(p, len(items))
