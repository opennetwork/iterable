import { ExtendedIterableImplementation  } from "./iterable-implementation";
import { ExtendedIterableAsyncImplementation } from "./iterable-async-implementation";
import { ExtendedIterable } from "./iterable";
import { ExtendedAsyncIterable } from "./iterable-async";
import { AsyncIterableLike } from "../core";

export * from "./iterable";
export * from "./iterable-async";
export * from "./iterable-tuple";
export * from "./iterable-async-tuple";

export function extendedIterable<T>(iterable: Iterable<T>): ExtendedIterable<T> {
  return new ExtendedIterableImplementation(iterable);
}

export function asyncExtendedIterable<T>(iterable: AsyncIterableLike<T>): ExtendedAsyncIterable<T> {
  return new ExtendedIterableAsyncImplementation(iterable);
}
