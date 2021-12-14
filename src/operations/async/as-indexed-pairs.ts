export function asIndexedPairs() {
  return async function *asIndexedPairs<T>(iterable: AsyncIterable<T>): AsyncIterable<[number, T]> {
    let index = -1;
    for await (const value of iterable) {
      index += 1;
      yield [index, value];
    }
  };
}