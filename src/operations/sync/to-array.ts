import { isAsyncIterable } from "../../async-like";
import * as Async from "../async";

export function toArray() {
  return function <T>(iterable: Iterable<T>): T[] {
    if (isAsyncIterable(iterable)) throw new Async.ExpectedAsyncOperationError(
      Async.toArray()
    );
    return Array.from(iterable);
  };
}
