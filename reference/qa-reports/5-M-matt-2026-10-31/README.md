# 5-M on Matt's phone, Oct 31 2026 ~10:22 AM ET (live release #55, PORTRAIT/upright, Android)

## matt-start-portrait.mp4 (start-sheet.jpg, start-zoom.jpg)
- After the title card: the thought bubble "All asleep. Soft feet. Go." is up, but **no Meeca is drawn under it**. Only the background (orchids, two webs, the ground) shows.
- The whole screen **pulses purple twice** (a full-screen violet tint, then back): see start-zoom.jpg frames 3-6.
- The camera then pans right to the camp (tent, sleeping soldiers, lantern). Meeca is still not visible.

## matt-logs-portrait.mp4 (logs-sheet.jpg, logs-fall-zoom.jpg)
- Meeca (visible here) and Flicker hop log to log over the gully. She lands on a log (dust puff), then jumps right. **In portrait the next log is off screen**, so it's a blind jump.
- She falls: the camera drops past the logs into the gully (pink orchid at the bottom). Then she is **put back beside the cocoon and post at the climb's start**. "It just resets you."
- Same again in the second half of the clip.

## Blind tester (qa-5m-blind, sideways on the dev server)
- About 11 tries to get onto the first high log.
- Twice she stood on top of a log and dropped through it.
- Got stuck at the "mark it" stump; the circle gesture is never taught.
- Flicker's speech box is cut off at the left in portrait.

## logs-flicker-10fps.jpg (matt-logs-portrait.mp4, first 3.2 s at 10 fps)
- Matt: "Meeca's not there either. So she flickers on and off."
- Several times a second the WHOLE SCREEN TINTS PURPLE (rows 1-2), and while it does Meeca turns pale pink and see-through, like a hurt/invincibility blink. Then she's normal again, then purple again. Same purple pulses as the start video, where she isn't drawn at all.
- Lead's read: this looks like the HURT FLASH + the after-hurt blink firing over and over: something keeps "hurting" Meeca (a hazard the stage didn't mean to have, such as the webs drawn beside her at the start, or a world-wide hazard/flash pass that 5-M now inherits), or the hurt flash/blink is being triggered by something else. RealPlay keeps her invincible, so the node tests can't see it.

## matt-invisible-2331.mp4 (Matt, 2026-10-31 11:31 PM ET, 13 s, on 0.9.x, upright phone)
Lead's read of the frames (4 fps sheet):
- 0-1.5 s: the purple flashes are the phone's screen-recorder start pulse (as before), not the game.
- ~2.5-5 s: Meeca leaves the camp, walks down the stairs to the first log pit; "Too far to jump. The high way, then." shows while she stands on the low step beside the tall post, BELOW the top ledge.
- ~6.2 s on: the bubble fades and MEECA IS GONE for the rest of the clip (to ~11.5 s). The camera holds on the post, the pit wall and the dirt face; no Meeca anywhere in frame, no fall animation, no restart.
Leads for the fix helper (not proven): she is inside the pit at the post's foot, i.e. down where the QA rerun saw her "half into the dirt face on the little post" (room 5's wall foot): likely DRAWN BEHIND the dirt/wall face or the post (draw order) or the camera not following her down into the pit; "falling through things" may be the same thing seen from outside. Reproduce at the first pit (x ~4.5-5k), walk off the low step toward the post, and log her position, her layer and the camera.
