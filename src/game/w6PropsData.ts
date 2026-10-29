/** Generated from tools/art/w6to10/geminicut.py (Matt's Gemini sheets w6a-puzzle and w6b-water-room-take2, keyed and cut 2026-10-29):
 * World 6's puzzle pieces (the root lever up and down, the mossy plate up and down, the root door closed and open; each pair on one
 * canvas and anchor, so they swap in place) and the water room (raft, sluice wheel, gauge post, seesaw, stone, lily pads). Frames are
 * anchored at the middle of the foot (ax, ay), at the painted size: scale to the stage. For the World 6 hook-up (gen2-w6-hook). */
export interface PropFrame { x: number; y: number; w: number; h: number; ax: number; ay: number }
export const W6_PUZZLE_URL = new URL('../assets/w6to10/gemini/w6a-puzzle.webp', import.meta.url).href;
export const W6_PUZZLE_SIZE = { w: 2048, h: 235 };
export const W6_PUZZLE_FRAMES: Record<string, PropFrame> = {"lever-up": {"x": 0, "y": 0, "w": 179, "h": 225, "ax": 89.5, "ay": 225}, "lever-down": {"x": 183, "y": 0, "w": 179, "h": 225, "ax": 89.5, "ay": 225}, "plate-up": {"x": 366, "y": 0, "w": 281, "h": 108, "ax": 141.5, "ay": 108}, "plate-down": {"x": 651, "y": 0, "w": 281, "h": 108, "ax": 141.5, "ay": 108}, "door-closed": {"x": 936, "y": 0, "w": 256, "h": 235, "ax": 128.0, "ay": 235}, "door-open": {"x": 1196, "y": 0, "w": 256, "h": 235, "ax": 128.0, "ay": 235}};
export const W6_WATER_URL = new URL('../assets/w6to10/gemini/w6b-water-room-take2.webp', import.meta.url).href;
export const W6_WATER_SIZE = { w: 2048, h: 276 };
export const W6_WATER_FRAMES: Record<string, PropFrame> = {"raft": {"x": 0, "y": 0, "w": 286, "h": 101, "ax": 120.5, "ay": 101}, "sluice-wheel": {"x": 290, "y": 0, "w": 189, "h": 256, "ax": 103.5, "ay": 256}, "gauge-post": {"x": 483, "y": 0, "w": 53, "h": 276, "ax": 27.0, "ay": 276}, "seesaw": {"x": 540, "y": 0, "w": 317, "h": 158, "ax": 185.5, "ay": 158}, "stone": {"x": 861, "y": 0, "w": 304, "h": 160, "ax": 174.0, "ay": 160}, "lily-pads": {"x": 1169, "y": 0, "w": 312, "h": 134, "ax": 164.0, "ay": 134}};
