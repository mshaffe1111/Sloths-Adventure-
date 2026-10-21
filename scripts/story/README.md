# Story sheet cutter

`cut.py` finds the grid of each 4x4 story sheet (`reference/animation-sheets/story/`), keys the grey out of every cell and saves the figures; `catalog.py` names every cell, says which way it looks and what height a standing figure should be; `pack.py` packs the named cells into `src/assets/characters/cels-*.webp` and writes `src/game/storyCelData.ts`.

The paths at the top of each script are those of the machine they were written on (a scratch folder holding copies of the sheets as `s01.jpg`..`s18.jpg`): change them, then run `python3 cut.py` and `python3 pack.py 0.9 78`.
