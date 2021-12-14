import { TC39IterableHelpersObject } from "../tests/tc39/sync";
import {
  FilterFn,
  ForEachFn,
  MapFn,
  reduce,
  ReduceFn,
  some,
  asIndexedPairs,
  drop,
  every,
  filter,
  find,
  flatMap,
  forEach,
  map,
  take,
  toArray
} from "../operations/sync";

export class TC39SyncIteratorHelpers<T> implements TC39IterableHelpersObject<T> {

  *[Symbol.iterator](): Iterator<T> {

  }

  asIndexedPairs(): TC39IterableHelpersObject<[number, T]> {
    return asIndexedPairs<T>()(this);
  }

  drop(limit: number): TC39IterableHelpersObject<T> {
    return drop<T>(limit)(this);
  }

  every(filterFn: FilterFn<T>): boolean {
    return every(filterFn)(this);
  }

  filter(filterFn: FilterFn<T>): TC39IterableHelpersObject<T> {
    return filter(filterFn)(this);
  }

  find(filterFn: FilterFn<T>): T | undefined {
    return find(filterFn)(this);
  }

  flatMap<O>(mapperFn: MapFn<T, Iterable<O>>): TC39IterableHelpersObject<O> {
    return flatMap(mapperFn)(this);
  }

  forEach(callbackFn: ForEachFn<T>): void {
    return forEach(callbackFn)(this);
  }

  map<O>(mapperFn: MapFn<T, O>): TC39IterableHelpersObject<O> {
    return map(mapperFn)(this);
  }

  reduce<A>(reduceFn: ReduceFn<T, A>, initial: A): A {
    return reduce(reduceFn, initial)(this);
  }

  some(filterFn: FilterFn<T>): boolean {
    return some(filterFn)(this);
  }

  take(limit: number): TC39IterableHelpersObject<T> {
    return take<T>(limit)(this);
  }

  toArray(): T[] {
    return toArray<T>()(this);
  }

}
