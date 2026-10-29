/** the stars the whole journey holds: three a stage, every stage that gives stars (UI-11: the map said /300 while 4-D and 5-M made it 306) */
export const starsPossible = (levels: readonly { secret?: unknown }[]): number => levels.filter((l) => !l.secret).length * 3;
