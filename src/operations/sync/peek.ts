import { isAsyncIterable } from "../../async-like";
import * as Async from "../async";

export function peek(count: number) {
  return function *<T>(iterable: Iterable<T>): IterableIterator<T> {
    if (isAsyncIterable(iterable)) throw new Async.ExpectedAsyncOperationError(
      Async.peek(count)
    );
    const peekedValues: T[] = [];
    const iterator = iterable[Symbol.iterator]();
    let next: IteratorResult<T>;
    for (let peeked = 0; peeked < count; peeked += 1) {
      next = iterator.next();
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
      next = iterator.next();
      if (!next.done) {
        yield next.value;
      }
    }
    iterator.return?.();
  };
}
