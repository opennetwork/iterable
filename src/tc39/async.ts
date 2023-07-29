import { TC39AsyncIterableHelpersObject } from "../tests/tc39/async";
import {
  FilterFn,
  ForEachFn,
  MapFn,
  ReduceFn,
} from "../operations/async";
import { constructTC39IteratorHelpers, createTC39IteratorHelpersConstructor } from "./construct";
import * as Async from "../operations/async";
import { GuardFilterFn } from "../operations/sync";

export interface TC39AsyncIteratorHelpers<T> {
  map<O>(mapperFn: MapFn<T, O>): TC39AsyncIteratorHelpers<O>;
  filter<Is extends T>(filterFn: GuardFilterFn<T, Is>): TC39AsyncIteratorHelpers<Is>;
  filter(filterFn: FilterFn<T>): TC39AsyncIteratorHelpers<T>;
  take(limit: number): TC39AsyncIteratorHelpers<T>;
  drop(limit: number): TC39AsyncIteratorHelpers<T>;
  flatMap<O>(mapperFn: MapFn<T, Iterable<O>>): TC39AsyncIteratorHelpers<O>;
  reduce<A>(reduceFn: ReduceFn<T, A>, initial: A): Promise<A>;
  toArray(): Promise<T[]>;
  forEach(callbackFn: ForEachFn<T>): Promise<void>;
  some(filterFn: FilterFn<T>): Promise<boolean>;
  every(filterFn: FilterFn<T>): Promise<boolean>;
  find(filterFn: FilterFn<T>): Promise<T | undefined>;
}

export class TC39AsyncIteratorHelpers<T> extends createTC39IteratorHelpersConstructor(Async) implements TC39AsyncIterableHelpersObject<T> {

  constructor() {
    super();
  }

  async *[Symbol.asyncIterator](): AsyncIterator<T> {

  }

}

export function applyTC39AsyncIteratorHelpers<T, Z extends AsyncIterable<T>>(that: Z): asserts that is Z & TC39AsyncIteratorHelpers<T> {
  return constructTC39IteratorHelpers(that, Async);
}
