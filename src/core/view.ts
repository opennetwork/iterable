import { arrayRetainer, asyncRetain, retain } from "./retain";
import { AsyncIterableLike } from "./async-like";

export function view<T>(iterable: Iterable<T>) {
  return {
    [Symbol.iterator]: () => {
      const baseIterable: Iterable<T> = retain(iterable, arrayRetainer());
      return {
        next() {
          return { done: false, value: baseIterable };
        }
      };
    }
  };
}

export function asyncView<T>(iterable: AsyncIterableLike<T>) {
  return {
    [Symbol.asyncIterator]: () => {
      const baseIterable: AsyncIterable<T> = asyncRetain(iterable, arrayRetainer());
      return {
        async next() {
          return { done: false, value: baseIterable };
        }
      };
    }
  };
}
