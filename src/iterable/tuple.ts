
/*
// This is the ideal way to do tuples, but typescript won't allow it in interfaces, because of recursion:

type GetLength<T extends any[]> = T extends { length: infer L } ? L : never;
type ArrayUnshift<T extends any[], X> = T extends any ? ((x: X, ...t: T) => void) extends (...t: infer R) => void ? R : never : never;
type SizeToTupleCreator<T, A extends T[], S extends number> = {
  1: A;
  0: SizeToTupleAdder<T, A, S>;
}[[GetLength<A>] extends [S] ? 1 : 0];
type SizeToTupleAdder<T, A extends any[], S extends number> = S extends any ? SizeToTupleCreator<T, ArrayUnshift<A, T>, S> : never;
export type TupleArray<T, S extends number> = SizeToTupleCreator<T, [], S>;
 */

interface TupleMap<T> extends Record<number, T[]> {
  0: [];
  1: [T];
  2: [T, T];
  3: [T, T, T];
  4: [T, T, T, T];
  5: [T, T, T, T, T];
  6: [T, T, T, T, T, T];
  7: [T, T, T, T, T, T, T];
  8: [T, T, T, T, T, T, T, T];
  9: [T, T, T, T, T, T, T, T, T];
  10: [T, T, T, T, T, T, T, T, T, T];
  11: [T, T, T, T, T, T, T, T, T, T, T];
  12: [T, T, T, T, T, T, T, T, T, T, T, T];
  13: [T, T, T, T, T, T, T, T, T, T, T, T, T];
  14: [T, T, T, T, T, T, T, T, T, T, T, T, T, T];
  15: [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T];
  16: [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T];
  17: [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T];
  18: [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T];
  19: [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T];
  20: [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T];
}

export type TupleArray<T, S extends number> = TupleMap<T>[S] extends T[] ? TupleMap<T>[S] : T[];

export function isTupleArray<T, S extends number>(array: T[], size: S): array is TupleArray<T, S> {
  if (!Array.isArray(array)) {
    return false;
  }
  return array.length === size;
}
