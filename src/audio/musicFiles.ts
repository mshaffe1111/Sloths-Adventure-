/**
 * The recorded music's manifest and files (loops.ts), loaded by the Conductor once the audio is unlocked: the bundler gives each file its
 * address, and nothing is fetched until a piece is played. (A module of its own, so the game's tests, which run without the bundler, never
 * load it.)
 */
import MANIFEST from '../assets/music/manifest.json';
import type { LoopManifest } from './loops.ts';

const FILES = import.meta.glob('../assets/music/*.webm', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

export const manifest = MANIFEST as unknown as LoopManifest;
export const musicUrl = (file: string): string | undefined => FILES[`../assets/music/${file}`];
