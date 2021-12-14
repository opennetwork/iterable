import { SyncOperation } from "../operation";
import { map, MapFn } from "./map";
import { isAsyncIterable, isIterable } from "../../async-like";
import * as Async from "../async";

export type FlatMapFn<T, O> = MapFn<T, Iterable<O>>;

export function flatMap<T, O>(callbackFn: FlatMapFn<T, O>): SyncOperation<T, IterableIterator<O>> {
  const op = map(callbackFn);
  return function *(iterable) {
    if (isAsyncIterable(iterable) && !isIterable(iterable)) throw new Async.ExpectedAsyncOperationError(
      Async.flatMap(callbackFn)
    );
    for (const newIterable of op(iterable)) {
      for (const value of newIterable) {
        yield value;
      }
    }
  };
}
