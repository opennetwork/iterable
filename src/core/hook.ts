import { AsyncIterableLike, asyncIterator } from "./async-like";

export interface Hooks<T, I extends Iterable<T>, O extends Iterator<T>> {
  preIterator?(iterable: I): void;
  iterator?(iterable: I): O;
  postIterator?(iterator: O, iterable: I): void;
  preNext?(iterator: O, iterable: I): void;
  next?(iterator: O, iterable: I): IteratorResult<T>;
  postNext?(result: IteratorResult<T>, iterator: O, iterable: I): void;
  preYield?(value: T, iterator: O, iterable: I): void;
  yield?(value: T, iterator: O, iterable: I): T;
  postYield?(value: T, returned: any, iterator: O, iterable: I): void;
  done?(finalValue: T, finalReturned: any, iterator: O, iterable: I): void;
}

export interface AsyncHooks<T, I extends AsyncIterableLike<T>, O extends AsyncIterator<T>> {
  preIterator?(iterable: I): void | Promise<void>;
  iterator?(iterable: I): O;
  postIterator?(iterator: O, iterable: I): void | Promise<void>;
  preNext?(iterator: O, iterable: I): void | Promise<void>;
  next?(iterator: O, iterable: I): Promise<IteratorResult<T>>;
  postNext?(result: IteratorResult<T>, iterator: O, iterable: I): void | Promise<void>;
  preYield?(value: T, iterator: O, iterable: I): void | Promise<void>;
  yield?(value: T, iterator: O, iterable: I): T | Promise<T>;
  postYield?(value: T, returned: any, iterator: O, iterable: I): void | Promise<void>;
  done?(finalValue: T, finalReturned: any, iterator: O, iterable: I): void | Promise<void>;
}

export type Hook<T, I extends Iterable<T>> = (iterable: I) => IterableIterator<T>;
export type AsyncHook<T, I extends AsyncIterableLike<T>> = (iterable: I) => AsyncIterableIterator<T>;

export function hooks<T, I extends Iterable<T>, O extends Iterator<T>>(options: Hooks<T, I, O>): Hook<T, I> {
  return function *(iterable: I): IterableIterator<T> {
    if (options.preIterator) {
      options.preIterator(iterable);
    }
    const iterator = options.iterator ? options.iterator(iterable) : iterable[Symbol.iterator]() as O;
    if (options.postIterator) {
      options.postIterator(iterator, iterable);
    }
    let next: IteratorResult<T>;
    let value: T;
    let returned: any = undefined;
    do {
      if (options.preNext) {
        options.preNext(iterator, iterable);
      }
      next = options.next ? options.next(iterator, iterable) : iterator.next(returned);
      if (options.postNext) {
        options.postNext(next, iterator, iterable);
      }
      if (next.done) {
        break;
      }
      value = next.value;
      if (options.preYield) {
        options.preYield(value, iterator, iterable);
      }
      returned = yield options.yield ? options.yield(value, iterator, iterable) : value;
      if (options.postYield) {
        options.postYield(value, returned, iterator, iterable);
      }
    } while (!next.done);
    if (options.done) {
      options.done(value, returned, iterator, iterable);
    }
  };
}

export function asyncHooks<T, I extends AsyncIterableLike<T>, O extends AsyncIterator<T>>(options: AsyncHooks<T, I, O>): AsyncHook<T, I> {
  return async function *(iterable: I): AsyncIterableIterator<T> {
    if (options.preIterator) {
      await options.preIterator(iterable);
    }
    const iterator = options.iterator ? options.iterator(iterable) : asyncIterator(iterable) as O;
    if (options.postIterator) {
      await options.postIterator(iterator, iterable);
    }
    let next: IteratorResult<T>;
    let value: T;
    let returned: any = undefined;
    do {
      if (options.preNext) {
        await options.preNext(iterator, iterable);
      }
      next = await (options.next ? options.next(iterator, iterable) : iterator.next(returned));
      if (options.postNext) {
        await options.postNext(next, iterator, iterable);
      }
      if (next.done) {
        break;
      }
      value = next.value;
      if (options.preYield) {
        await options.preYield(value, iterator, iterable);
      }
      returned = yield options.yield ? options.yield(value, iterator, iterable) : value;
      if (options.postYield) {
        await options.postYield(value, returned, iterator, iterable);
      }
    } while (!next.done);
    if (options.done) {
      await options.done(value, returned, iterator, iterable);
    }
  };
}
