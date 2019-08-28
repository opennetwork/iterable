import { AsyncIterableLike, asyncIterable } from "./async-like";

export function forEach<T, This, Parent>(iterable: Iterable<T>, callbackFn: (this: This, value: T, parent: Parent) => void, thisValue: This, parent: Parent): void {
  for (const value of iterable) {
    callbackFn.call(thisValue, value, parent);
  }
}

export async function forEachAsync<T, This, Parent>(iterable: AsyncIterableLike<T>, callbackFn: (this: This, value: T, parent: Parent) => void | Promise<void>, thisValue: This, parent: Parent): Promise<void> {
  for await (const value of asyncIterable(iterable)) {
    await callbackFn.call(thisValue, value, parent);
  }
}
