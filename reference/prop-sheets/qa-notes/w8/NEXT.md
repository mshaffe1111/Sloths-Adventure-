# World 8 builder: where I stopped (2026-10-29, about 11 PM ET, Matt's stop for the night)

Branches:
- gen2-w8 84c5c403: the climb-vine fix (pipeline clearClimbs), 8-4 off gen2, interim seeds, the levelCheck wall fix and its
  test, curate `--apart-near`.
- gen2-w8-split (this branch): World 8's per-stage split (w8Branch.ts for 8-5, 8-2's roost blooms, the fight stages' own animals,
  8-6's glide rests), with gen2-w8 and gen2-w8-swing 59f97d1 merged in. World 8 unit tests pass.

Stopped mid-curation: option C, all seven stages curated in parallel, each with its own `--out`. The run was killed before any
stage but 8-6 finished, so no seeds were written. 8-6 shipped 3 of 16: 229 of its rolls were over the 1-in-5 look-alike cap against
the other stages' interim (pre-split) sets.

Exact next step:
1. Re-run the curation stage by stage in play order (8-1, 8-2, 8-3, 8-5, 8-6, 8-8, 8-9), each one checked against the stages
   already curated on the split, not the interim sets: `npx tsx tools/gen2/curate.ts --stages 8-1,8-2,... --rolls 300 --keep 16
   --apart-near`, split into runs under the 2 h limit (two or three stages a run, the `--out` carried from one run to the next).
2. If 8-6 still can't ship 16 under the cap, find which stage its rolls collide with (the c-all / 8-6 logs) and give 8-6's
   stretches more of its own (scratch tool: alike.mts in the session scratchpad, per stage pair).
3. Variety is under the 0.35 rule on 8-1 (0.315), 8-3 (0.303) and 8-5 (0.261, two new 8-5 sections added since).
4. Then merge gen2-w8-split into gen2-w8, run the gates (tsc, the full suite and the gen2 tests, era --worlds 8, first-timer
   seeds 1-3 with Worlds 6 and 7, vite build), stills upright and sideways, the polish check, and the report.
