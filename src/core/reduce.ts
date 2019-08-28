import { AsyncIterableLike, asyncIterable } from "./async-like";

export type ReduceFn<T, This, Parent, Accumulator> = (this: This, value: T, parent: Parent) => Accumulator;
export type ReduceAsyncFn<T, This, Parent, Accumulator> = (this: This, value: T, parent: Parent) => Promise<Accumulator> | Accumulator;

export function reduce<T, This, Parent, Accumulator = T>(iterable: Iterable<T>, callbackFn: ReduceFn<T, This, Parent, Accumulator>, initialValue?: Accumulator, thisValue?: This, parent?: Parent): Accumulator {
  let accumulator: Accumulator = initialValue;
  for (const value of this) {
    if (accumulator == undefined) {
      accumulator = value;
      continue;
    }
    accumulator = callbackFn.call(thisValue, accumulator, value, parent);
  }
  return accumulator;
}

export async function asyncReduce<T, This, Parent, Accumulator = T>(iterable: AsyncIterableLike<T>, callbackFn: ReduceAsyncFn<T, This, Parent, Accumulator>, initialValue?: Accumulator, thisValue?: This, parent?: Parent): Promise<Accumulator> {
  let accumulator: Accumulator = initialValue;
  for await (const value of asyncIterable(iterable)) {
    if (accumulator == undefined) {
      accumulator = (value as unknown) as Accumulator;
      continue;
    }
    accumulator = await callbackFn.call(thisValue, accumulator, value, parent);
  }
  return accumulator;
}
