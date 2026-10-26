/**
 * Generated (scratchpad artin/tools/pack.py) from Dot's perched poses Matt approved on 2026-10-26 (revampart/dot), cut from his own Dot
 * sheet. Each pose is 2x her main atlas scale (draw at half of DOT_FRAMES' scale to match her perch frame). Stored facing left (beak
 * pointing left); the right-facing set is the exact mirror, so it is drawn flipped. (fx, fy) is her foot point, the same spot on the
 * branch in every pose, so a change of pose never makes her jump (mirrored, fx becomes w - fx).
 */
export interface PerchFrame { x: number; y: number; w: number; h: number; fx: number; fy: number }
export type PerchPose = 'perch' | 'pointFwd' | 'pointUp' | 'pointDown' | 'talk' | 'talkSmall';
export const DOT_PERCH_ATLAS_SIZE = { w: 792, h: 420 };
export const DOT_PERCH_FRAMES: Record<PerchPose, PerchFrame> = {"perch": {"x": 266, "y": 208, "w": 253, "h": 196, "fx": 147.3, "fy": 193.1}, "pointFwd": {"x": 528, "y": 208, "w": 253, "h": 196, "fx": 147.3, "fy": 193.1}, "pointUp": {"x": 4, "y": 4, "w": 253, "h": 205, "fx": 147.3, "fy": 202.6}, "pointDown": {"x": 4, "y": 217, "w": 253, "h": 196, "fx": 147.3, "fy": 193.1}, "talk": {"x": 266, "y": 4, "w": 255, "h": 196, "fx": 149.5, "fy": 193.1}, "talkSmall": {"x": 530, "y": 4, "w": 255, "h": 196, "fx": 149.1, "fy": 193.1}};
