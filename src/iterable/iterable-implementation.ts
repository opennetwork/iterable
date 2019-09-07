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
  distinct,
  group,
  GroupFn,
  hooks, ForEachFn, forEach
} from "../core";
import { IterableTuple } from "./iterable-tuple";
import { IterableTypeReferenceMap } from "./reference-map-type";

export class ExtendedIterableImplementation<T> implements ExtendedIterable<T> {

  private readonly iterable: Iterable<T>;

  constructor(iterable: Iterable<T>, protected referenceMap: IterableTypeReferenceMap) {
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
    return this.referenceMap.extendedIterable(retain(this, retainer));
  }

  map<O>(fn: MapFn<T, O, this, this>): ExtendedIterable<O> {
    return this.referenceMap.extendedIterable(map(this, fn, this, this));
  }

  flatMap<O>(fn: FlatMapFn<T, O, this, this>): ExtendedIterable<O> {
    return this.referenceMap.extendedIterable(
      flatMap(this, fn, this, this)
    );
  }

  union<O>(other: Iterable<O>): ExtendedIterable<T | O> {
    return this.referenceMap.extendedIterable(union(this, other));
  }

  filter(fn: FilterFn<T, this, this>): ExtendedIterable<T> {
    return this.referenceMap.extendedIterable(filter(this, fn, this, this));
  }

  except(fn: FilterFn<T, this, this>): ExtendedIterable<T> {
    return this.referenceMap.extendedIterable(except(this, fn, this, this));
  }

  mask(maskIterable: Iterable<boolean>): ExtendedIterable<T> {
    return this.referenceMap.extendedIterable(mask(this, maskIterable));
  }

  maskReversible(maskIterable: Iterable<boolean>, reverse: boolean = false): ExtendedIterable<T> {
    return this.referenceMap.extendedIterable(maskReversible(this, maskIterable, reverse));
  }

  skip(count: number): ExtendedIterable<T> {
    return this.mask(skip(count));
  }

  take(count: number): ExtendedIterable<T> {
    return this.maskReversible(take(count), true);
  }

  distinct(equalityFn?: DistinctEqualFn<T>): ExtendedIterable<T> {
    return this.referenceMap.extendedIterable(distinct(this, equalityFn));
  }

  group(fn: GroupFn<T, this, this>): ExtendedIterable<ExtendedIterable<T>> {
    return this.referenceMap.extendedIterable(
      map(
        group(this, fn, this, this),
        iterable => this.referenceMap.extendedIterable(iterable)
      )
    );
  }

  tap(fn: (value: T) => void): ExtendedIterable<T> {
    return this.referenceMap.extendedIterable(
      hooks({ preYield: (value: T) => fn(value) })(this)
    );
  }

  forEach(fn: ForEachFn<T, this, this>): void {
    forEach(this, fn, this, this);
  }

  toArray() {
    return toArray(this);
  }

  toTuple<S extends number>(size: S): IterableTuple<T, S> {
    return this.referenceMap.iterableTuple(this, size);
  }

  [Symbol.iterator]() {
    return this.iterable[Symbol.iterator]();
  }

}
