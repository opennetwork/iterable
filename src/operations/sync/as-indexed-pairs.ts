import { isAsyncIterable, isIterable } from "../../async-like";
import * as Async from "../async";

export function asIndexedPairs() {
  return function *asIndexedPairs<T>(iterable: Iterable<T>): Iterable<[number, T]> {
    if (isAsyncIterable(iterable) && !isIterable(iterable)) throw new Async.ExpectedAsyncOperationError(
      Async.asIndexedPairs()
    );
    let index = -1;
    for (const value of iterable) {
      index += 1;
      yield [index, value];
    }
  };
}
