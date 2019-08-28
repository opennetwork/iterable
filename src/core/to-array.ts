import { asyncIterable, AsyncIterableLike } from "./async-like";

export function toArray<T>(iterable: Iterable<T>): T[] {
  return Array.from(iterable);
}

export async function asyncToArray<T>(iterable: AsyncIterableLike<T>): Promise<T[]> {
  const result: T[] = [];
  for await (const value of asyncIterable(iterable)) {
    result.push(value);
  }
  return result;
}
