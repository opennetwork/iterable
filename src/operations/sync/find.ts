import { isAsyncIterable, isIterable } from "../../async-like";
import * as Async from "../async";
import { filter, FilterFn } from "./filter";
import { SyncOperation } from "../operation";

export function find<T>(callbackFn: FilterFn<T>): SyncOperation<T, T | undefined> {
  const op = filter(callbackFn);
  return function (iterable: Iterable<T>): T | undefined {
    if (isAsyncIterable(iterable) && !isIterable(iterable)) throw new Async.ExpectedAsyncOperationError(
      Async.find(callbackFn)
    );
    const iterator = op(iterable)[Symbol.iterator]();
    const result = iterator.next();
    iterator.return?.();
    return result.value;
  };
}
