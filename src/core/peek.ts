import { AsyncIterableLike, asyncIterator } from "../async-like";

export function *peek<T>(iterable: Iterable<T>, count: number): Iterable<T> {
  const peekedValues: T[] = [];
  const iterator = iterable[Symbol.iterator]();
  let next: IteratorResult<T>;
  for (let peeked = 0; peeked < count; peeked += 1) {
    next = iterator.next();
    if (next.done) {
      break;
    }
    peekedValues.push(next.value);
  }
  while (peekedValues.length) {
    yield peekedValues.shift();
  }
  if (next && next.done) {
    return;
  }
  while (!next.done) {
    next = iterator.next();
    if (!next.done) {
      yield next.value;
    }
  }
  iterator.return();
}

export async function *asyncPeek<T>(iterable: AsyncIterableLike<T>, count: number): AsyncIterable<T> {
  const peekedValues: T[] = [];
  const iterator = asyncIterator(iterable);
  let next: IteratorResult<T>;
  for (let peeked = 0; peeked < count; peeked += 1) {
    next = await iterator.next();
    if (next.done) {
      break;
    }
    peekedValues.push(next.value);
  }
  while (peekedValues.length) {
    yield peekedValues.shift();
  }
  if (next && next.done) {
    return;
  }
  while (!next.done) {
    next = await iterator.next();
    if (!next.done) {
      yield next.value;
    }
  }
  await iterator.return();
}
