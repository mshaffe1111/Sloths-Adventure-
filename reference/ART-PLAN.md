# Art plan: Worlds 5-10 on Hugging Face (2026-10-28)

Matt, 2026-10-28: "start getting the Hugging Face art set up ... Do enemies first, then anything that we need to finish up the game. Do
the hardest stuff first, and then for the remaining amounts, use for art and props." Budget update the same day: about $70 left on the
account; plan the whole run to **$65** (round 1 up to $40 on enemies, round 2 the rest), keep ~$5 spare.

Show first: nothing here goes into `src/` yet. Results go to the gallery `tools/art/gallery-w5-10/index.html` for Matt to pick from.
Scripts and specs: `tools/art/w6to10/` (job scripts, spec maker, fetch and sheet tools), `tools/art/gen/spec-w6to10-*.json`.

## 1. Inventory: what Worlds 5-10 call for, and what exists

Story: `reference/STORY-REWRITE.md` (World 5's tea table to the fortress gate); stages: `src/game/stagePlan.ts`; fights:
`src/game/bossDefs.ts`; enemy mix per world: `stageGenerator.ts hardKind` (W6-10 use the World 1-4 jungle cast today: jaguar,
ocelot, tayra, caiman, boa, frog, plus the harpy from W6).

### Guardians (stage 10 of each world, plus the secret one)

| World | Guardian | Art in the game now | Character model | Animated clips | What is missing |
|---|---|---|---|---|---|
| 5 | Tarantula Queen (Silk Hollow) | `queen-atlas` (25 painted poses) + `queen-anim` (idle, skitter, silk/slam/net tell+act, hurt, stunned, defeat, sit, pour) | `queen-qwen-lora` | yes (2026-10-26, not wired) | painted lair backdrop |
| 6 | Marsh Reaver (giant otter, spear) | `reaver-atlas`, 17 poses (no walk: advances in three lunge frames) | `reaver-qwen-lora` | **none** | every move animated, tells, hurt/stun/defeat; painted lair |
| 7 | Stone Idol Golem | `golem-atlas`, 32 poses | `golem-qwen-lora` | **none** | as above (awaken, march, slam, beam, quake, defeat to rubble) |
| 8 | Night-Wing Monarch (giant bat) | `monarch-atlas`, 17 poses | `monarch-qwen-lora` | **none** | wingbeat, hover, screech, dive, hurt, fall; lair |
| 9 | Magma Drake | `drake-atlas`, 19 poses (no walk) | `drake-qwen-lora` | **none** | walk, fire breath, tail spin, eruption stomp, leap, hurt/stun, petrify; lair |
| 10 | General Iron-Claw (war look) | `ironclaw-atlas`, 37 poses | `ironclaw-qwen-lora` (+ `general` plain sloth) | **none** | the final fight's march, slam, slash, roar, stomp, hurt/stun, defeat; lair |
| secret | Thornbark (7-7's hollow) | `thornbark-atlas`, 16 poses (`hollow.webp` lair exists) | `thornbark-qwen-lora` | **none** | march, gallop, roar, whip, slam, guard, the freed rest |

Today all six W6-10 guardians cut between still poses. The Queen (W5) and the Sky Sovereign (W4) are the only guardians with clips.

### Stage enemies

| World | Called for by story / plan | Exists | Weak / missing |
|---|---|---|---|
| 5 (5-6..5-9) | spiders in silk, the Queen's garden guards | jumping spider clips packed, Butler (pose sheet + clips), Dangler, Seamstress, Orchid Mantis, Dozer moth (trained models + pose sheets, 2026-10-26) | Dangler/Seamstress/Mantis/Dozer are poses only (no clips); waiting on Matt's picks |
| 6 | "hunters in the mangrove" with spears (6-5), the caiman root, flat-water things | otter runners (scamper, swim, jab) and caiman root (snap) clips (2026-10-28 `anim/`), mangrove crab + piranha designs with clips (overnight run) | crab/piranha designs await Matt's pick; no creature models for them |
| 7 | "Stone Sentries" (7-5) | stone sentry design + clips (overnight run: idle, walk, jab, crumble) | awaits Matt's pick |
| 8 | bat roosts (8-4), night hunters (8-8) | fruit bat + spectacled owl designs + clips (fly, swoop, hurt) | no perch/roost-sleep or wake clip; await pick |
| 9 | ash-field hunters (9-6) | lava lizard + ember beetle designs + clips (walk, idle, spit/charge, hurt, flip) | await pick |
| 10 | guards on the walls (10-7, 10-9) | the General's soldiers (sloths in olive, `soldier-anim`: march, idle, look; lanterns, no weapon), capybara `guard` (march, stand, tell, jab, after, hit) | soldiers have no attack, hurt or knocked-down; Matt has not said what the wall guards carry |

The overnight run's ten creature designs (gallery https://claude.ai/artifact/J6iuizvLB1iC6Ge8whThe9) already have 3-4 clips each in
`mshaffe111/slothadv-gen/clips/cr-*` and `m1k-*`: **not regenerated here** (Matt still has to pick the designs).

### Flicker, the firefly guide (Matt, 2026-10-28: "enough Flicker animations that we can get through the game")

Where he is used after Meeca's stage (`reference/STORY-REVIEW-2026-10-27.md` items 4, 6-10, approved; STAGE-RULES "Dot (or Flicker
while Dot is away) explains any locked exit"; GEMINI-LEDGER F6 "Flicker's on-request tiered hints": sparkle at 15 s, a thought at 30 s,
a demonstration at 50 s):

- 5-M (Meeca's stage): first line in the dark, "Round and round" (shows the circle), "I was the light" (very small).
- World 6 halfway scene: he arrives ("You're Pokey ... Flicker. Somebody who owes her."); 6-6 "Look where I'm lighting" (lights the way
  in the dark roots); 6-8 sits on the root beside Pokey; 6-9 warns "It's nearly noon"; after the Reaver he "had gone ahead to light the
  next root".
- World 7: the only company ("There was only Flicker"; "Flicker blinks"; "Flicker didn't fill it").
- World 8: leads with his family's lights ("Flicker went on ahead"); falls asleep with Pokey; meets Dot on Pokey's satchel strap,
  "glowing at her"; banter (he holds his ground: "You're hovering."); lights the branch before Dot can say which.
- World 9: "Glow quietly." / "I don't have a quiet setting."; "Yes." with Pokey in the Pell scene.
- World 10: guides Pokey with Dot to the end; the ending, all together.
- Every stage from 6-5 on: locked-exit explanations and the tiered hints while Dot is away.

States he needs, and where each comes from:

| State | Use | Source |
|---|---|---|
| fly loop | following, travelling | exists (`reference/animation-sheets/flicker/fly`, 2026-10-28) |
| hover | idle beside Pokey, hint tier 1 | exists (`flicker/hover`) |
| perch / rest | on the root, on the satchel strap, asleep | exists (`flicker/perch`) + new **doze** |
| talk | every line, tier 2 thought | Matt's cells fl1/fl13 in the game; new **talk** loop clip |
| show the way (circle) | "Round and round", tier 3 demonstration | new **show** clip (cell 16) |
| lead ahead | "Look where I'm lighting", "went on ahead" | new **lead** (looks back, beckons) and **dart** (bursts ahead) |
| glow pulse | lighting the dark, "glowing at her", tier 1 sparkle | new **glow** clip |
| turn | turning to Pokey or Dot | new **turn** clip |
| happy | banter, the ending | new **happy** (laughs, bounces) |
| worried | 6-9 "nearly noon", World 10 | new **worried** |
| sad / very small | "I was the light", "Somebody who owes her" | cell fl15 + new **sad** clip |
| startled | meeting Dot, hazards | new **startled** |
| smug / holds his ground | "You're hovering.", "You can say the next one." | new **smug** (cell 4) and **shrug** (cell 7) |
| blink | "Flicker blinks" | new **blink** |

All new clips start from Matt's own cells (cut exactly as `tools/art/w5puzzle/cut.py` does), so no new character model is needed: the
clips can only move what he drew. If Matt wants poses the sheet lacks (back view, holding something), a Flicker model (~$3.30) or a
second Gemini sheet comes next.

### Backdrops and props (finish the game)

- Lairs: only the Prowler (`lairs/prowler-lair.webp`) and Thornbark (`backdrops/hollow.webp`) have a painting (2560x1430); the
  W5-W10 lairs are drawn in code (`lair*.ts`).
- Stage backdrops: W6-W9 have one far/mid/near set each; World 5 has five times of day (`w5dusk1`, `w5gold2`, `w5twi1`...), and
  STAGE-RULES §4 wants every world to go through the day, so W6-W9 lack 2+ far variants each.
- Props: kits `src/assets/kits/w6-w10.webp` exist (Gemini); Matt's Gemini prompts for W2-W10 ground/climb kits are on the Art Still
  Needed page. HF takes are an optional second source.

## 2. Ranked plan (hardest first) with costs

Unit costs, measured on this account (rtx-pro-6000, $2.75/h): a Wan 2.2 I2V clip with the motion model, 49 frames at 832x480, 30 steps,
is **~4.4 min = ~$0.20** with the model load shared (anim run: 30 clips, 131 min, $6.00); 704x704 ~$0.25. A creature model (Qwen LoRA,
800 steps) is ~1.2 h = **~$3.30** (`tools/art/w5/train_w5creatures.py`). A Qwen-Image still is ~1 min (~$0.05) plus a ~6 min load
per job. CPU jobs (start pictures, sheets) cost cents.

| # | What | Why it is hard | Jobs | Est. $ | Round |
|---|---|---|---|---|---|
| 1 | **General Iron-Claw** (W10 final guardian): idle, war march, charge, overhead slam, club slash, roar, stomp, hurt, stunned, defeat; 10 moves x 2 seeds | biggest fight, 37 poses, cape and club must hold together | 1 GPU | 4.4 | 1 |
| 2 | **Stone Idol Golem** (W7): awaken, march, charge, hammer slam, roar, beam, quake stomp, hurt, stunned, crumble; 10 x 2 | grey stone (tight key), rubble defeat | 1 GPU | 4.4 | 1 |
| 3 | **Magma Drake** (W9): idle, walk, fire breath, tail spin, eruption stomp, leap, roar, hurt, stunned, defeat; 10 x 2 | quadruped walk (no walk in the sheets), fire | 1 GPU | 4.4 | 1 |
| 4 | **Marsh Reaver** (W6): idle, advance, spear thrust, swipe, vault smash, mud sling, roar, hurt, stunned, defeat; 10 x 2 | spear must stay one piece; grey-brown fur | 1 GPU | 4.4 | 1 |
| 5 | **Thornbark** (secret): idle, march, gallop, roar, briar whip, overhead slam, claw flurry, leap, guard, freed rest; 10 x 2 | cape, banner pole, bone club | 1 GPU | 4.4 | 1 |
| 6 | **Night-Wing Monarch** (W8): hover, fly, glide, screech, dive, hurt, fall, roost; 8 x 2 at 704x704 | a flyer: wings flicker and drift out of frame | 1 GPU | 4.2 | 1 |
| 7 | Re-runs of broken boss clips (off-model, sliding, frozen) | | 1 GPU | 3-5 | 1 |
| 8 | Creature models for Matt's picked W6-9 designs (crab, piranha, sentry, bat, owl, lizard, beetle) so their attacks and hurts can be posed on-model | needs Matt's picks first | 7 trainings | 23 | later |
| 9 | W10 wall guards in combat (soldiers: baton/spear jab, hurt, knocked down) | needs Matt's call on what they carry | edit + clips | 3 | later |
| 10 | **Painted lairs** W5-W10 (calm and enraged takes, 2560-wide painting like the Prowler's), style model | backdrops | 1 GPU | 2.5 | 2 |
| 11 | **Times of day** for W6-W9 stage far backdrops (two new times each, 3 takes) | | (same job) | 1.5 | 2 |
| 12 | The ten guardians with their collars off (ending), each from its own model | 10 model loads | 1 GPU | 3 | 2 |
| 13 | W5's four posed creatures (Dangler, Seamstress, Mantis, Dozer) animated from their pose sheets: walk/idle/attack/hurt | | 1 GPU | 6.5 | 2 |
| 14 | Night-roost and wake clips for the fruit bat, and the W6-W9 props in the style model | | 1 GPU | 2-4 | 2 |
| 15 | Moving lair plates (a slow Wan loop of each new lair: mist, glow, embers) | | 1 GPU | 1.5 | 2 |

Round 1 = items 1-7 (~$30-32 of the $40 cap). Round 2 = items 10-15 in that order with what is left, stopping at $65 total.

## 3. Cost ledger (exact: job durations x $2.75/h; CPU jobs at cpu-upgrade cost cents and are listed for completeness)

| Job id | What | Flavor | Minutes | $ |
|---|---|---|---|---|
| 6ae2376e3fb22a235dd45b9c | starts (cancelled at once: "1h30m" read as 1 s) | cpu-upgrade | 0 | 0.00 |
| 6ae2377c3fb22a235dd45ba6 | guardians' starts on CPU (cancelled: Real-ESRGAN too slow) | cpu-upgrade | 9 | ~0.01 |
| 6ae2383a3fb22a235dd45d1a | W5 creatures' starts on CPU (cancelled, redone on GPU) | cpu-upgrade | 12 | ~0.01 |
| 6ae2399641e90535df779658 | starts on L4 (cancelled while waiting for hardware) | l4x1 | 0 | 0.00 |
| 6ae239c53fb22a235dd45f5f | starts, failed (old torch, no Blackwell kernels) | rtx-pro-6000 | 3.6 | 0.16 |
| 6ae23aac3fb22a235dd460ea | starts, failed (pip PEP 668) | rtx-pro-6000 | 0.3 | 0.01 |
| 6ae23aca3fb22a235dd46116 | guardians' 56 starts | rtx-pro-6000 | 0.6 | 0.03 |
| 6ae23b0441e90535df779883 | W5 creatures' 16 starts | rtx-pro-6000 | 0.4 | 0.02 |
| 6ae23a3f41e90535df779750 | Iron-Claw, 20 clips | rtx-pro-6000 | 89.1 | 4.08 |
| 6ae23a4141e90535df779754 | Golem, 20 clips | rtx-pro-6000 | 81.7 | 3.74 |
| 6ae23a4341e90535df77975c | Drake, 20 clips | rtx-pro-6000 | 75.3 | 3.45 |
| 6ae23a4541e90535df779760 | Reaver, 20 clips | rtx-pro-6000 | 85.2 | 3.91 |
| 6ae23a4741e90535df779766 | Thornbark, 20 clips | rtx-pro-6000 | 79.4 | 3.64 |
| 6ae23a493fb22a235dd4602f | Monarch, 16 clips | rtx-pro-6000 | 79.7 | 3.65 |
| 6ae23b0741e90535df779887 | W5 creatures, 16 clips | rtx-pro-6000 | 69.9 | 3.21 |
| 6ae23b083fb22a235dd4617c | W5 creatures, 16 clips | rtx-pro-6000 | 70.0 | 3.21 |
| 6ae23b523fb22a235dd461f2 | round 2 stills, 54 (lairs, times of day, collars off, collar, props) | rtx-pro-6000 | 23.9 | 1.10 |
| 6ae23b5441e90535df7798e9 | round 2 stills, 54 | rtx-pro-6000 | 23.8 | 1.09 |
| 6ae2404041e90535df779f4e | Flicker, 14 clips | rtx-pro-6000 | 68.3 | 3.13 |
| 6ae240423fb22a235dd46891 | Flicker, 14 clips | rtx-pro-6000 | 68.5 | 3.14 |
| 6ae24c6b3fb22a235dd47573 + 250bf/250c1/25cbb/26425 | clip previews and checks (5 jobs) | cpu-upgrade | ~9 | ~0.01 |
| 6ae2509e41e90535df77b060 | title pair, 4 clips | rtx-pro-6000 | 20.6 | 0.94 |
| 6ae250a141e90535df77b066 | title pair, 4 clips | rtx-pro-6000 | 20.4 | 0.94 |
| 6ae250a33fb22a235dd47b6b | title pair, 4 clips | rtx-pro-6000 | 20.6 | 0.94 |
| 6ae253633fb22a235dd47f4f | title idles retry (no motion model), 4 | rtx-pro-6000 | 18.7 | 0.86 |
| 6ae253643fb22a235dd47f54 | title idles retry (motion 0.5), 2 | rtx-pro-6000 | 11.0 | 0.51 |
| 6ae2539a41e90535df77b471 | re-runs of broken clips, 8 | rtx-pro-6000 | 35.9 | 1.64 |
| 6ae2578541e90535df77ba26 | title frames sharpened (Real-ESRGAN) | rtx-pro-6000 | 3.7 | 0.17 |
| 6ae25cdf3fb22a235dd48cd5 | title pair redo (end pinned), 2 | rtx-pro-6000 | 7.4 | 0.34 |
| 6ae25ce141e90535df77c0de | title pair redo, no motion model, 2 | rtx-pro-6000 | 6.6 | 0.30 |
| 6ae25f963fb22a235dd490ac | pair redo sharpened | rtx-pro-6000 | 0.9 | 0.04 |
| 6ae264773fb22a235dd496b9 | boss batch 2 starts | rtx-pro-6000 | 0.4 | 0.02 |
| 6ae264cc41e90535df77ca2e | water signs + side-on prop retries, 12 stills | rtx-pro-6000 | 5.1 | 0.23 |
| 6ae264b441e90535df77ca10 | moving lair plates, 6 clips | rtx-pro-6000 | 21.5 | 0.98 |
| 6ae2647f3fb22a235dd496c8 | boss batch 2, 16 clips | rtx-pro-6000 | 66.9 | 3.07 |
| 6ae264813fb22a235dd496cd | boss batch 2, 16 clips | rtx-pro-6000 | 66.5 | 3.05 |
| 6ae2648341e90535df77c9bb | boss batch 2, 16 clips | rtx-pro-6000 | 66.3 | 3.04 |
| 6ae2754341e90535df77d9a7 | previews of every clip for the gallery | cpu-upgrade | ~10 | ~0.01 |

Painted logo: cancelled by Matt before it ran, $0.

Total: **$54.65** (round 1 enemies + Flicker $35.6; the title pair $5.0, inside the same cap; round 2 $14.1).
Under the $65 cap; new jobs stop at $60 (coordinator), the rest kept for re-runs after Matt's gallery review.

## 4. Results (2026-10-28)

Gallery for Matt's picks: `tools/art/gallery-w5-10/index.html` (built by `tools/art/w6to10/gallery.py` from the bucket's
`w6to10/check/carrier-*.png` and `w6to10/stills/carrier-*.png`; 238 clip previews, 120 stills, 368 files, 16 MB, every file < 170 KB;
the pictures are git-ignored, rebuild them with the command in gallery.py's header). My verdicts: `tools/art/w6to10/verdicts.json`.
Title pair (delivered to the polish helper): packed sheets in the scratchpad `titleanim/`, made by titlegpu.py / titleup.py / titlepack.py.

- Good: Thornbark (all 15 moves), Golem, Iron-Claw (most), Drake (most), Reaver's attacks, hurt, stun and defeat, the four W5
  creatures, Flicker's in-place moves (talk, blink, glow, happy, sad, doze, smug, startled, worried, shrug, turn), the six painted
  lairs and their moving plates, the times of day, the collar, the water sign.
- Broken / weak: the Reaver will not walk (skipped for now); Iron-Claw's jump; Drake's leap shrink and claw (stands up like a person);
  Monarch's flight loops flicker and shrink (takeoff broken; roost, screech, glide and fall are good); Flicker's travelling moves
  (dart, lead, show) fly away from the camera; the Queen's and the General's "collars off" (the Queen's model gives her a woman's
  face; the General's keeps his armour); the props side-on (style model draws them at an angle: use Matt's Gemini kit sheets).
- Next $ (about $5 left before the $60 stop): re-run Monarch hover/fly with the motion model off or at 0.5 (the title idles showed
  that cures size drift), and Flicker lead/dart with the last frame pinned to the first (pairgpu.py's fix), ~$2-3.
