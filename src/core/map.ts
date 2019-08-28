import { AsyncIterableLike, asyncIterable } from "./async-like";

export type MapFn<T, O, This, Parent> = (this: This, value: T, parent: Parent) => O;
export type MapAsyncFn<T, O, This, Parent> = (this: This, value: T, parent: Parent) => Promise<O> | O;

export function *map<T, O, This, Parent>(iterable: Iterable<T>, callbackFn: MapFn<T, O, This, Parent>, thisValue?: This, parent?: Parent): Iterable<O> {
  for (const value of iterable) {
    yield callbackFn.call(thisValue, value, parent);
  }
}

export async function *asyncMap<T, O, This, Parent>(iterable: AsyncIterableLike<T>, callbackFn: MapAsyncFn<T, O, This, Parent>, thisValue?: This, parent?: Parent): AsyncIterable<O> {
  for await (const value of asyncIterable(iterable)) {
    yield await callbackFn.call(thisValue, value, parent);
  }
}
