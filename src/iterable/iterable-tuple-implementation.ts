import {
  toArray,
  takeMinimum
} from "../core";
import { IterableTuple } from "./iterable-tuple";
import { ExtendedIterableImplementation } from "./iterable-implementation";
import { isTupleArray, TupleArray } from "./tuple";

export class ExtendedIterableTupleImplementation<T, S extends number> extends ExtendedIterableImplementation<T> implements IterableTuple<T, S> {

  readonly size: S;

  constructor(iterable: Iterable<T>, size: S) {
    super(takeMinimum(iterable, size));
    this.size = size;
  }

  toArray(): TupleArray<T, S> {
    const array: T[] = toArray(this);
    if (!isTupleArray(array, this.size)) {
      throw new Error("Tuple incorrect size");
    }
    return array;
  }

}
