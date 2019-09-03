import { asyncIterable, AsyncIterableLike } from "./async-like";
import { Pushable } from "./pushable";

export type GroupFn<T, This, Parent> = (this: This, value: T, parent: Parent) => string;
export type GroupAsyncFn<T, This, Parent> = (this: This, value: T, parent: Parent) => Promise<string> | string;

/**
 * Be warned! This function is not lazy like
 * @param iterable
 * @param callbackFn
 * @param thisValue
 * @param parent
 */
export function group<T, This, Parent>(iterable: Iterable<T>, callbackFn: GroupFn<T, This, Parent>, thisValue?: This, parent?: Parent): Iterable<Iterable<T>> {
  throw new Error("Not implemented, this error is here to advise you that grouping in a lazy way can only be done in an async context, please use asyncGroup. If you're unable to then please see the implementation here: ");
  // const groups: Map<string, T[]> = new Map();
  // for (const value of iterable) {
  //   const group = callbackFn.call(thisValue, value, parent);
  //   if (groups.has(group)) {
  //     groups.get(group).push(value);
  //   } else {
  //     groups.set(group, [value]);
  //   }
  // }
  // return groups.values();
}

export async function *asyncGroup<T, This, Parent>(iterable: AsyncIterableLike<T>, callbackFn: GroupAsyncFn<T, This, Parent>, thisValue?: This, parent?: Parent): AsyncIterable<AsyncIterable<T>> {
  const groups: Map<string, Pushable<T>> = new Map();
  for await (const value of asyncIterable(iterable)) {
    const group = await callbackFn.call(thisValue, value, parent);
    if (groups.has(group)) {
      groups.get(group).push(value);
    } else {
      const pushable = new Pushable<T>();
      groups.set(group, pushable);
      yield pushable;
    }
  }
  // Finished pushing into them, so we can close them all off
  for (const group of groups.values()) {
    group.close();
  }
}
