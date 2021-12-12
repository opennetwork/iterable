import { AsyncOperation } from "../operation";

export function toArray<T>(): AsyncOperation<T, Promise<T[]>> {
  return async function(iterable) {
    const values: T[] = [];
    for await (const value of iterable) {
      values.push(value);
    }
    return values;
  };
}
