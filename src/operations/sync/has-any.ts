import { SyncOperation } from "../operation";
import { isAsyncIterable, isIterable } from "../../async-like";
import * as Async from "../async";

export function hasAny(): SyncOperation<unknown, boolean> {
  return function(iterable) {
    if (isAsyncIterable(iterable) && !isIterable(iterable)) throw new Async.ExpectedAsyncOperationError(
      Async.hasAny()
    );
    const iterator = iterable[Symbol.iterator]();
    const result = iterator.next();
    return !result.done;
  };
}
