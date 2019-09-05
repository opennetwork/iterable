import {
  MapFn,
  Retainer
} from "../core";
import { ExtendedIterable } from "./iterable";

type Head<T> = T extends [infer U, ...unknown[]] ? U : never;
type Tail<T> = T extends Array<any> ? ((...args: T) => never) extends ((head: any, ...args: infer R) => never) ? R : never : never;
type WithHead<Tail extends any[], H> = ((h: H, ...t: Tail) => any) extends ((...x: infer X) => any) ? X : never;

interface LeftRight<Left, Right> {
  0: Left;
  1: Right;
}

type Reduce<T extends Array<any>, R extends LeftRight<any, any>> = R[[T] extends [[]] ? 0 : 1];

interface TupleArray<T, S> extends LeftRight {
  length: S;
}
//
// export type TupleArray<T, S> = S extends 0 ? never[] : Array<T> & {
//   0: T,
//   length: S
// };

export interface IterableTuple<T, S extends number> extends ExtendedIterable<T> {

  readonly size: S;

  map<O>(fn: MapFn<T, O, this, this>): IterableTuple<O, S>;
  retain(retainer?: Retainer<T>): IterableTuple<T, S>;
  tap(fn: (value: T) => void): IterableTuple<T, S>;
  toArray(): TupleArray<T, S>;

}
