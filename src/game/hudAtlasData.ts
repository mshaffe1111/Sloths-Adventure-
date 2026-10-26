/**
 * Generated (scratchpad artin/tools/pack.py) from the painted HUD and guide pieces Matt approved on 2026-10-26 (revampart/hud and
 * revampart/ring). Every piece is painted at 3x phone size: 1 css px = 3 atlas px. Row 0 is the vine tile four times across the whole
 * sheet, so a CSS repeat-x of that band tiles cleanly. The vine end is stored facing right (flip it for the left end), the arrow
 * pointing down (turn it in code).
 *   vineLead   starts at the screen edge, with leaves; its vine centre is at y=57 (the tile's at y=27: offset the tile by 30 px)
 *   vineEnd    the curl at the end of a run; join its flat left end to the tile; its vine centre is at y=82
 *   tendril    a hanging tendril for an icon: crop the top part to length
 *   menuLeaf   the hanging Menu leaf, its three lines baked in
 *   numPlate   the small backing behind the lives and score numbers (cream digits with an ink stroke)
 *   goalPlate  the goal counter's plate (dark face for cream digits); its text box is about 60% x 55% of it
 *   goalCard   the stage-start card; the parchment is about x 13-86%, y 19-85% (a leaf covers the top-right corner)
 *   bubble     Dot's bubble, a 9-slice with an inset of 44 px on every side
 *   tail       the bubble's tail, pointing down-left; drawn behind the body, its top 6 px under the body's bottom edge
 *   ring       the teal ring (and ringDashed): the ring line is the middle 68% (a 16% glow margin each side)
 *   arrow      the teal arrow, tip at the bottom middle
 */
export interface HudPiece { x: number; y: number; w: number; h: number }
export type HudPieceName = 'vineTile' | 'goalCard' | 'goalPlate' | 'vineLead' | 'bubble' | 'vineEnd' | 'ring' | 'ringDashed' | 'numPlate' | 'menuLeaf' | 'arrow' | 'tail' | 'tendril';
export const HUD_ATLAS_SIZE = { w: 1024, h: 1264 };
export const HUD_PIECES: Record<HudPieceName, HudPiece> = {"vineTile": {"x": 0, "y": 0, "w": 256, "h": 54}, "goalCard": {"x": 4, "y": 62, "w": 900, "h": 667}, "goalPlate": {"x": 4, "y": 737, "w": 540, "h": 210}, "vineLead": {"x": 4, "y": 955, "w": 492, "h": 105}, "bubble": {"x": 552, "y": 737, "w": 346, "h": 187}, "vineEnd": {"x": 552, "y": 932, "w": 285, "h": 104}, "ring": {"x": 504, "y": 1044, "w": 192, "h": 192}, "ringDashed": {"x": 704, "y": 1044, "w": 192, "h": 192}, "numPlate": {"x": 4, "y": 1068, "w": 188, "h": 96}, "menuLeaf": {"x": 200, "y": 1068, "w": 142, "h": 192}, "arrow": {"x": 912, "y": 62, "w": 96, "h": 120}, "tail": {"x": 912, "y": 190, "w": 95, "h": 28}, "tendril": {"x": 912, "y": 226, "w": 24, "h": 182}};
/** the atlas px per css px the pieces are painted at */
export const HUD_ART_SCALE = 3;
/** the bubble's 9-slice inset (atlas px) */
export const BUBBLE_INSET = 44;
