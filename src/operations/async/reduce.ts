import { Arguments, AsyncOperation, Name } from "../operation";

export type ReduceFn<T, Accumulator> = (accumulator: Accumulator, value: T) => Accumulator | Promise<Accumulator>;

export function reduce<T, Accumulator>(callbackFn: ReduceFn<T, Accumulator>, initialValue: Accumulator) {
  const fn: AsyncOperation<T, Promise<Accumulator>> = async function(iterable) {
    let accumulator: Accumulator = initialValue;
    for await (const value of iterable) {
      accumulator = await callbackFn(accumulator, value);
    }
    return accumulator;
  };
  fn[Name] = "reduce";
  fn[Arguments] = [arguments];
  return fn;
}
reduce[Name] = "reduce";
