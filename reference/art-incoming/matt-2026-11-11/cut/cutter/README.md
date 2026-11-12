# Cutter for the 11-11 batch
Same cutter as `../../../matt-2026-11-09/cut/cutter/` (README there), with the sheets laid out as ROOT/artraw/N/N-sheet-NN.jpg and
`config-N.json` as ROOT/cutcode/config.json (labelbox boxes clear sheet 09's prompt text and sheet 10's labels; seps and boxes on
06 split the burnt stump and clear the smeared ledge). Order: `cut.py ROOT`, `edgefix.py ROOT 'N-*'`, `specks.py ROOT N-09-a N-09-b`,
`TABLE=ntable mbuild.py ROOT <this cut folder> <repo>/src/assets/w1-1111`, `pinkscan.py ROOT 'N-*' <repo>/src/assets/w1-1111`
(must print nothing over 0). Then zero RGB under alpha 0 and re-save optimised (lossless for visible pixels; saves ~2 MB).
`ntable.py` is this batch's table; `EXTRA_REJ` there records the ledge (a raw crop, not keyed).
