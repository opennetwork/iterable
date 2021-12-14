import { isAsyncIterable, isIterable } from "../../async-like";
import * as Async from "../async";

export function take(count: number) {
  return function *take<T>(iterable: Iterable<T>): Iterable<T> {
    if (isAsyncIterable(iterable) && !isIterable(iterable)) throw new Async.ExpectedAsyncOperationError(
      Async.take(count)
    );
    let yielded = 0;
    for (const value of iterable) {
      yield value;
      yielded += 1;
      if (yielded === count) {
        break;
      }
    }
  };
}
