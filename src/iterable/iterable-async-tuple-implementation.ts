import {
  asyncMap,
  MapAsyncFn,
  AsyncIterableLike,
  asyncRetain,
  arrayRetainer,
  AsyncRetainer,
  Retainer,
  asyncToArray,
  asyncHooks,
  asyncRequire
} from "../core";
import { ExtendedIterableAsyncImplementation } from "./iterable-async-implementation";
import { AsyncIterableTuple } from "./iterable-async-tuple";
import { isTupleArray } from "./iterable-tuple-implementation";

export class ExtendedIterableAsyncTupleImplementation<T, S extends number> extends ExtendedIterableAsyncImplementation<T> implements AsyncIterableTuple<T, S> {

  readonly size: S;

  constructor(iterable: AsyncIterableLike<T>, size: S) {
    super(asyncRequire(iterable, size));
    this.size = size;
  }

  retain(retainer: Retainer<T> | AsyncRetainer<T> = arrayRetainer()) {
    return new ExtendedIterableAsyncTupleImplementation<T, S>(
      asyncRetain(this, retainer),
      this.size
    );
  }

  map<O>(fn: MapAsyncFn<T, O, this, this>): AsyncIterableTuple<O, S> {
    return new ExtendedIterableAsyncTupleImplementation<O, S>(
      asyncMap(this, fn, this, this),
      this.size
    );
  }

  tap(fn: (value: T) => void | Promise<void>): AsyncIterableTuple<T, S> {
    return new ExtendedIterableAsyncTupleImplementation<T, S>(
      asyncHooks({ preYield: (value: T) => fn(value) })(this),
      this.size
    );
  }

  async toArray() {
    const array = await asyncToArray(this);
    if (!isTupleArray(array, this.size)) {
      throw new Error("Tuple incorrect size");
    }
    return array;
  }

}
