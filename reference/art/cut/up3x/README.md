# Sheet-10 keepers, 3x (Real-ESRGAN anime 6B on CPU, then defringe; 2026-11-06, $0)

`python3 -I tools/art/edges/defringe.py reference/art/cut/w1-<n>.png reference/art/cut/up3x/w1-<n>.webp --scale 3 --esrgan --q 92`
(needs `pip install spandrel` and `tools/art/upscale/anime6b.pth`, git-ignored, from the Real-ESRGAN v0.2.2.4 GitHub release).
Judged against the originals enlarged 3x with Lanczos, on dusk purple.

| Piece | Verdict |
|---|---|
| w1-vine-column-a, w1-vine-column-b | KEEP: crisper ink lines and bark, clean edge |
| w1-rope-plain | KEEP: the twist reads, no blur |
| w1-vine-fungus | KEEP: sharper shelves and outline; the moss goes a little flatter (the model's look), acceptable |
| w1-vine-monstera | KEEP, watch: much sharper leaves; a faint mauve rim on some leaf edges on dark backgrounds |
| w1-vine-flowering | FLAG: the white petals read grey. That is the cut, not the upscale (the petals were pink-tinted by the key and got neutralised). Re-roll (R-02), or re-cut it without the de-pink step |
