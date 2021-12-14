import { filter, FilterFn } from "./filter";
import { hasAny } from "./has-any";
import { Arguments, AsyncFn, GetAsync, Name, Returns, SyncOperation } from "../operation";
import { isAsyncIterable, isIterable } from "../../async-like";
import * as Async from "../async";

export function some<T>(callbackFn: FilterFn<T>) {
  const filterOp = filter(callbackFn);
  const hasAnyOp = hasAny();
  const fn: SyncOperation<T, boolean> = function(iterable) {
    if (isAsyncIterable(iterable) && !isIterable(iterable)) throw new Async.ExpectedAsyncOperationError(
      fn[GetAsync]()
    );
    return hasAnyOp(filterOp(iterable));
  };
  fn[Name] = "some";
  fn[Arguments] = [callbackFn];
  fn[GetAsync] = () => Async.some(callbackFn);
  fn[Returns] = true;
  return fn;
}
some[Name] = "some";
some[AsyncFn] = Async.some;
some[Returns] = true;
