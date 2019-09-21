import { arrayRetainer, asyncRetain, retain } from "./retain";
import { AsyncIterableLike } from "./async-like";

export function view<T>(iterable: Iterable<T>) {
  return {
    [Symbol.iterator]: (): Iterator<Iterable<T>> => {
      let baseIterable: Iterable<T>;
      return {
        next() {
          if (!baseIterable) {
            baseIterable = retain(iterable, arrayRetainer());
          }
          return { done: false, value: baseIterable };
        },
        return() {
          baseIterable = undefined;
          return { done: true, value: undefined };
        }
      };
    }
  };
}

export function asyncView<T>(iterable: AsyncIterableLike<T>) {
  return {
    [Symbol.asyncIterator]: (): AsyncIterator<AsyncIterable<T>> => {
      let baseIterable: AsyncIterable<T>;
      return {
        async next() {
          if (!baseIterable) {
            baseIterable = asyncRetain(iterable, arrayRetainer());
          }
          return { done: false, value: baseIterable };
        },
        async return() {
          baseIterable = undefined;
          return { done: true, value: undefined };
        }
      };
    }
  };
}
