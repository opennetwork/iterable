import { ExtendedIterableAsyncImplementation } from "./iterable-async-implementation";
import { ExtendedIterableImplementation } from "./iterable-implementation";
import { ExtendedIterableAsyncTupleImplementation } from "./iterable-async-tuple-implementation";
import { ExtendedIterableTupleImplementation } from "./iterable-tuple-implementation";
import { AsyncIterableLike } from "../core";
import { IterableTypeReferenceMap } from "./reference-map-type";

export const BasicMap: IterableTypeReferenceMap = {
  extendedIterable<T>(iterable: Iterable<T>) {
    return new ExtendedIterableImplementation(iterable, BasicMap);
  },
  asyncExtendedIterable<T>(iterable: AsyncIterableLike<T>) {
    return new ExtendedIterableAsyncImplementation(iterable, BasicMap);
  },
  asyncIterableTuple<T, S extends number>(iterable: AsyncIterableLike<T>, size: S) {
    return new ExtendedIterableAsyncTupleImplementation(iterable, size, BasicMap);
  },
  iterableTuple<T, S extends number>(iterable: Iterable<T>, size: S) {
    return new ExtendedIterableTupleImplementation(iterable, size, BasicMap);
  }
};
