import { FilterFn } from "./filter";
import { except } from "./except";
import { hasAny } from "./has-any";
import { SyncOperation } from "../operation";
import { isAsyncIterable } from "../../async-like";
import * as Async from "../async";

export function every<T>(callbackFn: FilterFn<T>): SyncOperation<T, boolean> {
  const op = except(callbackFn);
  const anyOp = hasAny();
  return function(iterable) {
    if (isAsyncIterable(iterable)) throw new Async.ExpectedAsyncOperationError(
      Async.every(callbackFn)
    );
    return !anyOp(op(iterable));
  };
}
