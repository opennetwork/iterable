import { SyncOperation } from "../operation";
import { isAsyncIterable } from "../../async-like";
import * as Async from "../async";

export type GroupFn<T> = (value: T) => unknown;

export function group<T, This, Parent>(callbackFn: GroupFn<T>): SyncOperation<T, IterableIterator<IterableIterator<T>>> {
  return function *(iterable) {
    if (isAsyncIterable(iterable)) throw new Async.ExpectedAsyncOperationError(
      Async.group(callbackFn)
    );
    const groups = new Map<unknown, T[]>();
    const newGroups: IterableIterator<T>[] = [];

    const baseIterator: Iterator<T> = iterable[Symbol.iterator]();

    function *groupIterable(key: unknown, initialValue: T) {
      yield initialValue;
      function *drainGroup() {
        let next;
        while ((next = groups.get(key)) && next.length) {
          yield next.shift();
        }
      }
      let done: boolean = false;
      yield* drainGroup();
      do {
        done = doNextValue();
        yield* drainGroup();
      } while (!done);
    }

    function doNextValue(): boolean {
      const next = baseIterator.next();
      if (next.done) {
        return true;
      }
      const nextKey = callbackFn(next.value);
      if (groups.has(nextKey)) {
        groups.get(nextKey).push(next.value);
      } else {
        groups.set(nextKey, []);
        newGroups.push(groupIterable(nextKey, next.value));
      }
      return false;
    }

    let done: boolean = false;
    do {
      done = doNextValue();
      while (newGroups.length) {
        yield newGroups.shift();
      }
    } while (!done);
  };
}
