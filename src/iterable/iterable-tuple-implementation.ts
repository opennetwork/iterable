import {
  toArray,
  takeMinimum
} from "../core";
import { IterableTuple } from "./iterable-tuple";
import { ExtendedIterableImplementation } from "./iterable-implementation";
import { isTupleArray, TupleArray } from "./tuple";
import { IterableTypeReferenceMap } from "./reference-map-type";
import { constructTC39IteratorHelpers } from "../tc39/construct";
import * as Sync from "../operations/sync";

export class ExtendedIterableTupleImplementation<T, S extends number> extends ExtendedIterableImplementation<T> implements IterableTuple<T, S> {

  readonly size: S;

  constructor(iterable: Iterable<T>, size: S, referenceMap: IterableTypeReferenceMap) {
    super(takeMinimum(iterable, size), referenceMap);
    this.size = size;
    constructTC39IteratorHelpers(this, Sync);
  }

  toArray(): TupleArray<T, S> {
    const array: T[] = toArray(this);
    if (!isTupleArray(array, this.size)) {
      throw new Error("Tuple incorrect size");
    }
    return array;
  }

}
