import { ExtendedIterableImplementation  } from "./iterable-implementation";
import { ExtendedIterableAsyncImplementation } from "./iterable-async-implementation";
import { ExtendedIterable } from "./iterable";
import { ExtendedAsyncIterable } from "./iterable-async";

export * from "./iterable";
export * from "./iterable-async";

export function extendedIterable<T>(iterable: Iterable<T>): ExtendedIterable<T> {
  return new ExtendedIterableImplementation(iterable);
}

export function asyncExtendedIterable<T>(iterable: Iterable<T>): ExtendedAsyncIterable<T> {
  return new ExtendedIterableAsyncImplementation(iterable);
}
