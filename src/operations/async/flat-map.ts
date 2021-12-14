import { Arguments, AsyncOperation, Name } from "../operation";
import { map, MapFn } from "./map";

export type FlatMapFn<T, O> = MapFn<T, Iterable<O>>;

export function flatMap<T, O>(callbackFn: FlatMapFn<T, O>) {
  const op = map(callbackFn);
  const fn: AsyncOperation<T, AsyncIterable<O>> = async function *(iterable) {
    for await (const newIterable of op(iterable)) {
      yield * newIterable;
    }
  };
  fn[Name] = "flatMap";
  fn[Arguments] = [callbackFn];
  return fn;
}
flatMap[Name] = "flatMap";
