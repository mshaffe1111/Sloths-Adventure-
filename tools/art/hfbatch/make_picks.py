"""Write tools/art/hfbatch/picks.json (2026-10-29): which clip and frames each move of each creature is cut from (cutbatch.py). The
reasons for each pick and each rejected take are in tools/art/hfbatch/jobs.txt; the check sheets and GIFs in reference/prop-sheets/qa-notes/hf-batch-w7w8/.
    python3 tools/art/hfbatch/make_picks.py
"""
import json
from pathlib import Path


def E(a, b):
    return list(range(a, b + 1, 2))


P = {
    '_note': 'seq: [clip, Wan frame numbers (even, 8 fps)]. Old clips from the 2026-10-28 overnight run (cr-/m1k-), new from hf-batch-w7w8 (hfb-).',
    'fruitbat-w8': {
        'anchor': 'roost', 'derim': 6, 'anchorClip': 'nc-fruitbat-roost-s17',
        'seq': {'doze': ['hfb-bat-sleep-s5', E(0, 22)], 'sleep': ['hfb-bat-sleep-s5', E(24, 48)]},
        'loop': ['sleep'],
        'note': ("doze: from roost_24 (eyes open) the eyes close; sleep: eyes shut, wings wrapped, slow breathing (play it ping-pong). "
                 "Same canvas anchor as fruitbat.json's roost, so they swap in place for roost frames at the same draw scale.")},
    'fruitbat-fly': {
        'anchor': 'middle', 'derim': 6, 'seq': {'fly': ['cr-fruitbat-fly-s21', E(36, 46)]}, 'loop': ['fly'],
        'note': ("side-on flight cycle facing right, the same bat design and paint as fruitbat.json, at clip size (about 2x the 200 x 140 "
                 "asked: draw at half scale for that size). Anchor: the middle of the body box.")},
    'owl': {'anchor': 'middle', 'derim': 6, 'seq': {'defeat': ['hfb-owl-defeat-s11', E(0, 48)]},
            'note': ("the owl defeat redo from new-owl-505: knocked out of the air, wings fold, it drops and lies flat with its eyes shut "
                     "(closed lids, not swirly X's: Wan would not draw the X's). Anchor: the middle of the flying owl's box in frame 0, "
                     "so it starts where the flier was.")},
    'crab': {'anchor': 'ground', 'loop': ['idle', 'walk'], 'seq': {
        'idle': ['cr-crab-idle-s7', E(0, 48)], 'walk': ['m1k-crab-walk-s3', E(22, 34)], 'attack': ['m1k-crab-snap-s29', E(0, 14)],
        'hurt': ['cr-crab-hurt-s21', E(0, 30)], 'defeat': ['hfb-crab-defeat-s17', [0, 2] + E(10, 48)]}},
    'piranha': {'anchor': 'middle', 'mainOnly': True, 'loop': ['idle'], 'seq': {
        'idle': ['m1k-piranha-chomp-s3', E(14, 34)], 'attack': ['cr-piranha-leap-s7', E(8, 28)], 'hurt': ['cr-piranha-hurt-s21', E(2, 12)],
        'defeat': ['hfb-piranha-defeat-s5', E(0, 48)]}},
    'sentry': {'anchor': 'ground', 'derim': 14, 'whitePockets': 15, 'loop': ['idle', 'walk'], 'seq': {
        'idle': ['cr-sentry-idle-s21', E(0, 48)], 'walk': ['m1k-sentry-walk-s11', E(0, 48)], 'attack': ['cr-sentry-jab-s21', E(0, 36)],
        'hurt': ['hfb-sentry-hurt-s5', [0] + E(10, 24)], 'defeat': ['cr-sentry-crumble-s21', E(0, 48)]}},
    'beetle': {'anchor': 'ground', 'derim': 8, 'loop': ['idle', 'walk'], 'seq': {
        'idle': ['cr-beetle-idle-s21', E(0, 48)], 'walk': ['m1k-beetle-walk-s11', E(0, 48)], 'attack': ['m1k-beetle-charge-s3', E(0, 48)],
        'hurt': ['cr-beetle-flip-s21', E(0, 48)], 'defeat': ['hfb-beetle-defeat-s17', E(0, 48)]}},
}
p = Path(__file__).resolve().parent / 'picks.json'
p.write_text(json.dumps(P, indent=1))
print(p)
