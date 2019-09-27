import { AsyncIterableLike, asyncIterable } from "../async-like";

export function hasAny(iterable: Iterable<unknown>): boolean {
  const iterator = iterable[Symbol.iterator]();
  const result = iterator.next();
  return !result.done;
}

export async function asyncHasAny(iterable: AsyncIterableLike<unknown>): Promise<boolean> {
  const iterator = asyncIterable(iterable)[Symbol.asyncIterator]();
  const result = await iterator.next();
  return !result.done;
}
