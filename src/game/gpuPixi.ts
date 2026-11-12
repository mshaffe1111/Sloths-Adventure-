/**
 * The one module that imports PixiJS (pinned in package.json). gpuLayer.ts loads it with import(), so it and Pixi are a file of their
 * own that is fetched only when something is first put on the GPU layer: never part of the start files (tools/perf/chunkcheck.mjs
 * fails a build where a start file reaches it). Only the WebGL side is named here: never autoDetectRenderer, never the WebGPU renderer
 * (PERFORMANCE-RULES §4: PowerVR).
 */
export { Container, Graphics, Rectangle, Sprite, Texture, WebGLRenderer } from 'pixi.js';
