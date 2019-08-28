import { AsyncIterableLike, asyncIterator } from "./async-like";

export async function asyncDrain(iterable: AsyncIterableLike<unknown>) {
  if (!iterable) {
    return;
  }
  const iterator = asyncIterator(iterable);
  let next: IteratorResult<unknown>,
    anyValue: boolean = false;
  do {
    next = await iterator.next();
    anyValue = anyValue || next.value != undefined;
  } while (next && !next.done);
  return anyValue;
}

export function drain(iterable: Iterable<unknown>) {
  if (!iterable) {
    return;
  }
  const iterator = iterable[Symbol.iterator]();
  let next: IteratorResult<unknown>,
    anyValue: boolean = false;
  do {
    next = iterator.next();
    anyValue = anyValue || next.value != undefined;
  } while (next && !next.done);
  return anyValue;
}
