import { AsyncOperation } from "../operation";

export interface FilterFn<T, Is extends T = T> {
  (value: T): value is Is;
  (value: T): Promise<boolean>;
  (value: T): boolean;
}

function negateIfNeeded(negate: boolean, value: boolean): boolean {
  return negate ? !value : value;
}

export function filterNegatable<T>(callbackFn: FilterFn<T>, negate: boolean = false): AsyncOperation<T, AsyncIterable<T>> {
  return async function *filter(iterable) {
    for await (const value of iterable) {
      if (negateIfNeeded(negate, await callbackFn(value))) {
        yield value;
      }
    }
  };
}

export function filter<T, Is extends T>(callbackFn: FilterFn<T, Is>): AsyncOperation<T, AsyncIterable<Is>>;
export function filter<T>(callbackFn: FilterFn<T>): AsyncOperation<T, AsyncIterable<T>>;
export function filter<T>(callbackFn: FilterFn<T>): AsyncOperation<T, AsyncIterable<T>> {
  return filterNegatable(callbackFn);
}
