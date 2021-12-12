import { SyncOperation } from "../operation";
import { isAsyncIterable } from "../../async-like";
import * as Async from "../async";

export type ReduceFn<T, Accumulator> = (accumulator: Accumulator, value: T) => Accumulator;

export function reduce<T, Accumulator>(callbackFn: ReduceFn<T, Accumulator>, initialValue: Accumulator): SyncOperation<T, Accumulator> {
  return function(iterable) {
    if (isAsyncIterable(iterable)) throw new Async.ExpectedAsyncOperationError(
      Async.reduce(callbackFn, initialValue)
    );
    let accumulator: Accumulator = initialValue;
    for (const value of iterable) {
      accumulator = callbackFn(accumulator, value);
    }
    return accumulator;
  };
}
