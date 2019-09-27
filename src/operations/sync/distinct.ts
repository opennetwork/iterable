import { distinctRetainer } from "../../retain";
import { SyncOperation } from "../operation";

export type DistinctEqualFn<T> = (left: T, right: T) => boolean;

export function distinct<T>(equalityFn?: DistinctEqualFn<T>): SyncOperation<T, IterableIterator<T>> {
  return function *(iterable) {
    const retainer = distinctRetainer(equalityFn);
    for (const value of iterable) {
      if (retainer.has(value)) {
        continue;
      }
      retainer.add(value);
      yield value;
    }
  };
}
