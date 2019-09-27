import { SyncOperation } from "../operation";

export type FilterFn<T> = (value: T) => boolean;

function negateIfNeeded(negate: boolean, value: boolean): boolean {
  return negate ? !value : value;
}

export function filterNegatable<T>(callbackFn: FilterFn<T>, negate: boolean = false): SyncOperation<T, IterableIterator<T>> {
  return function *(iterable) {
    for (const value of iterable) {
      if (negateIfNeeded(negate, callbackFn(value))) {
        yield value;
      }
    }
  };
}

export function filter<T>(callbackFn: FilterFn<T>): SyncOperation<T, Iterable<T>> {
  return filterNegatable(callbackFn);
}
