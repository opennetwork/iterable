import { isAsyncIterable, isIterable } from "../../async-like";
import * as Async from "../async";
import { AsyncFn, GetAsync, Name, SyncOperation } from "../operation";

export function asIndexedPairs<T>() {
  const fn: SyncOperation<T, Iterable<[number, T]>> = function *asIndexedPairs<T>(iterable: Iterable<T>): Iterable<[number, T]> {
    if (isAsyncIterable(iterable) && !isIterable(iterable)) throw new Async.ExpectedAsyncOperationError(
      fn[GetAsync]()
    );
    let index = -1;
    for (const value of iterable) {
      index += 1;
      yield [index, value];
    }
  };
  fn[Name] = "asIndexedPairs";
  fn[GetAsync] = () => Async.asIndexedPairs<T>();
  return fn;
}
asIndexedPairs[Name] = "asIndexedPairs";
asIndexedPairs[AsyncFn] = Async.asIndexedPairs;
