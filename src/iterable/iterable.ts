import {
  MapFn,
  FilterFn,
  ReduceFn,
  FlatMapFn,
  Retainer, DistinctEqualFn
} from "../core";

export interface ExtendedIterable<T> extends Iterable<T> {

  drain(): boolean;
  every(fn: FilterFn<T, this, this>): boolean;
  some(fn: FilterFn<T, this, this>): boolean;
  hasAny(): boolean;
  reduce<Accumulator = T>(fn: ReduceFn<T, this, this, Accumulator>, initialValue?: Accumulator): Accumulator;
  map<O>(fn: MapFn<T, O, this, this>): ExtendedIterable<O>;
  flatMap<O>(fn: FlatMapFn<T, O, this, this>): ExtendedIterable<O>;
  union<O>(other: Iterable<O>): ExtendedIterable<T | O>;
  filter(fn: FilterFn<T, this, this>): ExtendedIterable<T>;
  except(fn: FilterFn<T, this, this>): ExtendedIterable<T>;
  retain(retainer?: Retainer<T>): ExtendedIterable<T>;
  skip(count: number): ExtendedIterable<T>;
  take(count: number): ExtendedIterable<T>;
  mask(maskIterable: Iterable<boolean>): ExtendedIterable<T>;
  maskReversible(maskIterable: Iterable<boolean>, reverse?: boolean): ExtendedIterable<T>;
  distinct(equalityFn?: DistinctEqualFn<T>): ExtendedIterable<T>;
  toArray(): T[];

}
