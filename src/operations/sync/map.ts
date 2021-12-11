import { SyncOperation } from "../operation";

export type MapFn<T, O> = (value: T) => O;

export function map<T, O>(callbackFn: MapFn<T, O>): SyncOperation<T, Iterable<O>> {
  return function *map(iterable) {
    for (const value of iterable) {
      yield callbackFn(value);
    }
  };
}
