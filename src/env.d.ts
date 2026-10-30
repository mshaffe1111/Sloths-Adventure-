/// <reference types="vite/client" />
interface ImportMetaEnv {
  /** '1' in a build for the QA team (Matt's test link): src/game/playRecorder.ts qaBuild */
  readonly VITE_QA_BUILD?: string;
}
