import { AsyncIterableLike, asyncIterable } from "../async-like";

export type ForEachFn<T, This, Parent> = (this: This, value: T, parent: Parent) => void;
export type ForEachAsyncFn<T, This, Parent> = (this: This, value: T, parent: Parent) => void | Promise<void>;

export function forEach<T, This, Parent>(iterable: Iterable<T>, callbackFn: ForEachFn<T, This, Parent>, thisValue: This, parent: Parent): void {
  for (const value of iterable) {
    callbackFn.call(thisValue, value, parent);
  }
}

export async function forEachAsync<T, This, Parent>(iterable: AsyncIterableLike<T>, callbackFn: ForEachAsyncFn<T, This, Parent>, thisValue: This, parent: Parent): Promise<void> {
  for await (const value of asyncIterable(iterable)) {
    await callbackFn.call(thisValue, value, parent);
  }
}
