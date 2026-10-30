# Story round, 2026-10-30 (story-a)

On top of S-6/S-8/S-7 (`s6-s8-report.md`), merged with ccr (today's speed work and the release) and story-art 9b9a942. Stills, upright and sideways: `s9-stills/` (this round) and `s7-stills/` (the ending cards, the snail in a stage).

## What's new

**The Drake's two cups** (Matt approved the teacup ending; the lead approved the lines as written). In THE WEEKS AFTER, after Pell's shop and Flicker, before the Queen's tea at four. "Bring tea. Two cups." comes true, and "Maybe. If you tidy." comes back as Pokey's answer. Thursdays stay Venom Fang's. The Drake's card later ("Two cups. Both used.") reads as "still, every week".

**The General's trees, said once.** The narration line before the cards is cut; his card says it under its picture, the way the soldiers' and squirrels' lines went.

**After the end: the sequel hint** (Matt, A + B; the narration approved by the lead). After The End: the stopwatch (if found), then B (only if Thornbark was freed), then A (always), then the To be continued card. Matt's dialogue is word for word. story.test.ts checks the order, the conditions, Dot's one short line and the closing card.

**Fixed on the way**
- The Notch's painted twig was cropped into the keepsake frame sideways; it now stands on its own (`.fr-notch`), upright and sideways.
- The snail is bigger on his reader card.
- The ending cards no longer use `shadowBlur` (PERFORMANCE-RULES §2: none in the per-frame path).

## Polish check (STAGE-RULES §5b)

| Item | Still | Verdict |
|---|---|---|
| Satchel, keepsake page | s9-stills/satchel-satchel-up/side | Clean. |
| Journal | s9-stills/satchel-journal-up/side | Clean; the hand sits on the rules, World 10 fits. |
| Story scenes tab | s9-stills/satchel-scenes-up/side | Clean. |
| The Notch card | s9-stills/reader-w1_notch-up/side | Clean now: the painted twig stands uncropped beside the words. |
| The snail card | s9-stills/reader-w7_snail-up/side | Clean. |
| Dot's pocket card | s9-stills/reader-w8_pocket-up/side | Clean. **Rough (named before):** Dot's perch frame, not the item itself. |
| World 6 note, page 2 | s9-stills/reader-w6_note-up/side | Clean. |
| Ending cards | s7-stills/card-*-up/side | Clean, the squirrels' sign lettered. |
| Snail in a stage | s7-stills/snail-7-3-up/side | Clean. |
| **Drake's two cups** | s9-stills/drake-*-up/side | **Rough, waiting on art (hf-art-bosses):** it plays on the World 9 lava road with the Drake's prowling idle frame. No cave, no rock, no tea cosy, no cups are drawn, though the lines name them. The cave plate and a sitting / cup-holding Drake are asked for; it swaps in by name (DRAKE_CAVE in storyFinale.ts). |
| Sequel tag, B (the hollow) | s9-stills/tag-b*-up/side | Thornbark reads, dark as his hollow is. **Waiting on art:** the black thorn coming up is not drawn (the nest-night plate shows the nest in the rain). |
| Sequel tag, A (months later) | s9-stills/tag-a*-up/side | Storm, sleeping Pokey, Meeca (hands on hips for her last line) and Dot read well both ways. Upright, an old 1024 plate (nest-morning, council) now fills the view with no dark band: the camera comes in just far enough (storyArt.ts shortPlate), and the figures keep their footing. **Waiting on art (the Gemini cards):** the scarf (on Pokey and on the thorn) and the thorn itself are not drawn. |
| To be continued | s9-stills/tag-a8-silence-*, tag-a8-continued-* | Clean. The picture goes dark, a beat of silence (2 s, the music hushed), then "To be continued" comes up on the menu kit's carved log plaque, then "tap to finish". Fits a 412-wide phone. |

## Gate

(filled in below when the run on the final head finishes)
