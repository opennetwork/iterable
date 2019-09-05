import {
  AsyncIterableLike,
  asyncToArray,
  asyncRequire
} from "../core";
import { ExtendedIterableAsyncImplementation } from "./iterable-async-implementation";
import { AsyncIterableTuple } from "./iterable-async-tuple";
import { isTupleArray } from "./tuple";

export class ExtendedIterableAsyncTupleImplementation<T, S extends number> extends ExtendedIterableAsyncImplementation<T> implements AsyncIterableTuple<T, S> {

  readonly size: S;

  constructor(iterable: AsyncIterableLike<T>, size: S) {
    super(asyncRequire(iterable, size));
    this.size = size;
  }

  async toArray() {
    const array = await asyncToArray(this);
    if (!isTupleArray(array, this.size)) {
      throw new Error("Tuple incorrect size");
    }
    return array;
  }

}
