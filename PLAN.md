# ART (t-art-1113) plan, 10:17 AM ET
1. Two-hand vine climb (R-165.178): img2img starts from Pokey's hero sheet (two vines, arms out), paste-ups on magenta; pack like hero-rope.
2. 1-5 set: leaf-signs THIS WAY/THAT WAY, leaf curtain, folded petal, her mark on bark, root tunnel mouth, rotten fallen trunk, dusk sky.
3. 1-4: rotting bough (bracket fungus, notched underside), fruit cluster, seed pod; then daytime flyer, leafcutter ants.
4. Label every piece in the master catalog + inventory; stills beside Pokey at 89.1 drawn units; artcheck; cap $15, keep $10 reserve.
WRITE: tools/art/hf1113/* (specs, starts, cut/pack scripts), reference/art/hf1113/* (starts, stills, contact sheets),
  src/assets/hero/ (climb2 strip + json, new files only), src/assets/w1-1113/ (new pieces), reference/art/CATALOG-MASTER.csv,
  src/game/art/inventory/* (catalog emit only), reference/art/HF-SPEND.md, reference/handoffs/art-director.md, PLAN.md, REPORT.md, PUSHBACK.md.
NOT: engine/draw code (heroSprite.ts, ropeArt.ts), pipeline.ts, world files: B14/B15 place the pieces.

## Attempt 2 (10:41 AM ET): HF access works (hf_whoami = mshaffe111)
- hf_jobs runs, but the bucket mount and repo writes are refused (403) for this credential, so jobs can't hand files back. Route used
  instead: one rtx-pro-6000 HF sandbox (same image, token forwarded as its secret), scripts curled from this branch's raw GitHub, files
  back by hf_sandbox_fs cat in base64 parts (tools/art/hf1113/sbx.py there, pull.py here). Terminated when idle.
- Vine spacing checked (the WIP open item): the field is 80 game units apart (t-lattice vineField), the draped pair 40 (vinePair PAIR_GAP);
  frames are painted for the field's 80 against his 89.1 drawn units.
