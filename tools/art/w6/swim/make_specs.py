"""Write the World 6 swim job specs (2026-10-27).

    python3 -I tools/art/w6/swim/make_specs.py stills                  -> spec-swim-stills.json
    python3 -I tools/art/w6/swim/make_specs.py clips '{"surf": [["stills/surf-11.png", [3, 11]]], ...}'   -> spec-swim-clips.json

Upload swimgpu.py and the spec to hf://buckets/mshaffe111/w5-xfer/w6swim/jobs/ with hf_fs_write, then run the job with the
Hugging Face connector (jobargs printed by `python3 -I tools/art/w6/swim/make_specs.py args <spec> [part parts]`).
The four moves: surf (surface crawl loop), under (underwater glide loop), tread (tread-water idle), first (first-swim moment).
Pokey's body below the waterline is drawn normally (the game masks it) and nothing of the water is drawn (the game draws it).
"""
import json, sys
from pathlib import Path

H = Path(__file__).resolve().parent
POKEY = ['mshaffe111/pokey-qwen-lora', 'pokey_qwen_v1.safetensors', 1.0]
END = ', side view facing right, full body in frame with space around him, painted storybook illustration, plain flat grey background'
NEG = ('water, waves, ripples, splash, splashes, droplets, bubbles, pool, sea, ocean, river, lake, floor, ground, shadow, scenery, '
       'text, watermark, blurry, photo, 3d render, cropped, cut off, extra limbs, extra arms, extra animals, facing left')
# move: (pose words, seeds, still size)
STILLS = {
    'surf': ('pokeysloth swimming a front crawl stroke, his body stretched out level as if lying on his belly, head and shoulders lifted '
             'and looking ahead, his near arm reaching far forward over his head, the other arm pulled back along his side, '
             'legs stretched out straight behind him, calm determined face', (11, 22, 33, 44), (1248, 720)),
    'under': ('pokeysloth swimming underwater holding his breath, cheeks puffed out round, eyes open wide, body stretched long and level, '
              'both arms reaching straight forward together ready to pull, legs stretched straight out behind him',
              (11, 22, 33, 44), (1248, 720)),
    'tread': ('pokeysloth treading water, body upright, head up, calm happy smile, both paws paddling in front of his chest, '
              'legs bent below him kicking gently', (11, 22, 33, 44), (1024, 1024)),
    'first': ('pokeysloth startled, eyes wide and mouth open in surprise, flailing both arms up wildly, legs kicking, body upright '
              'as if he has just dropped into deep water', (11, 22, 33, 44), (1024, 1024)),
}
M = 'slothadv motion, painted storybook cartoon, static locked-off camera, flat plain grey background, smooth weighty motion, '
P = 'a friendly brown three-toed sloth with a leather satchel strap and wrist wraps '
MOTION = {'high': ['mshaffe111/slothadv-motion-lora', 'slothadv_motion_v1_high_noise.safetensors'],
          'low': ['mshaffe111/slothadv-motion-lora', 'slothadv_motion_v1_low_noise.safetensors'], 'scale': 1.0}
# move: (what he does, seeds, clip size)
CLIPS = {
    'surf': ('swims in place with a slow steady arm-over-arm crawl stroke, one long arm reaching forward over his head and pulling '
             'down and back while the other comes over, a smooth repeating swimming cycle, his head and shoulders held level, '
             'side view facing right, he stays in the middle of the frame', (3, 11, 29), (832, 480)),
    'under': ('glides in place as if underwater with puffed cheeks, both arms sweeping forward and pulling back to his sides in a '
              'smooth breaststroke, legs kicking gently behind him, body stretched long and level, a smooth repeating swimming '
              'cycle, side view facing right, he stays in the middle of the frame', (3, 11, 29), (832, 480)),
    'tread': ('treads water in place, gently bobbing up and down, his paws paddling in small circles in front of his chest and his '
              'legs kicking slowly, calm and content, a smooth repeating cycle, side view facing right, he stays in the middle '
              'of the frame', (3, 11), (704, 704)),
    'first': ('flails his arms wildly in surprise for a moment, then calms down, smiles proudly and paddles steadily with both paws, '
              'side view facing right, he stays in the middle of the frame', (3, 11), (704, 704)),
}


# second pass at the first-swim moment (Matt, 2026-10-27): the first take's panic frames turned three-quarter to the camera and the
# face changed style between the panic and the grin, so these stills and clips insist on a strict side-on profile throughout
PROFILE = (', seen in strict side profile exactly from the side, facing right, only his right side and one eye visible, '
           'leather satchel on its strap across his chest and bandage wraps on both wrists')
FIRST2_STILLS = {
    'first2a': ('pokeysloth startled and panicking, eyes wide and mouth open in a gasp, both arms flung up and flailing above his head, '
                'legs kicking, body upright as if he has just dropped into deep water', (11, 22, 33)),
    'first2b': ('pokeysloth startled and splashing, eyes wide, mouth open, both arms slapping forward and down in a frantic paddle in '
                'front of his chest, legs kicking, body upright as if he has just dropped into deep water', (11, 22, 33)),
}
FIRST2_NEG = NEG + ', front view, three-quarter view, facing the viewer, looking at the camera, both eyes visible'
FIRST2_CLIP = ('stays in side profile facing right the whole time: he flails his arms wildly in panic for a moment, then calms down, '
               'smiles proudly with the same face and paddles steadily with both paws in front of his chest, he stays in the '
               'middle of the frame')
FIRST2_CLIP_NEG = ('camera movement, zoom, pan, tracking shot, background change, scenery, water, waves, ripples, splashes, extra limbs, '
                   'extra characters, human hands, fingers, blurry, deformed, text, watermark, flicker, morphing, turning to face the '
                   'camera, front view, three-quarter view, facing the viewer, both eyes visible, changing art style, leaving the frame')


def first2_stills():
    items = [{'name': f'{mv}-{s}', 'prompt': words + PROFILE + END, 'seed': s, 'w': 1024, 'h': 1024, 'neg': FIRST2_NEG}
             for mv, (words, seeds) in FIRST2_STILLS.items() for s in seeds]
    (H / 'spec-swim-first2-stills.json').write_text(json.dumps({'tag': 'swim-first2-stills', 'stills': {'lora': POKEY, 'neg': FIRST2_NEG,
                                                                                                         'items': items}}, indent=1))
    print(len(items), 'stills')


def first2_clips(srcs, seeds):
    cl = [{'name': f'w6-pokey-first2-{Path(src).stem}-s{s}', 'src': src, 'prompt': M + P + FIRST2_CLIP, 'neg': FIRST2_CLIP_NEG,
           'seed': s, 'w': 704, 'h': 704} for src in srcs for s in seeds]
    (H / 'spec-swim-first2-clips.json').write_text(json.dumps({'tag': 'swim-first2-clips', 'motion': MOTION, 'clips': cl}, indent=1))
    print(len(cl), 'clips')


def stills():
    items = [{'name': f'{mv}-{s}', 'prompt': words + END, 'seed': s, 'w': wh[0], 'h': wh[1]}
             for mv, (words, seeds, wh) in STILLS.items() for s in seeds]
    (H / 'spec-swim-stills.json').write_text(json.dumps({'tag': 'swim-stills', 'stills': {'lora': POKEY, 'neg': NEG, 'items': items}}, indent=1))
    print(len(items), 'stills')


def clips(picks):
    """picks: {move: [[still, [seeds] | null (the move's default seeds), erase?], ...]}; erase {"y0", "sat"} paints the pale, unsaturated
    water ring some stills put round his feet (below y0) back to the grey before the clip"""
    cl = []
    for mv, takes in picks.items():
        what, seeds, wh = CLIPS[mv]
        for take in takes:
            src, ss = take[0], take[1] or seeds
            for s in ss:
                c = {'name': f'w6-pokey-{mv}-{Path(src).stem}-s{s}', 'src': src, 'prompt': M + P + what, 'seed': s, 'w': wh[0], 'h': wh[1]}
                if len(take) > 2:
                    c['erase'] = take[2]
                cl.append(c)
    (H / 'spec-swim-clips.json').write_text(json.dumps({'tag': 'swim-clips', 'motion': MOTION, 'clips': cl}, indent=1))
    print(len(cl), 'clips')


def args(spec, part=0, parts=1):
    name = Path(spec).name
    print(json.dumps({'image': 'ostris/aitoolkit:latest', 'flavor': 'rtx-pro-6000', 'timeout': '2h', 'detach': True,
                      'command': ['bash', '-lc', f'sha256sum /out/w6swim/jobs/swimgpu.py && SPEC=w6swim/jobs/{name} PART={part} '
                                  f'PARTS={parts} python /out/w6swim/jobs/swimgpu.py'],
                      'secrets': {'HF_TOKEN': '$HF_TOKEN'}, 'volumes': ['hf://buckets/mshaffe111/w5-xfer:/out:rw'],
                      'name': f'{json.loads(Path(spec).read_text())["tag"]}-{part}'}, indent=1))


if __name__ == '__main__':
    if sys.argv[1] == 'stills':
        stills()
    elif sys.argv[1] == 'clips':
        clips(json.loads(sys.argv[2]))
    elif sys.argv[1] == 'first2-stills':
        first2_stills()
    elif sys.argv[1] == 'first2-clips':  # first2-clips '["stills/first2a-22.png", ...]' '[3, 11]'
        first2_clips(json.loads(sys.argv[2]), json.loads(sys.argv[3]))
    else:
        args(sys.argv[2], *map(int, sys.argv[3:5]))
