import { isAsyncIterable, isIterable } from "../../async-like";
import * as Async from "../async";
import { filter, FilterFn } from "./filter";
import { Arguments, AsyncFn, GetAsync, Name, SyncOperation } from "../operation";

export function find<T>(callbackFn: FilterFn<T>) {
  const op = filter(callbackFn);
  const fn: SyncOperation<T, T | undefined> = function (iterable: Iterable<T>): T | undefined {
    if (isAsyncIterable(iterable) && !isIterable(iterable)) throw new Async.ExpectedAsyncOperationError(
      fn[GetAsync]()
    );
    const iterator = op(iterable)[Symbol.iterator]();
    const result = iterator.next();
    iterator.return?.();
    return result.value;
  };
  fn[Name] = "find";
  fn[Arguments] = [callbackFn];
  fn[GetAsync] = () => Async.find(callbackFn);
  return fn;
}
find[Name] = "find";
find[AsyncFn] = Async.find;
