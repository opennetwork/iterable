import { isAsyncIterable } from "../../async-like";
import * as Async from "../async";

export function drop(count: number) {
  return function *drop<T>(iterable: Iterable<T>): Iterable<T> {
    if (isAsyncIterable(iterable)) throw new Async.ExpectedAsyncOperationError(
      Async.drop(count)
    );
    let dropped = 0;
    for (const value of iterable) {
      if (dropped === count) {
        yield value;
      } else {
        dropped += 1;
      }
    }
  };
}
