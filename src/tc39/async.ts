import { TC39AsyncIterableHelpersObject } from "../tests/tc39/async";
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
} from "../operations/async";
import { TC39IteratorHelpers } from "./construct";
import * as Async from "../operations/async";

export interface TC39AsyncIteratorHelpers<T> {

}

export class TC39AsyncIteratorHelpers<T> extends TC39IteratorHelpers implements TC39AsyncIterableHelpersObject<T> {

  constructor() {
    super(Async);
  }

  async *[Symbol.asyncIterator](): AsyncIterator<T> {

  }

  asIndexedPairs(): TC39AsyncIterableHelpersObject<[number, T]> {
    return asIndexedPairs<T>()(this);
  }

  drop(limit: number): TC39AsyncIterableHelpersObject<T> {
    return drop<T>(limit)(this);
  }

  async every(filterFn: FilterFn<T>): Promise<boolean> {
    return every(filterFn)(this);
  }

  filter(filterFn: FilterFn<T>): TC39AsyncIterableHelpersObject<T> {
    return filter(filterFn)(this);
  }

  async find(filterFn: FilterFn<T>): Promise<T | undefined> {
    return find(filterFn)(this);
  }

  flatMap<O>(mapperFn: MapFn<T, Iterable<O>>): TC39AsyncIterableHelpersObject<O> {
    return flatMap(mapperFn)(this);
  }

  async forEach(callbackFn: ForEachFn<T>): Promise<void> {
    return await forEach(callbackFn)(this);
  }

  map<O>(mapperFn: MapFn<T, O>): TC39AsyncIterableHelpersObject<O> {
    return map(mapperFn)(this);
  }

  reduce<A>(reduceFn: ReduceFn<T, A>, initial: A): Promise<A> {
    return reduce<T, A>(reduceFn, initial)(this);
  }

  async some(filterFn: FilterFn<T>): Promise<boolean> {
    return some(filterFn)(this);
  }

  take(limit: number): TC39AsyncIterableHelpersObject<T> {
    return take<T>(limit)(this);
  }

  async toArray(): Promise<T[]> {
    return await toArray<T>()(this);
  }

}
