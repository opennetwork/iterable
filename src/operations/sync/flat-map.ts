import { Arguments, AsyncFn, GetAsync, Name, SyncOperation } from "../operation";
import { map, MapFn } from "./map";
import { isAsyncIterable, isIterable } from "../../async-like";
import * as Async from "../async";

export type FlatMapFn<T, O> = MapFn<T, Iterable<O>>;

export function flatMap<T, O>(callbackFn: FlatMapFn<T, O>) {
  const op = map(callbackFn);
  const fn: SyncOperation<T, IterableIterator<O>> = function *(iterable) {
    if (isAsyncIterable(iterable) && !isIterable(iterable)) throw new Async.ExpectedAsyncOperationError(
      fn[GetAsync]()
    );
    for (const newIterable of op(iterable)) {
      for (const value of newIterable) {
        yield value;
      }
    }
  };
  fn[Name] = "flatMap";
  fn[Arguments] = [callbackFn];
  fn[GetAsync] = () => Async.flatMap(callbackFn);
  return fn;
}
flatMap[Name] = "flatMap";
flatMap[AsyncFn] = Async.flatMap;
