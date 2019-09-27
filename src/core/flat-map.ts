import { AsyncIterableLike, asyncIterable } from "../async-like";

export type FlatMapFn<T, O, This, Parent> = (this: This, value: T, parent: Parent) => Iterable<O>;
export type FlatMapAsyncFn<T, O, This, Parent> = (this: This, value: T, parent: Parent) => Promise<AsyncIterableLike<O>> | AsyncIterableLike<O>;

export function *flatMap<T, O, This, Parent>(iterable: Iterable<T>, callbackFn: FlatMapFn<T, O, This, Parent>, thisValue?: This, parent?: Parent): Iterable<O> {
  for (const value of iterable) {
    const newIterable: Iterable<O> = callbackFn.call(thisValue, value, parent);
    for (const value of newIterable) {
      yield value;
    }
  }
}

export async function *asyncFlatMap<T, O, This, Parent>(iterable: AsyncIterableLike<T>, callbackFn: FlatMapAsyncFn<T, O, This, Parent>, thisValue?: This, parent?: Parent): AsyncIterable<O> {
  for await (const value of asyncIterable(iterable)) {
    const newIterable: AsyncIterableLike<O> = await callbackFn.call(thisValue, value, parent);
    for await (const value of asyncIterable(newIterable)) {
      yield value;
    }
  }
}
