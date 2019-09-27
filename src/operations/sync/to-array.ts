export function toArray() {
  return function <T>(iterable: Iterable<T>): T[] {
    return Array.from(iterable);
  };
}
