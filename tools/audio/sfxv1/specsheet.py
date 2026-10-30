"""A contact sheet of waveforms and spectrograms, so takes can be checked by eye (polish-sfx).

    python3 tools/audio/sfxv1/specsheet.py <out.png> <seconds> file[:label] ...
"""
import sys
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from measure import load, SR

out, secs, items = sys.argv[1], float(sys.argv[2]), sys.argv[3:]
n = len(items)
cols = 4
rows = (n + cols - 1) // cols
fig, axs = plt.subplots(rows * 2, cols, figsize=(cols * 4, rows * 3.2), gridspec_kw={'height_ratios': [1, 2] * rows})
axs = np.array(axs).reshape(rows * 2, cols)
for i in range(rows * cols):
    a, b = axs[2 * (i // cols), i % cols], axs[2 * (i // cols) + 1, i % cols]
    a.axis('off'); b.set_xticks([]); b.set_yticks([])
    if i >= n:
        b.axis('off'); continue
    p, _, lab = items[i].partition('::')
    x = load(p)[: int(secs * SR)]
    t = np.arange(len(x)) / SR
    a.plot(t, x, lw=0.4, color='k'); a.set_xlim(0, secs); a.set_ylim(-1, 1)
    a.set_title(lab or p.rsplit('/', 1)[-1], fontsize=8)
    if len(x) > 512:
        b.specgram(x, NFFT=512, Fs=SR, noverlap=384, cmap='magma', vmin=-110, vmax=-20)
    b.set_xlim(0, secs); b.set_ylim(0, 12000)
    b.set_yticks([1000, 4000, 8000]); b.tick_params(labelsize=6)
fig.tight_layout()
fig.savefig(out, dpi=70)
