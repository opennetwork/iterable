export function take(count: number) {
  return async function *take<T>(iterable: AsyncIterable<T>): AsyncIterable<T> {
    let yielded = 0;
    for await (const value of iterable) {
      yield value;
      yielded += 1;
      if (yielded === count) {
        break;
      }
    }
  };
}
