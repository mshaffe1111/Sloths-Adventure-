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
- The fern hint (wayside.ts hidesFern): the snail is out in the open, not in a fern, so 1-3 and the other snail stages no longer get "one of these plants looks different"; Dot's pocket stages and 1-4 (the Notch) do. wayside.test.ts names them.

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
| Drake's two cups | s9-stills/drake-*-up/side | Clean. In his own cave (hf-art-bosses' plate drake-cave): the boulder, his gold and the lumpy knitted cosy heaped at the left, which is exactly what Dot calls a sock. The Drake (story-art's DR cels from hf-art-bosses' paintings) sits stiff for "You came.", bows over the cosy, then holds the good china cup in both claws with his eyes half shut; Pokey's pot, then his own cup, at his feet. Framed so the sitting Drake's head stays in the picture sideways. |
| Sequel tag, B (the hollow) | s9-stills/tag-b*-up/side | Thornbark reads, dark as his hollow is. **Still waiting on art:** the black thorn coming up at night is not drawn (nest-night shows the nest in the rain); Matt's 24 has the thorn, but in the morning with the scarf already on it. |
| Sequel tag, A (months later) | s9-stills/tag-a*-up/side | Clean, on Matt's Gemini cards: the storm and the sleeping Pokey with the scarf trailing (storm-returns), the empty branch with the scarf on the black thorn (nest-morning, now Matt's 24, tall, so no band upright), Meeca clutching the scarf, then setting off with Dot beside her (her new scarf cels). Brought in close upright so Meeca carries her last line. |
| To be continued | s9-stills/tag-a8-silence-*, tag-a8-continued-* | Clean. The picture goes dark, a beat of silence (2 s, the music hushed), then "To be continued" comes up on the menu kit's carved log plaque, then "tap to finish". Fits a 412-wide phone. |

## Gate

On f1d7347b (story-a merged with ccr 4ef7e1ac):
- `npx tsc --noEmit -p .`: clean.
- Tests (audio, game, gen2, components, tools): 2050, 2048 pass, 0 fail, 2 todo (the known 4-3 boulder TODO is one).
- `npx vite build`: OK, no file over 4 MiB.
- `node tools/perf/artcheck.mjs`: PASS.
- `node tools/perf/drawcheck.mjs`: PASS (the gradients breach on ctest-mix14 was the base's, fixed on ccr at 4ef7e1ac, and gone here).
