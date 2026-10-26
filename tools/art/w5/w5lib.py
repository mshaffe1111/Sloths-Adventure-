"""Shared by train_w5creatures.py (local) and w5train.py (the HF training job): cutting a W5 concept sheet into its poses, and the
ai-toolkit config of a creature model (the *-qwen-lora recipe)."""
import numpy as np
from PIL import Image
from scipy import ndimage


def sheet_mask(a):
    """figure pixels of a sheet on a plain (possibly softly graded) background: the background is a quadratic fitted per channel to
    the border pixels, and a pixel is figure when it is more than 34 levels from it"""
    h, w, _ = a.shape
    ys, xs = np.mgrid[0:h, 0:w]
    bd = np.zeros((h, w), bool); bd[:10] = bd[-10:] = True; bd[:, :10] = bd[:, -10:] = True
    X = lambda yy, xx: np.stack([np.ones_like(xx), xx / w, yy / h, (xx / w) ** 2, (yy / h) ** 2, xx * yy / (w * h)], -1).reshape(-1, 6)
    A = X(ys[bd].astype(float), xs[bd].astype(float))
    bg = np.empty_like(a)
    full = X(ys.astype(float), xs.astype(float))
    for ch in range(3):
        coef, *_ = np.linalg.lstsq(A, a[..., ch][bd], rcond=None)
        bg[..., ch] = (full @ coef).reshape(h, w)
    d = np.sqrt(((a - bg) ** 2).sum(-1))
    return d


def pieces_in_row(path, n):
    """a concept sheet with n figures side by side (the W5 sheets: front view, side view, warning pose): split at the emptiest column
    near each n-th of the width (a thin silk thread across the top, a dust cloud or overlapping legs cannot stop it), then each part
    is cropped to its figure. More robust than separate blobs when a thread joins the figures or a pose sheds sparkles."""
    im = Image.open(path).convert('RGB')
    a = np.asarray(im).astype(np.float32)
    d = sheet_mask(a)
    fig = ndimage.binary_opening(d > 34, iterations=1)
    W = im.width
    col = ndimage.uniform_filter1d(fig.sum(0).astype(float), 9)
    edges = [0]
    for k in range(1, n):
        c, half = k * W / n, 0.4 * W / n
        lo, hi = int(c - half), int(c + half)
        edges.append(lo + int(np.argmin(col[lo:hi])))
    edges.append(W)
    alpha = np.clip((d - 20) / 30, 0, 1)
    out = []
    for x0, x1 in zip(edges[:-1], edges[1:]):
        lab, k = ndimage.label(fig[:, x0:x1])
        if not k:
            continue
        sizes = ndimage.sum(np.ones_like(lab), lab, range(1, k + 1))
        keep = np.isin(lab, 1 + np.flatnonzero(sizes > max(60, sizes.max() * 0.002)))
        ys, xs = np.nonzero(keep)
        bx0, bx1, by0, by1 = xs.min() + x0, xs.max() + x0 + 1, ys.min(), ys.max() + 1
        rgba = np.dstack([a[by0:by1, bx0:bx1], alpha[by0:by1, bx0:bx1] * 255]).astype(np.uint8)
        out.append((Image.fromarray(rgba, 'RGBA'), (bx0, by0, bx1, by1)))
    return im, out


def config(c):
    prompts = '\n'.join(f'          - "{p}"' for p in c['samples'])
    return f'''---
job: extension
config:
  name: "{c['lora_name']}"
  process:
    - type: 'sd_trainer'
      training_folder: "/out"
      device: cuda:0
      network:
        type: "lora"
        linear: {c.get('rank', 32)}
        linear_alpha: {c.get('rank', 32)}
      save:
        dtype: float16
        save_every: 500
        max_step_saves_to_keep: 6
      datasets:
        - folder_path: "/data/{c['name']}"
          caption_ext: "txt"
          caption_dropout_rate: 0.05
          shuffle_tokens: false
          cache_latents_to_disk: true
          resolution: [ 768, 1024 ]
      train:
        batch_size: 1
        cache_text_embeddings: true
        steps: {c.get('steps', 1500)}
        gradient_accumulation: 1
        train_unet: true
        train_text_encoder: false
        gradient_checkpointing: true
        noise_scheduler: "flowmatch"
        optimizer: "adamw8bit"
        lr: 1e-4
        dtype: bf16
      model:
        name_or_path: "Qwen/Qwen-Image"
        arch: "qwen_image"
        quantize: true
        qtype: "qfloat8"
        quantize_te: true
        qtype_te: "qfloat8"
        low_vram: false
      sample:
        sampler: "flowmatch"
        sample_every: 500
        sample_start_step: 0
        width: 1024
        height: 1024
        prompts:
{prompts}
        neg: ""
        seed: 42
        walk_seed: true
        guidance_scale: 3
        sample_steps: 25
meta:
  name: "[name]"
  version: '1.0'
'''
