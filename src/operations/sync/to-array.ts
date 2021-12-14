import { isAsyncIterable, isIterable } from "../../async-like";
import * as Async from "../async";
import { Arguments, AsyncFn, GetAsync, Name, Returns, SyncOperation } from "../operation";

export function toArray<T>() {
  const fn: SyncOperation<T, T[]> = function <T>(iterable: Iterable<T>): T[] {
    if (isAsyncIterable(iterable) && !isIterable(iterable)) throw new Async.ExpectedAsyncOperationError(
      fn[GetAsync]()
    );
    return Array.from(iterable);
  };
  fn[Name] = "toArray";
  fn[Arguments] = [];
  fn[GetAsync] = () => Async.toArray();
  fn[Returns] = true;
  return fn;
}
toArray[Name] = "toArray";
toArray[AsyncFn] = Async.toArray;
toArray[Returns] = true;
