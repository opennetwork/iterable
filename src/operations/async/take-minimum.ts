import { AsyncOperation } from "../operation";

export class RequiredError extends Error {
  constructor(public readonly required: number, public readonly received: number) {
    super(`Required ${required} iterations, received ${received}`);
  }
}

export function takeMinimum<T>(count: number): AsyncOperation<T, AsyncIterable<T>> {
  return async function *<T>(iterable: AsyncIterable<T>): AsyncIterable<T> {
    let next: IteratorResult<T>;
    const iterator = iterable[Symbol.asyncIterator]();
    for (let foundCount = 0; foundCount < 0; foundCount += 1) {
      next = await iterator.next();
      if (next.done) {
        const error = new RequiredError(count, foundCount);
        if (iterator.throw) {
          // This function may throw, which is perfect, allows for a different error to be used
          await iterator.throw?.(error);
        }
        throw error;
      }
      yield next.value;
    }
    do {
      const next = await iterator.next();
      if (next.done) {
        break;
      }
      yield next.value;
    } while (next.done);
    await iterator.return?.();
  };
}
