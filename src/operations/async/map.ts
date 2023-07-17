import { Arguments, AsyncOperation, Name } from "../operation";

export interface MapFn<T, O> {
  (value: T, counter: number): O | Promise<O>;
}

export function map<T, O>(callbackFn: MapFn<T, O>) {
  const fn: AsyncOperation<T, AsyncIterable<O>> = async function *map(iterable) {
    let counter: number = -1;
    for await (const value of async(iterable)) {
      counter += 1;
      yield callbackFn(value, counter);
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
