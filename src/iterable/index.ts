import { AsyncIterableLike } from "../core";
import { BasicMap } from "./reference-map";
import { ExtendedIterable } from "./iterable";
import { ExtendedAsyncIterable } from "./iterable-async";

export * from "./iterable";
export * from "./iterable-async";
export * from "./iterable-tuple";
export * from "./iterable-async-tuple";
export * from "./reference-map-type";

export function extendedIterable<T>(iterable: Iterable<T>): ExtendedIterable<T> {
  return BasicMap.extendedIterable(iterable);
}

export function asyncExtendedIterable<T>(iterable: AsyncIterableLike<T>): ExtendedAsyncIterable<T> {
  return BasicMap.asyncExtendedIterable(iterable);
}
