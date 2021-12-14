import { Arguments, AsyncFn, GetAsync, Name, SyncOperation } from "../operation";
import { isAsyncIterable, isIterable } from "../../async-like";
import * as Async from "../async";

export type MapFn<T, O> = (value: T) => O;

export function map<T, O>(callbackFn: MapFn<T, O>) {
  const fn: SyncOperation<T, Iterable<O>> = function *map(iterable) {
    if (isAsyncIterable(iterable) && !isIterable(iterable)) throw new Async.ExpectedAsyncOperationError(
      fn[GetAsync]()
    );
    for (const value of iterable) {
      yield callbackFn(value);
    }
  };
  fn[Name] = "map";
  fn[Arguments] = [callbackFn];
  fn[GetAsync] = () => Async.map(callbackFn);
  return fn;
}
map[Name] = "map";
map[AsyncFn] = Async.map;
