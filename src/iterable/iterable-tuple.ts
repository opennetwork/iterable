import { ExtendedIterable } from "./iterable";
import { TupleArray } from "./tuple";

export interface IterableTuple<T, S extends number> extends ExtendedIterable<T> {

  readonly size: S;
  toArray(): TupleArray<T, S>;

}
