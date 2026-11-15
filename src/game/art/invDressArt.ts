/**
 * invDressArt — the build's folders a stage may place inventory pictures from as dressing (invDress.ts). A picture ships only when code
 * names it, so each folder is one static pattern here: the bundler ships that folder's pictures and gives each its address (as
 * pieces/rollingPiece.ts names src/assets/w1-18/ for the nut and the fruit, so that folder already ships). A piece whose file is in no
 * folder here is refused by name by the gate (invDress.ts invDressBreaches: "its picture is not in the build"); the fix is its folder's
 * line, and the build's gates (no asset over 4 MiB, artcheck's 4096 px) then judge every picture that folder brings in.
 */

/** each folder (the inventory's `file` prefix, src/...): a picture's address in the build by its file name */
const FOLDERS: ReadonlyArray<readonly [string, (name: string) => string]> = [
  ['src/assets/w1-18/', (n) => new URL(`../../assets/w1-18/${n}`, import.meta.url).href],
];

/** the address in the build of an inventory row's picture (its `file`), or undefined when no folder here ships it */
export function invDressUrl(file: string): string | undefined {
  if (typeof URL === 'undefined') return undefined;
  for (const [dir, url] of FOLDERS) {
    if (!file.startsWith(dir)) continue;
    const name = file.slice(dir.length);
    if (name && !name.includes('/')) return url(name);
  }
  return undefined;
}

/** the folders (for the gate's message and its test) */
export const invDressFolders = (): string[] => FOLDERS.map(([d]) => d);
