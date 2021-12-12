import { isAsyncIterable } from "../../async-like";
import * as Async from "../async";

export function *union<L>(left: Iterable<L>) {
  return function *<R>(right: Iterable<R>): IterableIterator<L | R> {
    if (isAsyncIterable(left) || isAsyncIterable(right)) throw new Async.ExpectedAsyncOperationError(
      Async.union(left)
    );
    for (const value of left) {
      yield value;
    }
    for (const value of right) {
      yield value;
    }
  };
}
