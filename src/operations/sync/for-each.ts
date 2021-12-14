import { Arguments, AsyncFn, GetAsync, Name, SyncOperation } from "../operation";
import { isAsyncIterable, isIterable } from "../../async-like";
import * as Async from "../async";

export type ForEachFn<T> = (value: T) => void;

export function forEach<T>(callbackFn: ForEachFn<T>) {
  const fn: SyncOperation<T, void> = function(iterable) {
    if (isAsyncIterable(iterable) && !isIterable(iterable)) throw new Async.ExpectedAsyncOperationError(
      fn[GetAsync]()
    );
    for (const value of iterable) {
      callbackFn(value);
    }
  };
  fn[Name] = "forEach";
  fn[Arguments] = [callbackFn];
  fn[GetAsync] = () => Async.forEach(callbackFn);
  return fn;
}
forEach[Name] = "forEach";
forEach[AsyncFn] = Async.forEach;
