import { SyncOperation } from "../operation";
import { isAsyncIterable, isIterable } from "../../async-like";
import * as Async from "../async";

export interface FilterFn<T, Is extends T = T> {
  (value: T): boolean;
}

function negateIfNeeded(negate: boolean, value: boolean): boolean {
  return negate ? !value : value;
}

export function filterNegatable<T>(callbackFn: FilterFn<T>, negate: boolean = false): SyncOperation<T, IterableIterator<T>> {
  return function *filter(iterable) {
    if (isAsyncIterable(iterable) && !isIterable(iterable)) throw new Async.ExpectedAsyncOperationError(
      Async.filterNegatable(callbackFn)
    );
    for (const value of iterable) {
      if (negateIfNeeded(negate, callbackFn(value))) {
        yield value;
      }
    }
  };
}

export function filter<T, Is extends T>(callbackFn: FilterFn<T, Is>): SyncOperation<T, Iterable<Is>>;
export function filter<T>(callbackFn: FilterFn<T>): SyncOperation<T, Iterable<T>>;
export function filter<T>(callbackFn: FilterFn<T>): SyncOperation<T, Iterable<T>> {
  return filterNegatable(callbackFn);
}
