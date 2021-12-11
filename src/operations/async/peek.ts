import { AsyncOperation } from "../operation";

export function peek<T>(count: number): AsyncOperation<T, AsyncIterable<T>> {
  return async function *<T>(iterable: AsyncIterable<T>): AsyncIterable<T> {
    const peekedValues: T[] = [];
    const iterator = iterable[Symbol.asyncIterator]();
    let next: IteratorResult<T>;
    for (let peeked = 0; peeked < count; peeked += 1) {
      next = await iterator.next();
      if (next.done) {
        break;
      }
      peekedValues.push(next.value);
    }
    while (peekedValues.length) {
      yield peekedValues.shift();
    }
    if (next && next.done) {
      return;
    }
    while (!next.done) {
      next = await iterator.next();
      if (!next.done) {
        yield next.value;
      }
    }
    await iterator.return?.();
  };
}
