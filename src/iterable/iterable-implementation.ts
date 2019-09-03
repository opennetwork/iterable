import { ExtendedIterable } from "./iterable";
import {
  drain,
  every,
  except,
  filter,
  FilterFn,
  hasAny,
  map,
  MapFn,
  reduce,
  ReduceFn,
  some,
  union,
  arrayRetainer,
  retain,
  Retainer,
  toArray,
  mask,
  skip,
  FlatMapFn,
  flatMap,
  maskReversible,
  take,
  DistinctEqualFn,
  distinct
} from "../core";

export class ExtendedIterableImplementation<T> implements ExtendedIterable<T> {

  private readonly iterable: Iterable<T>;

  constructor(iterable: Iterable<T>) {
    this.iterable = iterable;
  }

  drain(): boolean {
    return drain(this);
  }

  hasAny(): boolean {
    return hasAny(this);
  }

  every(fn: FilterFn<T, this, this>): boolean {
    return every(this, fn, this, this);
  }

  some(fn: FilterFn<T, this, this>): boolean {
    return some(this, fn, this, this);
  }

  reduce<Accumulator = T>(fn: ReduceFn<T, this, this, Accumulator>, initialValue?: Accumulator): Accumulator {
    return reduce(this, fn, initialValue, this, this);
  }

  retain(retainer: Retainer<T> = arrayRetainer()) {
    return new ExtendedIterableImplementation(retain(this, retainer));
  }

  map<O>(fn: MapFn<T, O, this, this>): ExtendedIterable<O> {
    return new ExtendedIterableImplementation(map(this, fn, this, this));
  }

  flatMap<O>(fn: FlatMapFn<T, O, this, this>): ExtendedIterable<O> {
    return new ExtendedIterableImplementation<O>(
      flatMap(this, fn, this, this)
    );
  }

  union<O>(other: Iterable<O>): ExtendedIterable<T | O> {
    return new ExtendedIterableImplementation(union(this, other));
  }

  filter(fn: FilterFn<T, this, this>): ExtendedIterable<T> {
    return new ExtendedIterableImplementation(filter(this, fn, this, this));
  }

  except(fn: FilterFn<T, this, this>): ExtendedIterable<T> {
    return new ExtendedIterableImplementation(except(this, fn, this, this));
  }

  mask(maskIterable: Iterable<boolean>): ExtendedIterable<T> {
    return new ExtendedIterableImplementation(mask(this, maskIterable));
  }

  maskReversible(maskIterable: Iterable<boolean>, reverse: boolean = false): ExtendedIterable<T> {
    return new ExtendedIterableImplementation(maskReversible(this, maskIterable, reverse));
  }

  skip(count: number): ExtendedIterable<T> {
    return this.mask(skip(count));
  }

  take(count: number): ExtendedIterable<T> {
    return this.maskReversible(take(count), true);
  }

  distinct(equalityFn?: DistinctEqualFn<T>): ExtendedIterable<T> {
    return new ExtendedIterableImplementation(distinct(this, equalityFn));
  }

  toArray() {
    return toArray(this);
  }

  [Symbol.iterator]() {
    return this.iterable[Symbol.iterator]();
  }

}
