import { Arguments, AsyncFn, GetAsync, Internal, Name, SyncOperation } from "../operation";
import { isAsyncIterable, isIterable } from "../../async-like";
import * as Async from "../async";

export interface FilterFn<T, Is extends T = T> {
  (value: T): boolean;
}
export interface GuardFilterFn<T, Is extends T = T> {
  <Iz extends Is>(value: T): value is Iz;
}

function negateIfNeeded(negate: boolean, value: boolean): boolean {
  return negate ? !value : value;
}

export function filterNegatable<T>(callbackFn: FilterFn<T>, negate: boolean = false) {
  const fn: SyncOperation<T, IterableIterator<T>> = function *filter(iterable) {
    if (isAsyncIterable(iterable) && !isIterable(iterable)) throw new Async.ExpectedAsyncOperationError(
      fn[GetAsync]()
    );
    for (const value of iterable) {
      if (negateIfNeeded(negate, callbackFn(value))) {
        yield value;
      }
    }
  };
  fn[Name] = "filterNegatable";
  fn[GetAsync] = () => Async.filterNegatable(callbackFn);
  fn[Arguments] = [callbackFn, negate];
  fn[Internal] = true;
  return fn;
}
filterNegatable[Name] = "filterNegatable";
filterNegatable[AsyncFn] = Async.filterNegatable;
filterNegatable[Internal] = true;

export function filter<T, Is extends T>(callbackFn: FilterFn<T, Is>): SyncOperation<T, Iterable<Is>>;
export function filter<T>(callbackFn: FilterFn<T>): SyncOperation<T, Iterable<T>>;
export function filter<T>(callbackFn: FilterFn<T>): SyncOperation<T, Iterable<T>> {
  const fn = filterNegatable(callbackFn);
  fn[Name] = "filter";
  fn[GetAsync] = () => Async.filter(callbackFn);
  fn[Arguments] = [callbackFn];
  return fn;
}
filter[Name] = "filter";
filter[AsyncFn] = Async.filter;
