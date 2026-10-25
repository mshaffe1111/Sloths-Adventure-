"""The motion training set: the Wan clips that came out right (static camera, side-on, in place, flat grey), as mp4 + caption.
  python3 build.py  -> clips/<name>.mp4 + .txt
"""
import subprocess
from pathlib import Path
S = __import__('pathlib').Path(str(__import__('pathlib').Path(__file__).resolve().parents[1]))
OUT = S / 'motion/clips'
OUT.mkdir(parents=True, exist_ok=True)
T = 'slothadv motion, painted storybook cartoon, static locked-off camera, flat plain grey background, smooth weighty motion'
P = 'a friendly brown three-toed sloth with a leather satchel strap and wrist wraps'
J = 'a huge blue-black panther with glowing green eyes and an iron collar'
C = 'a huge dark olive-green crocodile with spiked scales and a crooked petal crown'
CLIPS = {
    # Pokey (the clips the game uses)
    'train/vids/belly-scratch': f'{P} scratches his belly lazily, eyes half closed, standing in place',
    'train/vids/cheer': f'{P} cheers, throwing both arms up and bouncing on the spot',
    'train/vids/doze': f'{P} dozes off standing up, his head nodding down and jerking back up',
    'train/vids/hurt': f'{P} flinches back from a hit and shakes it off',
    'train/vids/idle-yawn': f'{P} gives a big slow yawn and stretches his arms up',
    'train/vids/look-around': f'{P} looks left and right, curious, standing in place',
    'train/vids/wave': f'{P} waves hello with one paw, smiling',
    'train/vids/push': f'{P} leans in and pushes hard against something heavy, legs braced',
    'train/vids/a-run-1': f'{P} runs in place, side view facing right, arms pumping, a smooth running cycle',
    'train/vids/run-in-place': f'{P} runs in place, side view facing right, a smooth running cycle',
    'train/vids/a-punch-1': f'{P} throws quick punches, left and right, side view',
    'train/vids/a-kick-1': f'{P} does a high kick forward and lands back in his stance, side view',
    'train/vids/a-mega': f'{P} winds up and throws one huge punch, side view',
    'train/vids/climb-loop': f'{P} climbs a vine hand over hand, a smooth climbing cycle',
    'train/vids/hang-sway': f'{P} hangs from a branch by his arms and sways gently',
    # the Shadow Prowler
    'prowl/vids/idle': f'{J} stands low and watchful, breathing slowly, tail tip twitching, side view',
    'prowl/vids/walk': f'{J} prowls in place with a slow low stalking walk, side view facing right',
    'prowl/vids/gallop11': f'{J} gallops flat out in place, body stretching and bunching, side view facing right',
    'prowl/vids/pounce': f'{J} crouches, springs into a long leap with claws out and lands, side view facing right',
    'prowl/vids/swat3': f'{J} swats forward hard with one front paw and pulls it back, side view facing right',
    'prowl/vids/hurt': f'{J} rears back from a hit, head up, pained, side view',
    'prowl/vids/stagger': f'{J} sways dazed on his legs, side view',
    'prowl/vids/defeated': f'{J} is beaten, sinks down slowly and lies flat, side view',
    # Crocus Rex
    'croc/vids/idle': f'{C} breathes slowly and sways his tail while he waits, side view',
    'croc/vids/roar': f'{C} rears his head back and roars with jaws wide open, side view',
    'croc/vids/whip': f'{C} winds up his tail and spins round sweeping it, side view',
    'croc/vids/slam': f'{C} rears up and slams down on his belly, side view',
    'croc/vids/hurt': f'{C} flinches with his jaws open, side view',
    'croc/vids/stagger': f'{C} wobbles dizzily, side view',
    'croc/vids/defeated': f'{C} is beaten and rolls over onto his back, side view',
    # story scenes (the cutscene clips the game uses)
    'train/vids/cut-cookhouse': 'a cosy wooden cookhouse at night, steam rising, lamplight flickering, a wide story scene',
    'train/vids/cut-council': 'a council hall of carved stone chairs, light shifting, leaves drifting, a wide story scene',
    'train/vids/cut-nest-storm': 'a sloth nest in the treetops in a storm, rain lashing and branches tossing, a wide story scene',
    'train/vids/cut-village': 'a treetop village the morning after a storm, smoke curling, leaves drifting, a wide story scene',
}
for src, cap in CLIPS.items():
    d = S / src
    name = d.parent.parent.name + '-' + d.name
    fs = sorted(d.glob('*.png'))
    assert len(fs) >= 33, (src, len(fs))
    out = OUT / f'{name}.mp4'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '16', '-pattern_type', 'glob', '-i', str(d / '*.png'),
                    '-c:v', 'libx264', '-crf', '14', '-pix_fmt', 'yuv420p', '-vf', 'pad=ceil(iw/2)*2:ceil(ih/2)*2', str(out)], check=True)
    out.with_suffix('.txt').write_text(f'{T}, {cap}')
print(len(CLIPS), 'clips')
