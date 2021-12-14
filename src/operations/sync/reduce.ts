import { Arguments, AsyncFn, GetAsync, Name, Returns, SyncOperation } from "../operation";
import { isAsyncIterable, isIterable } from "../../async-like";
import * as Async from "../async";

export type ReduceFn<T, Accumulator> = (accumulator: Accumulator, value: T) => Accumulator;

export function reduce<T, Accumulator>(callbackFn: ReduceFn<T, Accumulator>, initialValue: Accumulator) {
  const fn: SyncOperation<T, Accumulator> = function(iterable) {
    if (isAsyncIterable(iterable) && !isIterable(iterable)) throw new Async.ExpectedAsyncOperationError(
      fn[GetAsync]()
    );
    let accumulator: Accumulator = initialValue;
    for (const value of iterable) {
      accumulator = callbackFn(accumulator, value);
    }
    return accumulator;
  };
  fn[Name] = "reduce";
  fn[Arguments] = [callbackFn, initialValue];
  fn[GetAsync] = () => Async.reduce(callbackFn, initialValue);
  fn[Returns] = true;
  return fn;
}
reduce[Name] = "reduce";
reduce[AsyncFn] = Async.reduce;
reduce[Returns] = true;
