export function drop(count: number) {
  return async function *drop<T>(iterable: AsyncIterable<T>): AsyncIterable<T> {
    let dropped = 0;
    for await (const value of iterable) {
      if (dropped === count) {
        yield value;
      } else {
        dropped += 1;
      }
    }
  };
}
