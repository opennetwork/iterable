import { distinctRetainer } from "../../retain";
import { Arguments, AsyncOperation, Name } from "../operation";
import { DistinctEqualFn as SyncDistinctEqualFn } from "../sync";

export type DistinctEqualFn<T> = SyncDistinctEqualFn<T>;

export function distinct<T>(equalityFn?: DistinctEqualFn<T>) {
  const fn: AsyncOperation<T, AsyncIterableIterator<T>> = async function *(iterable) {
    const retainer = distinctRetainer(equalityFn);
    for await (const value of iterable) {
      if (retainer.has(value)) {
        continue;
      }
      retainer.add(value);
      yield value;
    }
  };
  fn[Name] = "distinct";
  fn[Arguments] = [equalityFn];
  return fn;
}
distinct[Name] = "distinct";
