import {
  MapAsyncFn,
  FlatMapAsyncFn,
  FilterAsyncFn,
  ReduceAsyncFn,
  AsyncIterableLike,
  Retainer,
  AsyncRetainer, DistinctEqualAsyncFn, GroupAsyncFn, ForEachAsyncFn
} from "../core";
import { AsyncIterableTuple } from "./iterable-async-tuple";
import { TC39AsyncIteratorHelpers } from "../tc39/async";

export interface ExtendedAsyncIterable<T> extends AsyncIterable<T>, TC39AsyncIteratorHelpers<T> {
  drain(): Promise<boolean>;
  hasAny(): Promise<boolean>;
  union<O>(other: AsyncIterableLike<O>): ExtendedAsyncIterable<T | O>;
  retain(retainer?: Retainer<T> | AsyncRetainer<T>): ExtendedAsyncIterable<T>;
  skip(count: number): ExtendedAsyncIterable<T>;
  mask(maskIterable: AsyncIterableLike<boolean>): ExtendedAsyncIterable<T>;
  maskReversible(maskIterable: AsyncIterableLike<boolean>, reverse?: boolean): ExtendedAsyncIterable<T>;
  distinct(equalityFn?: DistinctEqualAsyncFn<T>): ExtendedAsyncIterable<T>;
  group(fn: GroupAsyncFn<T, this, this>): ExtendedAsyncIterable<ExtendedAsyncIterable<T>>;
  tap(fn: (value: T) => void | Promise<void>): ExtendedAsyncIterable<T>;
  toTuple<S extends number>(size: S): AsyncIterableTuple<T, S>;
  toIterable(): AsyncIterable<T>;
}
