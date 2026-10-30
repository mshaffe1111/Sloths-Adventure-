"""hfboss910a (2026-10-30): the new boss poses for 9-10 and 10-10 (reference/boss-design/9-10-and-10-10.md §6, 9-10 item 4 and 10-10
item 4, on boss-design-9-10), as edits of each boss's own stills in the bucket (stills/w9d-*, stills/w10ic-*) by Qwen-Image-Edit-2509,
two seeds each, then a 0.3 pass with the style model. Run by tools/art/hfdrake/storygpu.py.
    python3 tools/art/hfdrake/make_spec_boss910a.py
"""
import json
from pathlib import Path

STYLE = ' Soft painted storybook illustration, soft cel shading, thin dark outline, slothadv style.'
DRAKE = ('Keep this exact same dragon: the same huge dark green armoured lizard drake, same head, scales, pale bony back spikes, long '
         'thick tail, glowing yellow eyes and proportions, side view facing right. ')
GEN = ('Keep this exact same character: the same big old armoured sloth general with dark grey-brown fur, red eyes, the spiked grey '
       'shoulder plate, the torn dark red cape and red scarf, same face and proportions, side view. ')
END = ' The whole body fully in the picture with space all round. Solid flat magenta background, nothing else.'
POSES = {
    'drake-breathdown': ('stills/w9d-enrage.png', DRAKE + 'Change only his pose: he rears up on his back legs, his back spikes glowing hot '
                         'orange, his neck bent and head pointing straight DOWN at the ground in front of him, mouth open, breathing a '
                         'short burst of fire down into the ground.'),
    'drake-winded': ('stills/w9d-stunned.png', DRAKE + 'Change only his pose: he is out of breath, standing on all fours with his head '
                     'hanging low and drooping near the ground, eyes half shut, grey smoke curling from his nostrils, his sides heaving.'),
    'drake-cling': ('stills/w9d-leapprep.png', DRAKE + 'Change only his pose: he clings to a vertical rock wall with all four claws, '
                    'his body flat against it, seen from the side as if climbing upward, his tail hanging down, his head turned to look '
                    'over his shoulder. Draw only a narrow strip of dark basalt rock wall behind his claws.'),
    'gen-aboutface': ('stills/w10ic-idle.png', GEN + 'Change only his pose: a stiff parade-ground about-face, standing bolt upright, '
                      'chin up, chest out, the club held stiffly at his side, mid-turn on one heel.'),
    'gen-chairlift': ('stills/w10ic-overhead1.png', GEN + 'Change only what he holds and his pose: no club; he lifts a big heavy plain wooden '
                      'chair with a tall back high over his head with both arms, ready to throw it.'),
    'gen-throw': ('stills/w10ic-overhead1.png', GEN + 'Change only his pose: no club; he has just thrown something forward with both arms, '
                  'arms stretched out in front, leaning forward, one foot stepping forward, his cape swinging.'),
    'gen-peek': ('stills/w10ic-idle.png', GEN + 'Show only his head, his spiked shoulder plate and his two clawed hands gripping the top '
                 'edge of a tall plain wooden wall, peeking over it suspiciously; the rest of him is hidden behind the wall. Draw the top '
                 'of the wooden wall as a flat brown band across the bottom of the picture.'),
    'gen-paw': ('stills/w10ic-charge.png', GEN + 'Change only his pose: he paws the ground with one back foot like a bull about to charge, '
                'his shoulder dropped low with the spiked shoulder plate forward, head down, glaring, the club held low behind him.'),
}
items = []
for n, (st, p) in POSES.items():
    for sd in (2, 6):
        items.append({'name': f'{n}-{sd}', 'start': f'bucket:{st}', 'edit': True, 'prompt': p + END, 'seed': sd, 'w': 1024, 'h': 1024,
                      'neg': 'text, watermark, extra legs, extra arms, extra heads, two characters, background scenery'})
        items.append({'name': f'{n}p-{sd}', 'then': f'{n}-{sd}', 'strength': 0.3, 'seed': 7, 'w': 1024, 'h': 1024, 'loras': [['style', 1.0]],
                      'prompt': 'slothadv style, ' + ('a big dark green armoured drake with pale back spikes' if n.startswith('drake')
                                                     else 'a big armoured old sloth general with a red cape') +
                                ', on a flat magenta background.' + STYLE})
spec = {'note': 'hfboss910a: new boss poses for 9-10 and 10-10, 2026-10-30', 'base': '',
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors']}, 'items': items}
p = Path(__file__).resolve().parent / 'spec-hfboss910a.json'
p.write_text(json.dumps(spec, indent=1))
print(p, len(items))
