export interface DressNewFrame { x: number; y: number; w: number; h: number; units: number; world: number; hang?: boolean }
export const DRESS_NEW_FRAMES = {} satisfies Record<string, DressNewFrame>;
export type DressNewName = keyof typeof DRESS_NEW_FRAMES;
export const DRESS_NEW_URLS: Record<number, string> = {};
