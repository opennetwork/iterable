import { asyncIterable, AsyncIterableLike, asyncIterator } from "./async-like";

export interface Retainer<T> extends Iterable<T> {
  has?(value: T): boolean;
  add(value: T): void;
}

export interface RetainerWithHas<T> extends Retainer<T> {
  has(value: T): boolean;
}

export interface AsyncRetainer<T> extends AsyncIterable<T> {
  has?(value: T): boolean | Promise<boolean>;
  add(value: T): void | Promise<void>;
}

export interface AsyncRetainerWithHas<T> extends AsyncRetainer<T> {
  has(value: T): boolean | Promise<boolean>;
}

export function arrayRetainer<T>(has?: (value: T, values: T[]) => boolean): Retainer<T> {
  const values: T[] = [];
  return {
    add: value => {
      if (has && has(value, values)) {
        return;
      }
      values.push(value);
    },
    [Symbol.iterator]: () => values[Symbol.iterator]()
  };
}

export function setRetainer<T>(): RetainerWithHas<T> {
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
      if (next.done) {
        continue;
      }
      // If we're not adding it to our retainer, then the value
      // will never be added in the same order
      // this means that when the iterable is run again, that values
      // will show up in _a different order_
      //
      // This is no good for ordered sets
      //
      // Specifically MDN describes a sets iterator as:
      //
      // Set.prototype[@@iterator]()
      // Returns a new Iterator object that contains the values for each element in the Set object in insertion order.
      //
      // We should follow that if it is available
      if (retainer.has && retainer.has(next.value)) {
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
      if (next.done) {
        continue;
      }
      // See explanation @ sync version of retain
      if (retainer.has && await retainer.has(next.value)) {
        continue;
      }
      await retainer.add(next.value);
      yield next.value;
    } while (!next.done);
  }
  return {
    [Symbol.asyncIterator]: generator
  };
}
