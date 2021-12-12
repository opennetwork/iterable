import { AsyncOperation } from "../operation";

export type MapFn<T, O> = (value: T) => O;

export function map<T, O>(callbackFn: MapFn<T, O>): AsyncOperation<T, AsyncIterable<O>> {
  return async function *map(iterable) {
    for await (const value of async(iterable)) {
      yield callbackFn(value);
    }
    async function *async(value: AsyncIterable<T>) {
      yield * value;
    }
  };
}
