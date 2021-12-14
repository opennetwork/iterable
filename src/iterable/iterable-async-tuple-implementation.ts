import {
  AsyncIterableLike,
  asyncToArray,
  asyncTakeMinimum
} from "../core";
import { ExtendedIterableAsyncImplementation } from "./iterable-async-implementation";
import { AsyncIterableTuple } from "./iterable-async-tuple";
import { isTupleArray } from "./tuple";
import { IterableTypeReferenceMap } from "./reference-map-type";
import { constructTC39IteratorHelpers } from "../tc39/construct";
import * as Async from "../operations/async";

export class ExtendedIterableAsyncTupleImplementation<T, S extends number> extends ExtendedIterableAsyncImplementation<T> implements AsyncIterableTuple<T, S> {

  readonly size: S;

  constructor(iterable: AsyncIterableLike<T>, size: S, referenceMap: IterableTypeReferenceMap) {
    super(asyncTakeMinimum(iterable, size), referenceMap);
    this.size = size;
    constructTC39IteratorHelpers(this, Async);
  }

  async toArray() {
    const array = await asyncToArray(this);
    if (!isTupleArray(array, this.size)) {
      throw new Error("Tuple incorrect size");
    }
    return array;
  }

}
