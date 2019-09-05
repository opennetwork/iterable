import {
  MapAsyncFn,
  FlatMapAsyncFn,
  FilterAsyncFn,
  ReduceAsyncFn,
  AsyncIterableLike,
  Retainer,
  AsyncRetainer, DistinctEqualAsyncFn, GroupAsyncFn, ForEachAsyncFn
} from "../core";
import { ExtendedAsyncIterable } from "./iterable-async";
import { TupleArray } from "./iterable-tuple";

export interface AsyncIterableTuple<T, S extends number> extends ExtendedAsyncIterable<T> {

  readonly size: S;

  map<O>(fn: MapAsyncFn<T, O, this, this>): AsyncIterableTuple<O, S>;
  retain(retainer?: Retainer<T> | AsyncRetainer<T>): AsyncIterableTuple<T, S>;
  tap(fn: (value: T) => void | Promise<void>): AsyncIterableTuple<T, S>;
  toArray(): Promise<TupleArray<T[], S>>;

}
