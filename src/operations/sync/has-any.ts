import { SyncOperation } from "../operation";

export function hasAny(): SyncOperation<unknown, boolean> {
  return function(iterable) {
    const iterator = iterable[Symbol.iterator]();
    const result = iterator.next();
    return !result.done;
  };
}
