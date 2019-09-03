import { AsyncIterableLike, asyncIterator } from "./async-like";

export interface Hooks<T> {
  preInit?(iterable: Iterable<T>): void;
  postInit?(iterator: Iterator<T>, iterable: Iterable<T>): void;
  preYield?(value: T, iterator: Iterator<T>, iterable: Iterable<T>): void;
  postYield?(value: T, returned: any, iterator: Iterator<T>, iterable: Iterable<T>): void;
  done?(finalValue: T, finalReturned: any, iterator: Iterator<T>, iterable: Iterable<T>): void;
}

export interface AsyncHooks<T> {
  preInit?(iterable: AsyncIterableLike<T>): void | Promise<void>;
  postInit?(iterator: AsyncIterator<T>, iterable: AsyncIterableLike<T>): void | Promise<void>;
  preYield?(value: T, iterator: AsyncIterator<T>, iterable: AsyncIterableLike<T>): void | Promise<void>;
  postYield?(value: T, returned: any, iterator: AsyncIterator<T>, iterable: AsyncIterableLike<T>): void | Promise<void>;
  done?(finalValue: T, finalReturned: any, iterator: AsyncIterator<T>, iterable: AsyncIterableLike<T>): void | Promise<void>;
}

export type Hook<T> = (iterable: Iterable<T>) => IterableIterator<T>;
export type AsyncHook<T> = (iterable: AsyncIterableLike<T>) => AsyncIterableIterator<T>;

export function hooks<T>(options: Hooks<T>): Hook<T> {
  return function *(iterable: Iterable<T>): IterableIterator<T> {
    if (options.preInit) {
      options.preInit(iterable);
    }
    const iterator = iterable[Symbol.iterator]();
    if (options.postInit) {
      options.postInit(iterator, iterable);
    }
    let next: IteratorResult<T>;
    let value: T;
    let returned: any = undefined;
    do {
      next = iterator.next(returned);
      if (next.done) {
        break;
      }
      value = next.value;
      if (options.preYield) {
        options.preYield(value, iterator, iterable);
      }
      returned = yield value;
      if (options.postYield) {
        options.postYield(value, returned, iterator, iterable);
      }
    } while (!next.done);
    if (options.done) {
      options.done(value, returned, iterator, iterable);
    }
  };
}

export function asyncHooks<T>(options: AsyncHooks<T>): AsyncHook<T> {
  return async function *(iterable: AsyncIterableLike<T>): AsyncIterableIterator<T> {
    if (options.preInit) {
      await options.preInit(iterable);
    }
    const iterator = asyncIterator(iterable);
    if (options.postInit) {
      options.postInit(iterator, iterable);
    }
    let next: IteratorResult<T>;
    let value: T;
    let returned: any = undefined;
    do {
      next = await iterator.next(returned);
      if (next.done) {
        break;
      }
      value = next.value;
      if (options.preYield) {
        await options.preYield(value, iterator, iterable);
      }
      returned = yield value;
      if (options.postYield) {
        await options.postYield(value, returned, iterator, iterable);
      }
    } while (!next.done);
    if (options.done) {
      await options.done(value, returned, iterator, iterable);
    }
  };
}
