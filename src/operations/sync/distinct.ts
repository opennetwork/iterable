import { distinctRetainer } from "../../retain";
import { Arguments, AsyncFn, GetAsync, Name, SyncOperation } from "../operation";
import * as Async from "../async";
import { isAsyncIterable, isIterable } from "../../async-like";

export type DistinctEqualFn<T> = (left: T, right: T) => boolean;

export function distinct<T>(equalityFn?: DistinctEqualFn<T>) {
  const fn: SyncOperation<T, IterableIterator<T>> = function *(iterable) {
    if (isAsyncIterable(iterable) && !isIterable(iterable)) throw new Async.ExpectedAsyncOperationError(
      fn[GetAsync]()
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
  fn[Name] = "distinct";
  fn[Arguments] = [equalityFn];
  fn[GetAsync] = () => Async.distinct(equalityFn);
  return fn;
}
distinct[Name] = "distinct";
distinct[AsyncFn] = Async.distinct;
