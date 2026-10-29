# Swimming (6-7's root well): polish check (STAGE-RULES §5b), 2026-10-29

Videos: `swim-upright.mp4`, `swim-sideways.mp4` (24 s each: the first swim, swimming both ways, a dive, out by the bank, back in, out by a
flick). Stills: `polish/`, `calm-vs-dirty.png`, `swim-closeup-*.png`.

| # | Item | Result | Proof |
|---|---|---|---|
| 1 | Painted, not drawn | Pass. The water is Matt's World 6 water sheet (still + rippled strips, ripple ring, bubbles); Pokey is his swim sheets. Code only adds glints and the splash drops. | `swim-closeup-sideways.png` |
| 2 | Nothing copy-pasted | Pass, with one note. The strips' ends are cross-faded (no seam). The still strip's bright glare repeats every 200 units: in the 330-wide well it shows about twice, softened by the rippled strip breathing over it. | `polish/2-no-seams-closeup.png` |
| 3 | Art matches what it is | Pass. Clear, still, see-through water vs murky, rushing water with dead leaves. Fixed: the dirty-water warning fired while he swam in the clean well; stage tips now wait until he is out (still before the pit). Known: the raft (a kit plank, not mine) rises above the water to the shelf. | `calm-vs-dirty.png` |
| 4 | Light fits the place | Pass. The well sits in the room's own dusk light. | `swim-closeup-upright.png` |
| 5 | Pokey on model, big enough | Fixed: drawn higher in the water (head, shoulders, the stroking arm out), water in front lighter, camera eases in 1.2x while he swims. **Not fixed: the tread and dive frames have no satchel or strap** (crawl and first-swim frames do). Needs new art: prompt below. Upright he reads about half the size of sideways, because the room's framing keeps the shelf and raft in view. | `polish/5-size-sideways.png`, `polish/5-size-upright.png` |
| 6 | Framing works both ways | Pass sideways. Upright: the camera centres on him, but the room framing leaves the upper half showing the shelf and raft (the puzzle, not empty sky). | `polish/6-7-framing-and-text.png` |
| 7 | Text out of the way, right speaker | Fixed: the speech box no longer covers him in the water. Lines are 8 and 9 words. Speaker: Pokey, because Dot is away from 6-6 on (STORY-REWRITE "The last note"; wayside.ts dotPresent). **§5b says "Pokey only in World 7": that clashes with the story for 6-6..6-9; the lead or Matt should rule.** | `polish/6-7-framing-and-text.png` |
| 8 | Every move it teaches is needed | Pass. Swimming is how he crosses the well with the water up; out by the bank or a flick are both used. | video |
| 9 | Moments feel like moments | Fixed: a big splash, a small shake, the whoosh, half a second on the flail, the camera easing in to 1.5x, the `first` sheet playing to the grin, then his line, then how to get out. Once per stage. | `polish/9-first-swim-sideways.png`, `polish/9-first-swim-upright.png` |
| 10 | Motion smooth | Fixed: every change of swim pose (first to tread, tread to crawl, crawl to dive) cross-fades over 0.22 s; it used to pop. Loops play at the sheets' own fps (crawl 8, tread 6). | `polish/10-motion-sideways.png`, `polish/10-motion-upright.png` |

## The missing satchel (item 5): Gemini prompt for Matt

Attach: `reference/animation-sheets/pokey-swim/surf/surf_00.png` (his satchel and strap while swimming) and
`reference/animation-sheets/pokey-swim/tread/tread_00.png` and `under/under_00.png` (the poses to redo).

> Redraw these two poses of Pokey the sloth exactly as they are (same style, size, colours, pose and expression), adding his brown
> leather satchel: the strap runs over his left shoulder and across his chest, the bag sits on his right hip. Pose 1: treading water
> upright, paws paddling in front of his chest. Pose 2: gliding underwater, body long and level, cheeks puffed, arms reaching forward.
> Side view facing right, full body, plain flat magenta (#FF00FF) background, no water, no shadow, no text.

Then the HF pipeline (tools/art/w6/swim/) animates them as before and `pack.py` repacks the atlas; the game picks them up with no code change.
