"""Round 4 of the boss art batch (hf-art-bosses, 2026-10-29), from bossstarts4.py's starts: the Mire's hanging moss repainted (the
round-1 fringe read as teal icicles), Crocus Rex's bank props, the Sky Sovereign's pennants and pole and screech wave, the weak-point ring.
    python3 tools/art/hfbosses/make_spec4.py <commit>
"""
import json, sys
from pathlib import Path

BASE = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{sys.argv[1]}/tools/art/hfbatch/starts/'
STYLE = 'Soft cel shading, thin dark outline, light from the upper left, painted storybook illustration, slothadv style.'
KEY = ' Evenly lit, every piece separate on one flat plain pure magenta background, no shadow, no text.'
NEG = ('text, letters, numbers, watermark, frame, border, photo, 3d render, blurry, gradient background, scenery, sky, cast shadow, '
       'people, sloth, character, icicles, spikes')
SHEETS = {
    'fg-moss': ('start-fg-moss.webp', 2048, 384, (0.7, 0.82),
        'slothadv style, a wide foreground strip for a side-scrolling game at night: a gnarled dark mangrove branch runs along the top '
        'edge, and from it hang soft ragged curtains of Spanish moss, long wispy grey-green strands in loose bunches of different lengths, '
        'swaying, with a few small dark leaves at the branch. Soft and stringy like hair, never pointed. Nothing below them. ' + STYLE + KEY),
    'croc-props': ('start-croc-props.webp', 2048, 1024, (0.62, 0.75),
        'slothadv style, a sheet of four separate game props for a crocodile king\'s swamp bank at night, side view: top left an old '
        'wooden rowboat half sunk in brown mud, tilted, a split plank in its side and a snapped oar sticking up; top right a weathered '
        'wooden warning sign on a post with a blue wave picture crossed out by a red no-entry ring, a bite torn out of its top corner; '
        'bottom left a heap of old dented metal knight helmets with a rusty bucket and two white bones on a patch of mud; bottom right '
        'two clumps of tall swamp reeds and bulrushes with brown cattail heads. ' + STYLE + KEY),
    'fx3': ('start-fx3.webp', 2048, 1024, (0.72, 0.85),
        'slothadv style, a sheet of separate game pieces: along the top three tattered cream cloth pennant flags, each with three long '
        'tails streaming to the right in the wind with soft folds, fixed to a short golden hem on the left; on the far right a tall '
        'thin wooden flag pole with a round gold knob on top; in the middle a long curved glowing band of white and pale cyan sound '
        'and wind, a shockwave of swirling air tapering to points at both ends; at the bottom a glowing golden ring of light with '
        'four short bright golden rays pointing in toward its middle, a target mark. ' + STYLE + KEY),
}
items = [{'name': f'{n}-s{round(s * 100)}-{sd}', 'start': st, 'prompt': p, 'neg': NEG, 'strength': s, 'seed': sd, 'w': w, 'h': h}
         for n, (st, w, h, ss, p) in SHEETS.items() for s in ss for sd in (7, 23)]
spec = {'note': 'hfboss-r4: moss, croc props, pennants, screech, weak point; hf-art-bosses, 2026-10-29', 'base': BASE,
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]}, 'items': items}
p = Path(__file__).resolve().parent / 'spec-hfboss-r4.json'
p.write_text(json.dumps(spec, indent=1))
print(p, len(items))
