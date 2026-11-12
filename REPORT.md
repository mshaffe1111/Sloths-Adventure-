# AS-2 report: Matt's art setting applied on t-assets-art82 (base origin/t-assets-compress @ffee5acc), and checked
**Page for Matt:** `reference/art/art82-check/index.html`, published privately: https://claude.ai/artifact/YaUMzunbf9vxVrhCv2PK2p . **Data:** `measure.json`, `dark.json`, `summary.json` beside it. **Tools:** `tools/assets/art82_dark.py`, `art82.py`, `art82_apply.py`, `art82_page.py`. AS-1's report moved to `reference/art/compress-trials/REPORT-AS1.md`.

## 1. The black picture
World 10's far storm sky, `backdrops/w10-far.webp` (stored about q91): 72% of it near black, 58% smooth dark sky. At q82 and q75 the smooth gradient breaks into soft 16 px blotches (WebP macroblocks), worst under the lightning. Its q82 SSIM 0.992 and PSNR 45 dB look fine: those scores forgive errors in flat dark areas, so they cannot be trusted alone for this. SSIMULACRA2 does mark it (75.2, below every picture Matt passed).

## 2. "Dark", objectively (luma Rec.709 on visible pixels, alpha-weighted)
Dark = near black (luma < 48) on half or more of the visible picture, OR smooth dark (16 px blocks with luma mean < 48 and std < 3, at least half visible) on a tenth or more of it. w10-far: 0.72 / 0.58, well clear of both lines. **107 of the 436 files above q83 are dark and stay exactly as shipped** (listed on the page and in summary.json; mostly night, cave, dusk and storm backdrops, story plates and grounds, dark enemy sheets).

## 3. Applied
329 candidates (above q83, not dark) encoded at q82, libwebp 1.6.0 method 6, lossless alpha (the AS-1 trial's exact settings; its w10-far / w2-near / pokey-1 / gear sizes reproduce byte for byte). **218 replaced in src/assets** (only files the shipped build uses). Files at or under q83 are untouched.

## 4. Measured (every re-encode vs its original, visible pixels only; alpha checked identical)
SSIM (luma), PSNR (RGB), the worst 32 px tile's SSIM, the worst dark tile's PSNR, SSIMULACRA2 (pip ssimulacra2 0.3.0, a Python port). The port drops alpha before blending and scored hidden colour under transparent pixels (sprite sheets read -47); I composite both over 50% grey first, which fixed it.
**Pass marks are Matt's own eye:** on the AS-1 page he passed q82 of the gear icon, pokey-1 and w2-near and rejected w10-far. Flag = worse than the worst passed one on any score: SSIM < 0.98, worst tile < 0.90, PSNR < 35 dB, dark tile < 36.5 dB, SSIMULACRA2 < 78.5 (passed: 78.7 / 85.4 / 81.3; rejected 75.2, so this score separates them), or smooth dark area >= 5% with a dark tile as bad as w10-far's (39.5 dB). **111 flagged, kept as shipped** (77 by the pixel scores, 34 by SSIMULACRA2 alone, mostly small icons and sprite atlases).
**Worst kept:** SSIM 0.980 (flora/heartbloom-bloom), worst tile 0.902 (w2-near, a passed anchor), PSNR 35.07, SSIMULACRA2 78.7 (gear, a passed anchor); median SSIMULACRA2 of the kept set about 84 ("high quality, not noticeable at normal distance").

## 5. Size
**8.6 MB saved** (same MB as AS-1; art only, music unchanged): app about 188.0 -> 179.4 MB. Much less than AS-1's art projection because 218 of 436 qualified: the dark exemptions and the flags hold back the rest. Build `dist/` is 1,020 files.

## Checks
tsc PASS; vite build PASS; artcheck PASS (the three tall sheets over 4096 px are known debt and untouched); chunkcheck PASS. Not run: unit tests, drawcheck, clipcheck, tierBots (only image bytes changed, no code; draw calls do not depend on quality). I looked at the page on an iPhone 13 upright and sideways: no sideways scroll, flip buttons work, the 3x zooms of the 8 worst show no visible difference beyond fine-grain softening.

## Verdict
Nothing visible lost: **yes**, on the measured evidence: every replaced picture scores at least as well as the q82 pictures Matt himself passed, on every score. Limit: the anchors are four pictures; Matt's eye on the page is the final check.
