import { distinctRetainer } from "../../retain";
import { AsyncOperation } from "../operation";
import { DistinctEqualFn as SyncDistinctEqualFn } from "../sync";

export type DistinctEqualFn<T> = SyncDistinctEqualFn<T>;

export function distinct<T>(equalityFn?: DistinctEqualFn<T>): AsyncOperation<T, AsyncIterableIterator<T>> {
  return async function *(iterable) {
    const retainer = distinctRetainer(equalityFn);
    for await (const value of iterable) {
      if (retainer.has(value)) {
        continue;
      }
      retainer.add(value);
      yield value;
    }
  };
}
