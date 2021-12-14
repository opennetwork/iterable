import { FilterFn } from "./filter";
import { except } from "./except";
import { hasAny } from "./has-any";
import { Arguments, AsyncFn, GetAsync, Name, SyncOperation } from "../operation";
import { isAsyncIterable, isIterable } from "../../async-like";
import * as Async from "../async";

export function every<T>(callbackFn: FilterFn<T>) {
  const op = except(callbackFn);
  const anyOp = hasAny();
  const fn: SyncOperation<T, boolean> = function(iterable) {
    if (isAsyncIterable(iterable) && !isIterable(iterable)) throw new Async.ExpectedAsyncOperationError(
      fn[GetAsync]()
    );
    return !anyOp(op(iterable));
  };
  fn[Name] = "every";
  fn[Arguments] = [callbackFn];
  fn[GetAsync] = () => Async.every(callbackFn);
  return fn;
}
every[Name] = "every";
every[AsyncFn] = Async.every;
