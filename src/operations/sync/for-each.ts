import { SyncOperation } from "../operation";

export type ForEachFn<T> = (value: T) => void;

export function forEach<T>(callbackFn: ForEachFn<T>): SyncOperation<T, void> {
  return function(iterable) {
    for (const value of iterable) {
      callbackFn(value);
    }
  };
}
