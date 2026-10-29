"""Shuffle a world's generated chunks (the Hugging Face pilot: tools/audio/hfshuffle.py <chunk dir> <world> <out.wav> [seconds]) the
way the game would: calm chunks in an order that never repeats one inside the window, the danger set from 0:30 to 0:45, chunk to chunk
with a 30 ms crossfade on the bar line. Mono 24 kHz in, stereo 44.1 kHz out (to sit next to the live renders)."""
import json, random, subprocess, sys
from pathlib import Path
import numpy as np

src, world, out = Path(sys.argv[1]), sys.argv[2], sys.argv[3]
total = float(sys.argv[4]) if len(sys.argv) > 4 else 60.0
SR = 44100

def load(p):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', str(p), '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()

sets = {k: [load(src / f'{world}_{k}_{i}.ogg') for i in range(8) if (src / f'{world}_{k}_{i}.ogg').exists()] for k in ('calm', 'danger')}
rnd = random.Random(7)
x = np.zeros(0, np.float32)
recent = {'calm': [], 'danger': []}
fade = int(0.03 * SR)
while len(x) < total * SR:
    t = len(x) / SR
    kind = 'danger' if 30 <= t < 45 else 'calm'
    pool = [i for i in range(len(sets[kind])) if i not in recent[kind][-5:]]
    i = rnd.choice(pool)
    recent[kind].append(i)
    c = sets[kind][i]
    if len(x):
        r = np.linspace(0, 1, fade, dtype=np.float32)
        x[-fade:] = x[-fade:] * (1 - r) + c[:fade] * r
        x = np.concatenate([x, c[fade:]])
    else:
        x = c
x = x[: int(total * SR)]
# level like the live renders (about -12 LUFS is set by ffmpeg afterwards); peak safety
x = x / max(1e-9, np.abs(x).max()) * 0.85
st = np.stack([x, x], 1)
import wave
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(st, -1, 1) * 32767).astype('<i2').tobytes())
print(out, round(len(x) / SR, 1), 's')
