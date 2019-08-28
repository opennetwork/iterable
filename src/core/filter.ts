import { AsyncIterableLike, asyncIterable } from "./async-like";

export type FilterFn<T, This, Parent> = (this: This, value: T, parent: Parent) => boolean;
export type FilterAsyncFn<T, This, Parent> = (this: This, value: T, parent: Parent) => boolean | Promise<boolean>;

function negateIfNeeded(negate: boolean, value: boolean): boolean {
  return negate ? !value : value;
}

export function *filterNegatable<T, This, Parent>(iterable: Iterable<T>, callbackFn: FilterFn<T, This, Parent>, negate: boolean = false, thisValue?: This, parent?: Parent): Iterable<T> {
  for (const value of iterable) {
    if (negateIfNeeded(negate, callbackFn.call(thisValue, value, parent))) {
      yield value;
    }
  }
}

export async function *asyncFilterNegatable<T, This, Parent>(iterable: AsyncIterableLike<T>, callbackFn: FilterAsyncFn<T, This, Parent>, negate: boolean = false, thisValue?: This, parent?: Parent): AsyncIterable<T> {
  for await (const value of asyncIterable(iterable)) {
    if (negateIfNeeded(negate, await callbackFn.call(thisValue, value, parent))) {
      yield value;
    }
  }
}


export function filter<T, This, Parent>(iterable: Iterable<T>, callbackFn: FilterFn<T, This, Parent>, thisValue?: This, parent?: Parent): Iterable<T> {
  return filterNegatable(iterable, callbackFn, false, thisValue, parent);
}

export function asyncFilter<T, This, Parent>(iterable: AsyncIterableLike<T>, callbackFn: FilterAsyncFn<T, This, Parent>, thisValue?: This, parent?: Parent): AsyncIterable<T> {
  return asyncFilterNegatable(iterable, callbackFn, false, thisValue, parent);
}
