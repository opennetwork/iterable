import { isAsyncIterable, isIterable } from "../../async-like";
import * as Async from "../async";
import { Arguments, AsyncFn, GetAsync, Name, SyncOperation } from "../operation";

export function take<T>(count: number) {
  const fn: SyncOperation<T, Iterable<T>> = function *take<T>(iterable: Iterable<T>): Iterable<T> {
    if (isAsyncIterable(iterable) && !isIterable(iterable)) throw new Async.ExpectedAsyncOperationError(
      fn[GetAsync]()
    );
    let yielded = 0;
    for (const value of iterable) {
      yield value;
      yielded += 1;
      if (yielded === count) {
        break;
      }
    }
  };
  fn[Name] = "take";
  fn[Arguments] = [count];
  fn[GetAsync] = () => Async.take(count);
  return fn;
}
take[Name] = "take";
take[AsyncFn] = Async.take;
