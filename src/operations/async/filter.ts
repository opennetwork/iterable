import { Arguments, AsyncOperation, Name } from "../operation";

export interface FilterFn<T, Is extends T = T> {
  (value: T): boolean | Promise<boolean>;
}

function negateIfNeeded(negate: boolean, value: boolean): boolean {
  return negate ? !value : value;
}

export function filterNegatable<T>(callbackFn: FilterFn<T>, negate: boolean = false) {
  const fn: AsyncOperation<T, AsyncIterable<T>> = async function *filter(iterable) {
    for await (const value of iterable) {
      if (negateIfNeeded(negate, await callbackFn(value))) {
        yield value;
      }
    }
  };
  fn[Name] = "filterNegatable";
  fn[Arguments] = [callbackFn, negate];
  return fn;
}
filterNegatable[Name] = "filterNegatable";

export function filter<T, Is extends T>(callbackFn: FilterFn<T, Is>): AsyncOperation<T, AsyncIterable<Is>>;
export function filter<T>(callbackFn: FilterFn<T>): AsyncOperation<T, AsyncIterable<T>>;
export function filter<T>(callbackFn: FilterFn<T>): AsyncOperation<T, AsyncIterable<T>> {
  const fn = filterNegatable(callbackFn);
  fn[Name] = "filter";
  fn[Arguments] = [callbackFn];
  return fn;
}
filter[Name] = "filter";
