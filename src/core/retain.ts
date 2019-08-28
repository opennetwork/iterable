import { asyncIterable, AsyncIterableLike, asyncIterator } from "./async-like";

export interface Retainer<T> extends Iterable<T> {
  add(value: T): void;
}

export interface AsyncRetainer<T> extends AsyncIterable<T> {
  add(value: T): void | Promise<void>;
}

export function arrayRetainer<T>(): Retainer<T> {
  const values: T[] = [];
  return {
    add: value => values.push(value),
    [Symbol.iterator]: () => values[Symbol.iterator]()
  };
}

export function setRetainer<T>(): Retainer<T> {
  return new Set<T>();
}

export function retain<T>(iterable: Iterable<T>, retainer: Retainer<T> = arrayRetainer()): Iterable<T> {
  const iterator = iterable[Symbol.iterator]();
  function *generator() {
    for (const value of retainer) {
      yield value;
    }
    let next: IteratorResult<T>;
    do {
      next = iterator.next();
      if (next.value == undefined) {
        continue;
      }
      retainer.add(next.value);
      yield next.value;
    } while (!next.done);
  }
  return {
    [Symbol.iterator]: generator
  };
}

export function asyncRetain<T>(iterable: AsyncIterableLike<T>, retainer: Retainer<T> | AsyncRetainer<T> = arrayRetainer()): AsyncIterable<T> {
  const iterator = asyncIterator(iterable);
  async function *generator() {
    for await (const value of asyncIterable(retainer)) {
      yield value;
    }
    let next: IteratorResult<T>;
    do {
      next = await iterator.next();
      if (next.value == undefined) {
        continue;
      }
      await retainer.add(next.value);
      yield next.value;
    } while (!next.value);
  }
  return {
    [Symbol.asyncIterator]: generator
  };
}
