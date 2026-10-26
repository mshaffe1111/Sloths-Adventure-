"""Write tools/art/gen/spec-w5creatures-train.json: the five new World 5 creature models (Matt approved all the concept art, every take,
2026-10-26). Each take family is a variant word in the captions ("variant a" = the w5c sheets, "b" = w5d, "c" = w5f redraws); the
pose sheet samples use the newest family. The samples at the end of training are the creature's basic pose sheet, two of each:
idle, move, tell, attack, hurt, defeated.

    python3 -I tools/art/w5/make_train_spec.py
"""
import json
from pathlib import Path

TAIL = 'side view facing right, whole body, painted storybook illustration, plain grey background'
C = [
    dict(name='dangler', title='the Dangler', style='wild', trigger='danglerspider',
         desc='a wild orb weaver spider with a round striped yellow and brown abdomen, long banded legs and big glossy eyes',
         takes=[['w5c-dangler-11', 'variant a'], ['w5c-dangler-33', 'variant a'], ['w5d-dangler-11', 'variant b'], ['w5d-dangler-22', 'variant b']],
         sheet_poses=['front view, hanging upside down on a single silk thread', 'side view, hanging on its thread',
                      'warning pose, lowering slowly on a glinting silk thread with its legs spread'],
         sample_variant='variant b',
         poses={'idle': 'hanging still on its silk thread, legs folded', 'move': 'climbing up its silk thread',
                'tell': 'warning pose, lowering slowly on its glinting thread with its legs spread wide',
                'attack': 'dropping fast down its thread, legs reaching out to grab', 'hurt': 'knocked back, eyes squeezed shut, legs flinching',
                'defeated': 'dazed with spiral eyes, dangling limp upside down from its thread'}),
    dict(name='butler', title='the Butler', style='household', trigger='butlerspider',
         desc='a polite household spider butler with pale lavender fuzz, a little striped waistcoat and a black bow tie, a lace doily pattern, a silver tray of tiny pink cakes, big gentle eyes',
         takes=[['w5c-butler-11', 'variant a'], ['w5c-butler-33', 'variant a'], ['w5d-butler-11', 'variant b'], ['w5d-butler-22', 'variant b'],
                ['w5f-butler3-11', 'variant c'], ['w5f-butler3-22', 'variant c']],
         sheet_poses=['front view, standing politely', 'side view, walking with the cake tray', 'warning pose, bowing low and lifting the cake tray high'],
         sample_variant='variant c',
         poses={'idle': 'standing politely holding the cake tray', 'move': 'walking primly with the cake tray',
                'tell': 'warning pose, bowing low and lifting the cake tray high', 'attack': 'flinging a tiny cake forward off the tray',
                'hurt': 'startled, the tray tipping, eyes squeezed shut', 'defeated': 'sitting dazed on the ground with spiral eyes, the empty tray on its head'}),
    dict(name='seamstress', title='the Seamstress', style='household', trigger='seamstressspider',
         desc='a household spider seamstress with soft pastel pink and cream fuzz, a lace collar, a tiny apron, little round spectacles and front legs like silver sewing needles, big eyes',
         takes=[['w5c-seamstress-11', 'variant a'], ['w5c-seamstress-33', 'variant a'], ['w5d-seamstress-11', 'variant b'], ['w5d-seamstress-22', 'variant b'],
                ['w5f-seamstress3-11', 'variant c'], ['w5f-seamstress3-22', 'variant c']],
         sheet_poses=['front view, sitting in a round web panel weaving a sheet of silk', 'side view', 'warning pose, needle legs raised and clicking'],
         sample_variant='variant c',
         poses={'idle': 'sitting in her round web panel, weaving lace', 'move': 'scuttling along on her legs',
                'tell': 'warning pose, needle legs raised and crossed, clicking together', 'attack': 'jabbing forward with her needle legs, flinging a lace strand',
                'hurt': 'knocked back, spectacles askew, eyes squeezed shut', 'defeated': 'tangled in her own lace, dazed with spiral eyes'}),
    dict(name='mantis', title='the Orchid Mantis', style='wild', trigger='orchidmantis',
         desc='a pink and white orchid mantis with petal-shaped legs and big round eyes',
         takes=[['w5c-mantis-11', 'variant a'], ['w5c-mantis-33', 'variant a'], ['w5d-mantis-11', 'variant b'], ['w5d-mantis-22', 'variant b']],
         sheet_poses=['disguised as a pink-white orchid flower, folded perfectly still on a stem', 'side view, revealed as a mantis',
                      'warning pose, petal legs twitching and spiked forelegs raised to snap'],
         sample_variant='variant b',
         poses={'idle': 'disguised as a pink-white orchid flower, folded perfectly still on a stem', 'move': 'side view, revealed, stalking forward on its petal legs',
                'tell': 'warning pose, petal legs twitching and spiked forelegs raised to snap', 'attack': 'lunging forward, snapping its spiked forelegs shut',
                'hurt': 'knocked back, eyes squeezed shut, petals ruffled', 'defeated': 'flipped onto its back, dazed with spiral eyes'}),
    dict(name='dozer', title='Dozer moths', style='wild', trigger='dozermoth',
         desc='a soft fluffy round moth with thick pale lilac and cream fur, feathery antennae, broad soft wings with faint eye spots and big sleepy eyes, sprinkling glowing golden sleepy dust',
         takes=[['w5c-dozer-11', 'variant a'], ['w5c-dozer-33', 'variant a'], ['w5d-dozer-11', 'variant b'], ['w5d-dozer-22', 'variant b'],
                ['w5f-dozer3-11', 'variant c'], ['w5f-dozer3-22', 'variant c']],
         sheet_poses=['front view, hovering', 'side view, flying', 'warning pose, wings spread wide, shaking out a cloud of glowing golden sleepy dust'],
         sample_variant='variant c',
         poses={'idle': 'hovering sleepily in place, wings half open', 'move': 'flying, wings beating',
                'tell': 'warning pose, wings spread wide, starting to shake out glowing golden sleepy dust',
                'attack': 'beating its wings hard, a big cloud of glowing golden sleepy dust bursting out', 'hurt': 'swatted, tumbling, eyes squeezed shut',
                'defeated': 'lying on the ground asleep, wings flopped, little z of sleep above it'}),
]
POSES = ['idle', 'move', 'tell', 'attack', 'hurt', 'defeated']
for c in C:
    c.update(lora_name=f"{c['name']}_qwen_v1", data_repo=f"mshaffe111/{c['name']}-lora-data", model_repo=f"mshaffe111/{c['name']}-qwen-lora",
             steps=800)
    c['samples'] = [f"{c['trigger']}, {c['sample_variant']}, {c['desc']}, {c['poses'][p]}, {TAIL}" for p in POSES for _ in (0, 1)]
    c['sample_names'] = [f'{p}_{k}' for p in POSES for k in (0, 1)]
spec = {
    'tag': 'w5train',
    'status': 'APPROVED by Matt 2026-10-26 (all five, every take). Trained by tools/art/w5/w5train.py as two HF jobs.',
    'pattern': ('Same as the *-qwen-lora character models (queen_qwen_v1, meeca_qwen_v1): Qwen-Image, LoRA rank 32, lr 1e-4, adamw8bit, '
                'qfloat8, buckets 768/1024. 800 steps (the budget; the queen had 1500 on 23 poses), captions '
                "'<trigger>, <variant>, <desc>, <pose>, painted storybook illustration, plain grey background'."),
    'style_notes': {'household': 'polite and creepy, tea-party style; big readable eyes', 'wild': 'painted nature; big readable eyes'},
    'jobs': [['butler', 'seamstress', 'dozer'], ['dangler', 'mantis']],
    'creatures': C,
}
Path(__file__).resolve().parents[1].joinpath('gen/spec-w5creatures-train.json').write_text(json.dumps(spec, indent=1))
print('ok', sum(len(c['takes']) * 3 for c in C), 'training pictures')
