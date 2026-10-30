"""The before/after reel for one clip: the before clip then the after, each with its own sound and a label, the frozen tail of each (the
recorder stopping) cut off, sized for a phone page.  python3 tools/story-delivery/reel.py <clipsDir> <outDir> <clip> <up|side>"""
import os, re, subprocess, sys

src, out, clip, o = sys.argv[1:5]
os.makedirs(out, exist_ok=True)
FONT = '/usr/share/fonts/opentype/inter/InterDisplay-Bold.otf'
if not os.path.exists(FONT):
    FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'


def dur(f):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], capture_output=True, text=True).stdout)


def live_end(f):
    """where the picture last stops moving for good (a freeze that runs to the end), plus a breath"""
    log = subprocess.run(['ffmpeg', '-i', f, '-vf', 'freezedetect=n=0.002:d=3', '-map', '0:v', '-f', 'null', '-'], capture_output=True, text=True).stderr
    d = dur(f)
    starts = [float(x) for x in re.findall(r'freeze_start: ([\d.]+)', log)]
    ends = [float(x) for x in re.findall(r'freeze_end: ([\d.]+)', log)]
    if starts and len(starts) > len(ends):
        return min(d, starts[-1] + 2.5)
    return d


parts = []
for tag, label in (('before', 'BEFORE'), ('after', 'AFTER')):
    f = os.path.join(src, f'{tag}-{clip}-{o}.mp4')
    end = live_end(f)
    p = os.path.join(out, f'_{tag}-{clip}-{o}.mp4')
    w = 390 if o == 'up' else 844
    vf = (f"scale={w}:-2,drawtext=fontfile={FONT}:text='{label}':x=(w-tw)/2:y=h-th-6:fontsize=20:fontcolor=white:box=1:boxcolor=0x000000AA:boxborderw=8")
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', f, '-t', f'{end:.2f}', '-vf', vf, '-c:v', 'libx264', '-crf', '31', '-preset', 'veryfast',
                    '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'aac', '-b:a', '80k', '-ar', '44100', '-ac', '2', p], check=True)
    parts.append(p)
lst = os.path.join(out, f'_{clip}-{o}.txt')
open(lst, 'w').write(''.join(f"file '{p}'\n" for p in parts))
final = os.path.join(out, f'{clip}-{o}.mp4')
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', '-movflags', '+faststart', final], check=True)
for p in parts + [lst]:
    os.remove(p)
print(final, f'{dur(final):.0f}s', os.path.getsize(final) // 1024, 'KB')
