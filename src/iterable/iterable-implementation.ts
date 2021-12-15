import { ExtendedIterable } from "./iterable";
import {
  drain,
  hasAny,
  map,
  union,
  arrayRetainer,
  retain,
  Retainer,
  mask,
  skip,
  maskReversible,
  DistinctEqualFn,
  distinct,
  group,
  GroupFn,
  hooks,
} from "../core";
import { IterableTuple } from "./iterable-tuple";
import { IterableTypeReferenceMap } from "./reference-map-type";
import { constructTC39IteratorHelpers } from "../tc39/construct";
import * as Sync from "../operations/sync";
import { TC39SyncIteratorHelpers } from "../tc39/sync";

export class ExtendedIterableImplementation<T> extends TC39SyncIteratorHelpers<T> implements ExtendedIterable<T> {

  private readonly iterable: Iterable<T>;

  constructor(iterable: Iterable<T>, protected referenceMap: IterableTypeReferenceMap) {
    super();
    this.iterable = iterable;
    constructTC39IteratorHelpers(this, Sync);
  }

  drain(): boolean {
    return drain(this);
  }

  hasAny(): boolean {
    return hasAny(this);
  }

  retain(retainer: Retainer<T> = arrayRetainer()) {
    return this.referenceMap.extendedIterable(retain(this, retainer));
  }

  union<O>(other: Iterable<O>): ExtendedIterable<T | O> {
    return this.referenceMap.extendedIterable(union(this, other));
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

  toTuple<S extends number>(size: S): IterableTuple<T, S> {
    return this.referenceMap.iterableTuple(this, size);
  }

  toIterable() {
    function *iterable(iterable: Iterable<T>) {
      for (const value of iterable) {
        yield value;
      }
    }
    return iterable(this.iterable);
  }

  [Symbol.iterator]() {
    return this.iterable[Symbol.iterator]();
  }

}
