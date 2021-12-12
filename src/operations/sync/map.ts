import { SyncOperation } from "../operation";
import { isAsyncIterable } from "../../async-like";
import * as Async from "../async";

export type MapFn<T, O> = (value: T) => O;

export function map<T, O>(callbackFn: MapFn<T, O>): SyncOperation<T, Iterable<O>> {
  return function *map(iterable) {
    if (isAsyncIterable(iterable)) throw new Async.ExpectedAsyncOperationError(
      Async.map(callbackFn)
    );
    for (const value of iterable) {
      yield callbackFn(value);
    }
  };
}
