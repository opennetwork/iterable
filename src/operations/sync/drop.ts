import { isAsyncIterable, isIterable } from "../../async-like";
import * as Async from "../async";
import { Arguments, AsyncFn, GetAsync, Name, SyncOperation } from "../operation";

export function drop<T>(count: number) {
  const fn: SyncOperation<T, Iterable<T>> = function *drop<T>(iterable: Iterable<T>): Iterable<T> {
    if (isAsyncIterable(iterable) && !isIterable(iterable)) throw new Async.ExpectedAsyncOperationError(
      fn[GetAsync]()
    );
    let dropped = 0;
    for (const value of iterable) {
      if (dropped === count) {
        yield value;
      } else {
        dropped += 1;
      }
    }
  };
  fn[Name] = "drop";
  fn[Arguments] = [count];
  fn[GetAsync] = () => Async.drop(count);
  return fn;
}
drop[Name] = "drop";
drop[AsyncFn] = Async.drop;
