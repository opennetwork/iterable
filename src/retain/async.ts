import { asyncIterable, AsyncIterableLike, asyncIterator } from "../async-like";
import { Retainer, arrayRetainer } from "./sync";

export interface AsyncRetainer<T> extends AsyncIterable<T> {
  has?(value: T): boolean | Promise<boolean>;
  add(value: T): void | Promise<void>;
}

export interface AsyncRetainerWithHas<T> extends AsyncRetainer<T> {
  has(value: T): boolean | Promise<boolean>;
}

export function asyncRetain<T>(iterable: AsyncIterableLike<T>, retainer: Retainer<T> | AsyncRetainer<T> = arrayRetainer()): AsyncIterable<T> {
  const iterator = asyncIterator(iterable);
  async function *generator() {
    for await (const value of asyncIterable(retainer)) {
      yield value;
    }
    let next: IteratorResult<T>;
    do {
      next = await iterator.next();
      if (next.done) {
        continue;
      }
      // See explanation @ sync version of retain
      if (retainer.has && await retainer.has(next.value)) {
        continue;
      }
      await retainer.add(next.value);
      yield next.value;
    } while (!next.done);
  }
  return {
    [Symbol.asyncIterator]: generator
  };
}
