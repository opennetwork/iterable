import { AsyncOperation } from "../operation";

export type ReduceFn<T, Accumulator> = (accumulator: Accumulator, value: T) => Accumulator | Promise<Accumulator>;

export function reduce<T, Accumulator>(callbackFn: ReduceFn<T, Accumulator>, initialValue: Accumulator): AsyncOperation<T, Promise<Accumulator>> {
  return async function(iterable) {
    let accumulator: Accumulator = initialValue;
    for await (const value of iterable) {
      accumulator = await callbackFn(accumulator, value);
    }
    return accumulator;
  };
}
