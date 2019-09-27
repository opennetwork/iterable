import { SyncOperation } from "../operation";
import { map, MapFn } from "./map";

export type FlatMapFn<T, O> = MapFn<T, Iterable<O>>;

export function flatMap<T, O>(callbackFn: FlatMapFn<T, O>): SyncOperation<T, IterableIterator<O>> {
  const op = map(callbackFn);
  return function *(iterable) {
    for (const newIterable of op(iterable)) {
      for (const value of newIterable) {
        yield value;
      }
    }
  };
}
