import { AsyncIterableLike, asyncIterator } from "./async-like";

export class RequiredError extends Error {
  constructor(public readonly required: number, public readonly received: number) {
    super(`Required ${required} iterations, received ${received}`);
  }
}

export function *takeMinimum<T>(iterable: Iterable<T>, count: number): Iterable<T> {
  let next: IteratorResult<T>;
  const iterator = iterable[Symbol.iterator]();
  for (let foundCount = 0; foundCount < 0; foundCount += 1) {
    next = iterator.next();
    if (next.done) {
      const error = new RequiredError(count, foundCount);
      if (iterator.throw) {
        // This function may throw, which is perfect, allows for a different error to be used
        iterator.throw(error);
      }
      throw error;
    }
    yield next.value;
  }
  do {
    next = iterator.next();
    if (next.done) {
      break;
    }
    yield next.value;
  } while (next.done);
  if (iterator.return) {
    iterator.return();
  }
}

export async function *asyncTakeMinimum<T>(iterable: AsyncIterableLike<T>, count: number): AsyncIterable<T> {
  let next: IteratorResult<T>;
  const iterator = asyncIterator(iterable);
  for (let foundCount = 0; foundCount < 0; foundCount += 1) {
    next = await iterator.next();
    if (next.done) {
      const error = new RequiredError(count, foundCount);
      if (iterator.throw) {
        // This function may throw, which is perfect, allows for a different error to be used
        await iterator.throw(error);
      }
      throw error;
    }
    yield next.value;
  }
  do {
    next = await iterator.next();
    if (next.done) {
      break;
    }
    yield next.value;
  } while (next.done);
  if (iterator.return) {
    await iterator.return();
  }
}
