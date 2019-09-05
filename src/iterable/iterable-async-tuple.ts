import { ExtendedAsyncIterable } from "./iterable-async";
import { TupleArray } from "./tuple";

export interface AsyncIterableTuple<T, S extends number> extends ExtendedAsyncIterable<T> {

  readonly size: S;

  toArray(): Promise<TupleArray<T, S>>;

}
