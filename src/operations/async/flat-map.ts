import { AsyncOperation } from "../operation";
import { map, MapFn } from "./map";

export type FlatMapFn<T, O> = MapFn<T, Iterable<O>>;

export function flatMap<T, O>(callbackFn: FlatMapFn<T, O>): AsyncOperation<T, AsyncIterable<O>> {
  const op = map(callbackFn);
  return async function *(iterable) {
    for await (const newIterable of op(iterable)) {
      yield * newIterable;
    }
  };
}
