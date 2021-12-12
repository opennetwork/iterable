import { filter, FilterFn } from "./filter";
import { hasAny } from "./has-any";
import { SyncOperation } from "../operation";
import { isAsyncIterable } from "../../async-like";
import * as Async from "../async";

export function some<T>(callbackFn: FilterFn<T>): SyncOperation<T, boolean> {
  const filterOp = filter(callbackFn);
  const hasAnyOp = hasAny();
  return function(iterable) {
    if (isAsyncIterable(iterable)) throw new Async.ExpectedAsyncOperationError(
      Async.some(callbackFn)
    );
    return hasAnyOp(filterOp(iterable));
  };
}
