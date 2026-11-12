# ART-W1-TRAPS: paint World 1's trap pieces for 1-3 (the lead, 2026-11-12 11:50 AM ET). Opus 5.5 high (art = core tier). Branch t-w1-art.

Why: Matt sees 1-3 on his test link TONIGHT (about 9 PM ET) "to know where we are". 1-3's new trap (Pokey punches a vine handle; a
hive or stone drops beside a snake; the snake glides away, scared, unhurt) plays right but its pieces are code-drawn stand-ins. The
lead's judgment of W1C's stills (d80abcba, reference/qa-reports/W1C/stills/ on origin/t-w1-creatures): the two green poles with
leaf-clump tops read as lamp posts or umbrellas, not rainforest; the stone is a grey egg; the hive is plain; the handle does not read
as "punch me". Hugging Face is the lead's call (CLAUDE.md); this job is decided.

First: `git fetch origin ccr-702d3c49-i33jeq t-w1-creatures` and read from the lead's branch: reference/roles/README.md ("Lean output"),
reference/roles/CONTENT.md, reference/LAWS.md, reference/LESSONS.md, reference/methods/hf-art.md (the whole method: model, LoRA, job,
token rule), reference/STAGE-RULES.md §4 and §5b, reference/art/HF-SPEND.md. From origin/t-w1-creatures: reference/art/W1-TRAPS-LIST.md
(W1C is pushing it now: every piece, size against Pokey, layer, footing, states, where the engine draws it). If it is not there yet,
start from the five pieces below and reconcile when it lands.

## The pieces (World 1's painted style and palette, the style LoRA; each reads at phone size, upright and sideways)
1. The HANDLE: reads as "punch me" at Pokey's punch height: a thick vine loop or knot tied to a low branch stub or root. Two states:
   set, and sprung (snapped, two short curled ends).
2. The ANCHOR the load hangs from: a branch arm reaching in from a leaning sapling or a trunk; it replaces both green poles. Scenery,
   no footing (unless the list says the lay stands on it).
3. The VINE from the handle up and over to the load: short painted lengths (2-3), both ends tucked into leaves or bark.
4. The HIVE: a wild hanging hive, papery, warm; states: hanging, and landed (on the ground, bumped).
5. The STONE: a mossy stone in a vine sling; states: hanging, landed.
Size: every piece measured against Pokey's height (R-165.107, inventory scale); the list's sizes win.

## Steps
1. Takes on Hugging Face per hf-art.md. Before cutting anything: ONE contact sheet of the best takes, sent to the lead
   (session_01FhBbYP63h7cCX8DyW69stq) with its path, pushed. The lead judges first (show first); wait for the lead's pick, keep
   making takes of anything the lead sends back.
2. Cut, defringe, size, and label every piece in the master catalog (inventory first: worlds, engine use, footing, layer, ship size).
3. Wire them in: merge the newest origin/t-w1-creatures first; replace the code-drawn stand-ins at the file:lines the list names. No
   gameplay change (the trap's boxes, timings and the lay stay exactly as W1C made them; the stage lock must not move).
4. Stills in the real page, trap0/trap1/trap2 before / trap / glide / after, upright and sideways (W1C's names and method), sent to the
   lead first. Polish check section in the report, each item with its still.

## Rules
- GPU cap for this job: $6 (balance $63.53 is the FINAL budget, about $10 reserve). Every job logged in reference/art/HF-SPEND.md (job
  id, minutes, cost, what it bought). The Hugging Face token never goes in code, commits, files, messages or memory.
- Gates: tsc, the tests for what you touched, artcheck, the inventory/scale gate, drawcheck on 1-3 if you touched drawing. 4 MiB and
  4096 px limits.
- Safe-keeping push every 30 min. Stop line 4:30 PM ET or 40% context: push and report.
- Return: reference/qa-reports/ART-W1/REPORT.md (60 lines or fewer) and a send_message to the lead, 10 lines or fewer. No PR.
