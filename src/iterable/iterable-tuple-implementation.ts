import {
  map,
  MapFn,
  arrayRetainer,
  retain,
  Retainer,
  toArray,
  hooks,
  require
} from "../core";
import { IterableTuple, TupleArray } from "./iterable-tuple";
import { ExtendedIterableImplementation } from "./iterable-implementation";

export function isTupleArray<T extends any[], S extends number>(array: T, size: S): array is TupleArray<T, S> {
  return array.length === size;
}

export class ExtendedIterableTupleImplementation<T, S extends number> extends ExtendedIterableImplementation<T> implements IterableTuple<T, S> {

  readonly size: S;

  constructor(iterable: Iterable<T>, size: S) {
    super(require(iterable, size));
    this.size = size;
  }

  map<O>(fn: MapFn<T, O, this, this>): IterableTuple<O, S> {
    return new ExtendedIterableTupleImplementation<O, S>(map(this, fn, this, this), this.size);
  }

  tap(fn: (value: T) => void): IterableTuple<T, S> {
    return new ExtendedIterableTupleImplementation<T, S>(
      hooks({ preYield: (value: T) => fn(value) })(this),
      this.size
    );
  }

  retain(retainer: Retainer<T> = arrayRetainer()) {
    return new ExtendedIterableTupleImplementation<T, S>(retain(this, retainer), this.size);
  }

  toArray() {
    const array = toArray(this);
    if (!isTupleArray(array, this.size)) {
      throw new Error("Tuple incorrect size");
    }
    return array;
  }

}
