import { asyncIterable, AsyncIterableLike } from "./async-like";
import { AsyncRetainerWithHas, RetainerWithHas, setRetainer } from "./retain";

export type DistinctEqualFn<T> = (left: T, right: T) => boolean;
export type DistinctEqualAsyncFn<T> = (left: T, right: T) => boolean | Promise<boolean>;

export function distinctRetainer<T>(equalityFn?: DistinctEqualFn<T>): RetainerWithHas<T> {
  if (!equalityFn) {
    return new Set();
  }
  const values: T[] = [];
  return {
    has(value) {
      for (const otherValue of values) {
        if (equalityFn(otherValue, value)) {
          return true;
        }
      }
      return false;
    },
    add(value) {
      values.push(value);
    },
    [Symbol.iterator]: values[Symbol.iterator].bind(values)
  };
}

export function *distinct<T, This, Parent>(iterable: Iterable<T>, equalityFn?: DistinctEqualFn<T>): Iterable<T> {
  const retainer = distinctRetainer(equalityFn);
  for (const value of iterable) {
    if (retainer.has(value)) {
      continue;
    }
    retainer.add(value);
    yield value;
  }
}

export function asyncDistinctRetainer<T>(equalityFn?: DistinctEqualAsyncFn<T>): RetainerWithHas<T> | AsyncRetainerWithHas<T> {
  if (!equalityFn) {
    return setRetainer();
  }
  const values: T[] = [];
  return {
    async has(value) {
      for (const otherValue of values) {
        if (await equalityFn(otherValue, value)) {
          return true;
        }
      }
      return false;
    },
    async add(value) {
      values.push(value);
    },
    async *[Symbol.asyncIterator]() {
      for (const value of values) {
        yield value;
      }
    }
  };
}

export async function *asyncDistinct<T, This, Parent>(iterable: AsyncIterableLike<T>, equalityFn?: DistinctEqualAsyncFn<T>): AsyncIterable<T> {
  const retainer = asyncDistinctRetainer(equalityFn);
  for await (const value of asyncIterable(iterable)) {
    if (await retainer.has(value)) {
      continue;
    }
    await retainer.add(value);
    yield value;
  }
}
