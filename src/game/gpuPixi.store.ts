// The Play Store build has no GPU layer (vite.config.ts aliases ./gpuPixi.ts here when VITE_STORE_BUILD=1). The layer is the testers'
// link's measurement switch only (gpuLayer.ts gpuBackdropOn), and Pixi's own bundle carries an outside address in its console greeting,
// which the store check (tools/store/checkStoreBuild.mjs, PLAY-STORE-RULES §6) refuses. Loading this module fails, so mountGpuLayer's
// try falls back to the 2D canvas alone, as on any phone without WebGL 2.
throw new Error('no GPU layer in the store build');
