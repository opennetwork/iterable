import { AsyncIterableLike, asyncIterable } from "./async-like";

export function *union<L, R>(left: Iterable<L>, right: Iterable<R>): IterableIterator<L | R> {
  for (const value of left) {
    yield value;
  }
  for (const value of right) {
    yield value;
  }
}

export async function *asyncUnion<L, R>(left: AsyncIterableLike<L>, right: AsyncIterableLike<R>): AsyncIterableIterator<L | R> {
  for await (const value of asyncIterable(left)) {
    yield value;
  }
  for await (const value of asyncIterable(right)) {
    yield value;
  }
}
