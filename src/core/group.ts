import { asyncIterable, AsyncIterableLike } from "./async-like";
import { Pushable } from "./pushable";

export type GroupAsyncFn<T, This, Parent> = (this: This, value: T, parent: Parent) => Promise<string> | string;

export async function *asyncGroup<T, This, Parent>(iterable: AsyncIterableLike<T>, callbackFn: GroupAsyncFn<T, This, Parent>, thisValue?: This, parent?: Parent): AsyncIterable<AsyncIterable<T>> {
  const groups: Map<string, Pushable<T>> = new Map();
  for await (const value of asyncIterable(iterable)) {
    const group = await callbackFn.call(thisValue, value, parent);
    console.log({ groups, group, value });
    if (groups.has(group)) {
      groups.get(group).push(value);
    } else {
      const pushable = new Pushable<T>();
      groups.set(group, pushable);
      yield pushable;
      pushable.push(value);
    }
  }

  console.log("Done");
  // Finished pushing into them, so we can close them all off
  for (const group of groups.values()) {
    group.close();
  }
}
