export function hasAny(iterable: Iterable<unknown>): boolean {
  const iterator = iterable[Symbol.iterator]();
  const result = iterator.next();
  return !result.done;
}
