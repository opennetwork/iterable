import { AsyncIterableLike, asyncIterator } from "./async-like";

export function *mask<T>(iterable: Iterable<T>, maskIterable: Iterable<boolean>): Iterable<T> {
  const iterator = iterable[Symbol.iterator]();
  const maskIterator = maskIterable[Symbol.iterator]();
  let next: IteratorResult<T>,
    nextMask: IteratorResult<boolean>;
  do {
    next = iterator.next();
    nextMask = maskIterator.next();
    // If no value, we're done
    if (next.value == undefined) {
      continue;
    }
    // If mask has a value, we want to ignore
    if (nextMask.value) {
      continue;
    }
    yield next.value;
  } while (!next.done);
}

export async function *asyncMask<T>(iterable: AsyncIterableLike<T>, maskIterable: AsyncIterableLike<boolean>): AsyncIterable<T> {
  const iterator = asyncIterator(iterable);
  const maskIterator = asyncIterator(maskIterable);
  let next: IteratorResult<T>,
    nextMask: IteratorResult<boolean>;
  do {
    next = await iterator.next();
    nextMask = await maskIterator.next();
    // If no value, we're done
    if (next.value == undefined) {
      continue;
    }
    // If mask has a value, we want to ignore
    if (nextMask.value) {
      continue;
    }
    yield next.value;
  } while (!next.done);
}

export function *skip(count: number): Iterable<boolean> {
  for (let remaining = count; remaining > 0; remaining -= 1) {
    yield true;
  }
}
