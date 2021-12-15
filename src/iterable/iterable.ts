import {
  MapFn,
  FilterFn,
  ReduceFn,
  FlatMapFn,
  Retainer, DistinctEqualFn, GroupFn, ForEachFn
} from "../core";
import { IterableTuple } from "./iterable-tuple";
import { TC39SyncIteratorHelpers } from "../tc39/sync";

export interface ExtendedIterable<T> extends Iterable<T>, TC39SyncIteratorHelpers<T> {

  drain(): boolean;
  hasAny(): boolean;
  union<O>(other: Iterable<O>): ExtendedIterable<T | O>;
  retain(retainer?: Retainer<T>): ExtendedIterable<T>;
  skip(count: number): ExtendedIterable<T>;
  mask(maskIterable: Iterable<boolean>): ExtendedIterable<T>;
  maskReversible(maskIterable: Iterable<boolean>, reverse?: boolean): ExtendedIterable<T>;
  distinct(equalityFn?: DistinctEqualFn<T>): ExtendedIterable<T>;
  group(fn: GroupFn<T, this, this>): ExtendedIterable<ExtendedIterable<T>>;
  tap(fn: (value: T) => void): ExtendedIterable<T>;
  toTuple<S extends number>(size: S): IterableTuple<T, S>;
  toIterable(): Iterable<T>;

}
