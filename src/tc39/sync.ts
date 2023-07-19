import { TC39IterableHelpersObject } from "../tests/tc39/sync";
import {
  FilterFn,
  ForEachFn,
  MapFn,
  ReduceFn,
  GuardFilterFn
} from "../operations/sync";
import { createTC39IteratorHelpersConstructor } from "./construct";
import * as Sync from "../operations/sync";

export interface TC39SyncIteratorHelpers<T> {
  map<O>(mapperFn: MapFn<T, O>): TC39SyncIteratorHelpers<O>;
  filter<Is extends T>(filterFn: GuardFilterFn<T, Is>): TC39SyncIteratorHelpers<Is>;
  filter(filterFn: FilterFn<T>): TC39SyncIteratorHelpers<T>;
  take(limit: number): TC39SyncIteratorHelpers<T>;
  drop(limit: number): TC39SyncIteratorHelpers<T>;
  flatMap<O>(mapperFn: MapFn<T, Iterable<O>>): TC39SyncIteratorHelpers<O>;
  reduce<A>(reduceFn: ReduceFn<T, A>, initial: A): A;
  toArray(): T[];
  forEach(callbackFn: ForEachFn<T>): void;
  some(filterFn: FilterFn<T>): boolean;
  every(filterFn: FilterFn<T>): boolean;
  find(filterFn: FilterFn<T>): T | undefined;
}

export class TC39SyncIteratorHelpers<T> extends createTC39IteratorHelpersConstructor(Sync) implements TC39IterableHelpersObject<T> {

  constructor() {
    super();
  }

  *[Symbol.iterator](): Iterator<T> {

  }

}
