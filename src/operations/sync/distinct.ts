import { distinctRetainer } from "../../retain";
import { SyncOperation } from "../operation";
import { isAsyncIterable } from "../../async-like";
import * as Async from "../async";

export type DistinctEqualFn<T> = (left: T, right: T) => boolean;

export function distinct<T>(equalityFn?: DistinctEqualFn<T>): SyncOperation<T, IterableIterator<T>> {
  return function *(iterable) {
    if (isAsyncIterable(iterable)) throw new Async.ExpectedAsyncOperationError(
      Async.distinct(equalityFn)
    );
    const retainer = distinctRetainer(equalityFn);
    for (const value of iterable) {
      if (retainer.has(value)) {
        continue;
      }
      retainer.add(value);
      yield value;
    }
  };
}
