# Cutter for the 11-11b batch
Same cutter as ../../../matt-2026-11-09/cut/cutter/ (README there); sheets as ROOT/artraw/P/P-sheet-NN.jpg, empty config.
Order: cut.py ROOT; copy artcut/pieces to ROOT/pieces_raw; EXEMPT=P-01-d edgefix.py ROOT 'P-*'; softfix.py ROOT P-09-d P-10-b P-10-c P-07-d;
pitfix.py ROOT; waterfix.py ROOT; TABLE=ptable mbuild.py ROOT <this cut folder> <repo>/src/assets/w1-1111b; then zero RGB under alpha 0
and save optimised; pinkscan.py ROOT 'P-*' <kept dir> must print nothing.
