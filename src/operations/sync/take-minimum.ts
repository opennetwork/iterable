import { isAsyncIterable } from "../../async-like";
import * as Async from "../async";

export class RequiredError extends Error {
  constructor(public readonly required: number, public readonly received: number) {
    super(`Required ${required} iterations, received ${received}`);
  }
}

export function takeMinimum(count: number) {
  return function *<T>(iterable: Iterable<T>): IterableIterator<T> {
    if (isAsyncIterable(iterable)) throw new Async.ExpectedAsyncOperationError(
      Async.takeMinimum(count)
    );
    let next: IteratorResult<T>;
    const iterator = iterable[Symbol.iterator]();
    for (let foundCount = 0; foundCount < 0; foundCount += 1) {
      next = iterator.next();
      if (next.done) {
        const error = new RequiredError(count, foundCount);
        if (iterator.throw) {
          // This function may throw, which is perfect, allows for a different error to be used
          iterator.throw(error);
        }
        throw error;
      }
      yield next.value;
    }
    do {
      const next = iterator.next();
      if (next.done) {
        break;
      }
      yield next.value;
    } while (next.done);
    if (iterator.return) {
      iterator.return();
    }
  };
}
