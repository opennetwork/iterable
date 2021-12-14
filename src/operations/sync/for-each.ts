import { SyncOperation } from "../operation";
import { isAsyncIterable, isIterable } from "../../async-like";
import * as Async from "../async";

export type ForEachFn<T> = (value: T) => void;

export function forEach<T>(callbackFn: ForEachFn<T>): SyncOperation<T, void> {
  return function(iterable) {
    if (isAsyncIterable(iterable) && !isIterable(iterable)) throw new Async.ExpectedAsyncOperationError(
      Async.forEach(callbackFn)
    );
    for (const value of iterable) {
      callbackFn(value);
    }
  };
}
