import { AsyncIterableLike, asyncIterator } from "./async-like";

export async function asyncDrain(iterable: AsyncIterableLike<unknown>) {
  if (!iterable) {
    return;
  }
  const iterator = asyncIterator(iterable);
  let next: IteratorResult<unknown>;
  do {
    next = await iterator.next();
  } while (next && !next.done);
  return next.value != undefined;
}

export function drain(iterable: Iterable<unknown>) {
  if (!iterable) {
    return;
  }
  const iterator = iterable[Symbol.iterator]();
  let next: IteratorResult<unknown>;
  do {
    next = iterator.next();
  } while (next && !next.done);
  return next.value != undefined;
}
