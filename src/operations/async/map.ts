import { Arguments, AsyncOperation, Name } from "../operation";

export type MapFn<T, O> = (value: T) => O;

export function map<T, O>(callbackFn: MapFn<T, O>) {
  const fn: AsyncOperation<T, AsyncIterable<O>> = async function *map(iterable) {
    for await (const value of async(iterable)) {
      yield callbackFn(value);
    }
    async function *async(value: AsyncIterable<T>) {
      yield * value;
    }
  };
  fn[Name] = "map";
  fn[Arguments] = [callbackFn];
  return fn;
}
map[Name] = "map";
