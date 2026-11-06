# TRIAL (not to merge until Matt picks): deep pits fade out under the end pieces

The level designer's ask, through the lead, 2026-11-05: the dark follows the bank faces down to where the painted end piece stops,
then fades out over about 300 px so the forest shows, with no widening. Each still has the accepted look (engine-render 2c17e6d6:
near black all the way down, widening with the faces) on the left or on top, and the trial on the right or below. All at 3x.

- 01, 02: the planner's 1-5 at still 11's spot (engine-mixer fdabad42, layout 1, x 4250), upright and sideways.
- 03, 04: main's 1-9, a real drop between two banks (layout 1, x 19150), upright and sideways.

What the trial does: the dark keeps its width from just above the end pieces' foot (no step out), starts fading 80 px above the foot,
and is gone 300 px later.
What it can't fix: the banks' own soil steps outward at that foot (the end piece's art is cut straight there), so in the trial the forest
shows as two light strips either side of the fading dark, for about 300 px (01 right). On 1-9 the difference is small (03, 04).
