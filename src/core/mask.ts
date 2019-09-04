import { AsyncIterableLike, asyncIterator } from "./async-like";

export function mask<T>(iterable: Iterable<T>, maskIterable: Iterable<boolean>): Iterable<T> {
  return maskReversible(iterable, maskIterable, false);
}

export function asyncMask<T>(iterable: AsyncIterableLike<T>, maskIterable: AsyncIterableLike<boolean>): AsyncIterable<T> {
  return asyncMaskReversible(iterable, maskIterable, false);
}

export function *maskReversible<T>(iterable: Iterable<T>, maskIterable: Iterable<boolean>, reverse: boolean = false): Iterable<T> {
  const iterator = iterable[Symbol.iterator]();
  const maskIterator = maskIterable[Symbol.iterator]();
  let next: IteratorResult<T>,
    nextMask: IteratorResult<boolean>;
  do {
    nextMask = maskIterator.next();
    if (reverse === true && nextMask.done) {
      break;
    }
    next = iterator.next();
    if (next.done) {
      break;
    }
    // if `reverse` is `true` and if `maskIterable` returns `true` then I want the value to be used, if it is `done` then I want to finish
    if (reverse === true && nextMask.value === true) {
      yield next.value;
    }
    // if reverse is false and if maskIterable returns `true` then I want the value to be skipped, if it is `done` then I want to finish
    if (reverse === false && nextMask.value !== true) {
      yield next.value;
    }
  } while (!next.done);
}

export async function *asyncMaskReversible<T>(iterable: AsyncIterableLike<T>, maskIterable: AsyncIterableLike<boolean>, reverse: boolean = false): AsyncIterable<T> {
  const iterator = asyncIterator(iterable);
  const maskIterator = asyncIterator(maskIterable);
  let next: IteratorResult<T>,
    nextMask: IteratorResult<boolean>;
  do {
    nextMask = await maskIterator.next();
    // If we have reversed, then as soon as mask
    if (reverse && nextMask.done) {
      break;
    }
    next = await iterator.next();
    if (next.done) {
      break;
    }
    // If no value, we're done
    // If mask has a value, we want to ignore
    if (nextMask.value !== reverse) {
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

export function *take(count: number): Iterable<boolean> {
  for (let remaining = count; remaining > 0; remaining -= 1) {
    yield true;
  }
}
