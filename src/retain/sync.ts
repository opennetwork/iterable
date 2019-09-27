import { DistinctEqualFn } from "../operations/sync/distinct";

export interface Retainer<T> extends Iterable<T> {
  has?(value: T): boolean;
  add(value: T): void;
}

export interface RetainerWithHas<T> extends Retainer<T> {
  has(value: T): boolean;
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

export function distinctRetainer<T>(equalityFn?: DistinctEqualFn<T>): RetainerWithHas<T> {
  if (!equalityFn) {
    return setRetainer();
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
