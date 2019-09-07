import { ExtendedIterable } from "./iterable";
import { AsyncIterableLike } from "../core";
import { ExtendedAsyncIterable } from "./iterable-async";
import { AsyncIterableTuple } from "./iterable-async-tuple";
import { IterableTuple } from "./iterable-tuple";

export interface IterableTypeReferenceMap {
  extendedIterable<T>(iterable: Iterable<T>): ExtendedIterable<T>;
  asyncExtendedIterable<T>(iterable: AsyncIterableLike<T>): ExtendedAsyncIterable<T>;
  asyncIterableTuple<T, S extends number>(iterable: AsyncIterableLike<T>, size: S): AsyncIterableTuple<T, S>;
  iterableTuple<T, S extends number>(iterable: Iterable<T>, size: S): IterableTuple<T, S>;
}
