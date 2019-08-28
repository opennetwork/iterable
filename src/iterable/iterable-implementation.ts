import { ExtendedIterable } from "./iterable";
import { drain, every, except, filter, FilterFn, hasAny, map, MapFn, reduce, ReduceFn, some, union } from "../core";
import { arrayRetainer, retain, Retainer } from "../core/retain";

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

  union<O>(other: Iterable<O>): ExtendedIterable<T | O> {
    return new ExtendedIterableImplementation(union(this, other));
  }

  filter(fn: FilterFn<T, this, this>): ExtendedIterable<T> {
    return new ExtendedIterableImplementation(filter(this, fn, this, this));
  }

  except(fn: FilterFn<T, this, this>): ExtendedIterable<T> {
    return new ExtendedIterableImplementation(except(this, fn, this, this));
  }

  [Symbol.iterator]() {
    return this.iterable[Symbol.iterator]();
  }

}
