"""The effect table for the report (polish-sfx, 2026-10-29): every effect the game asks for, where it is called, how often it fires per
minute in a bot's minute of each stage (fxcount.cjs), and its new sound.

    python3 tools/audio/sfxv1/effects_table.py <rates.json> <sites.json> <out.md>
"""
import json, sys

rates, sites, out = json.load(open(sys.argv[1])), json.load(open(sys.argv[2])), sys.argv[3]
STAGES = ['1-2', '2-1', '3-3', '4-4', '5-5', '6-1', '7-3', '8-1', '5-10', '1-10']

# play* call -> (fx name, the new sound, status)
ROWS = [
    ('playStep', 'step', 'stepMoss / stepWood / stepStone / stepWater, 6-8 takes each, by the surface underfoot', 'built, previewed (batch 1-2)'),
    ('playJump', 'jump', 'jump: a push of air and cloth, a scuff off the ground (6 takes)', 'built, in the mixes'),
    ('playDoubleJump', 'doubleJump', 'doubleJump: a flutter of wings and a gust (5 takes)', 'built, in the mixes'),
    ('playLand', 'land', 'landing: small / medium / big by fall height (2 takes each)', 'built, previewed (batch 2)'),
    ('playPunch', 'punch', 'swish: an air stroke (6 takes); the hit is its own sound', 'built, in the mixes'),
    ('playKick', 'kick', 'swish (as punch, a little lower)', 'built, in the mixes'),
    ('playMegaPunch', 'megaPunch', 'swish, heavier, with a body thump', 'to build'),
    ('playWhoosh', 'whoosh', 'by caller: splash (falling into water), swish (strikes), gust (wind), a puzzle sound', 'splash built; callers to split when wired'),
    ('playHitImpact', 'hit', 'hit_<body>: generic, fur, scale, chitin, feather, armor (3 light + 3 heavy each); rock for World 4 rocks; puzzle sounds for puzzles', 'built, previewed (batch 1-2)'),
    ('playEnemyDefeated', 'defeat', 'ko_<creature>: its own voice and a fall (12 creatures x 3 takes)', 'built, previewed (batch 2)'),
    ('playFlowerPickup', 'flower', 'flower: a soft warm note, 8 takes on a pentatonic, no ladder', 'built, previewed (batch 1)'),
    ('playLeafPickup', 'leaf', 'a leaf brush (soft rustle, no note)', 'to build'),
    ('playFruitPickup', 'fruit', 'a bite (munch) and a warm note', 'to build'),
    ('playHeartPickup', 'heart', 'two warm low notes and a breath', 'to build'),
    ('playSuperHeart', 'superHeart', 'a bigger moment: a warm rising three-note figure over a soft swell', 'to build'),
    ('playPowerUp', 'power', 'three moments (speed / invincible / magnet): a gust, a shimmer of leaves, a hum', 'to build'),
    ('playVineGrab', 'vine', 'vine: a palm on bark-wrapped rope, its leaves, its creak (6 takes); 4-4 chimes get windChime', 'built, previewed (batch 2)'),
    ('playTreeClimb', 'climb', 'bark scratch under claws (scrape)', 'to build'),
    ('playGlide', 'glide', 'glide: open (cloth snap and gust), flutter (3), fold', 'built, in the 4-4 mix'),
    ('playShrineUnlocked', 'shrine', 'by caller: stone gate grinding open, a frond unfurling, a bloom', 'to build'),
    ('playRelicFound', 'relic', 'a reward: warm notes over a soft swell', 'to build'),
    ('playCritterRescued', 'critter', 'the freed creature\'s happy chirp', 'to build'),
    ('playPlayerHurt', 'hurt', 'a body thump and a shake of leaves (no synth "oof")', 'to build'),
    ('playEagleScreech', 'eagle', 'a real bird of prey\'s screech', 'to build (sources found)'),
    ('playBossRoar', 'roar', 'each boss\'s own voice (overlaps SN-4, Build 1)', 'held: SN-4 is Build 1\'s'),
    ('playPredator', '<kind>Call', 'warning / launch / impact per predator (ocelot, jaguar, boa, caiman, tayra) from the same voices as their knock-outs', 'to build'),
    ('playCheckpoint', 'checkpoint', 'checkpoint: a flag in the wind and two warm rising notes (3 takes)', 'built, in the mixes'),
    ('playOneUp', 'oneUp', 'a reward: a warm four-note figure', 'to build'),
    ('playLevelStart', 'levelStart', 'a soft wooden knock and a rustle (the music starts the stage)', 'to build'),
    ('playUiTap', 'uiTap', 'a soft wooden tap (6 takes)', 'to build'),
    ('playUiConfirm', 'uiConfirm', 'two wooden taps, the second higher', 'to build'),
    ('playUiBack', 'uiBack', 'a leaf rustle', 'to build'),
    ('playStar', 'star', 'the Stage Cleared stars: a warm note each, rising', 'to build'),
    ('playPause', 'pauseIn / pauseOut', 'a leaf curtain closing / opening', 'to build'),
    ('(w4Play)', 'rock (was hit)', 'rock: a stone thud, a crunch and grit (6 takes); rockWarn: grit trickling 1.4 s before (4 takes)', 'built, previewed (batch 1)'),
    ('(w4Play)', 'chime (was vine)', 'windChime: a hollow wooden clatter on a breath of wind (5 takes), at most every 1.4 s', 'built, in the 4-4 mix'),
    ('(engine water)', 'whoosh + hit', 'splash: plunge / body / dip (2 takes each)', 'built, in the 4-4 mix'),
    ('(boss card)', 'bossAppear', 'bossSlam: a huge low impact, the card slapping down, a far roll of thunder (2 takes; SN-10)', 'built, previewed (batch 2)'),
    ('(world beds)', 'ambience', 'bed1-bed10: real 20 s loops per world, with bird / drip / croak / thunder one-shots (SN-9)', 'built, previewed (batch 2)'),
    ('(puzzle kits)', 'pick, drop, wrap, ...', 'the 12 puzzle sounds (polish-audio\'s PUZZLE_SOUNDS) from real wood, stone, rope and water', 'to build'),
    ('(new)', 'bounce', 'a mushroom bounce: a soft, fleshy boing (not a spring)', 'to build'),
    ('(new)', 'log / crumble / thorns / gate', 'a log rolling and landing; stone crumbling; a thorn bush scratch; a wooden gate', 'to build'),
]

lines = ['# The effect table, old and new (polish-sfx, 2026-10-29)', '',
         'Plays per minute come from a bot playing one minute of each stage (tools/audio/sfxv1/fxcount.cjs; 5-10 and 1-10 are boss fights).',
         'A bot jumps and swings more than a person, so read movement as a ceiling and the rest as a guide. "Called from" is the number of',
         'call sites per file.', '',
         '| Call | Old effect | Called from | ' + ' | '.join(STAGES) + ' | New sound | Status |',
         '|---|---|---|' + '---|' * len(STAGES) + '---|---|']
for call, fx, new, status in ROWS:
    r = rates.get(fx, {})
    where = ', '.join(sites.get(call, [])) or '—'
    lines.append(f'| {call} | {fx} | {where} | ' + ' | '.join(str(r.get(s, '')) or '' for s in STAGES) + f' | {new} | {status} |')
open(out, 'w').write('\n'.join(lines) + '\n')
print(len(ROWS), 'rows')
