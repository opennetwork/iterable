import { AsyncOperation } from "../operation";

export type ForEachFn<T> = (value: T) => void | Promise<void> | unknown;

export function forEach<T>(callbackFn: ForEachFn<T>): AsyncOperation<T, Promise<void>> {
  return async function(iterable) {
    for await (const value of iterable) {
      await callbackFn(value);
    }
  };
}
