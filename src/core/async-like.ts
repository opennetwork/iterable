export type AsyncIterableLike<T> = Iterable<T> | AsyncIterable<T>;

export function asyncIterator<T>(value: AsyncIterableLike<T>): AsyncIterator<T> {
  return asyncIterable(value)[Symbol.asyncIterator]();
}

export function asyncIterable<T>(value: AsyncIterableLike<T>): AsyncIterable<T> {
  if (isAsyncIterable(value)) {
    return value;
  }
  return {
    [Symbol.asyncIterator]: async function *() {
      if (!isIterable(value)) {
        return;
      }
      for (const item of value) {
        yield item;
      }
    }
  };
}

export function isAsyncIterable<T>(value: unknown): value is AsyncIterable<T> {
  function isAsyncIterableInstance(value: unknown): value is AsyncIterable<T> {
    return !!value;
  }
  return !!(
    isAsyncIterableInstance(value) &&
    value[Symbol.asyncIterator] instanceof Function
  );
}

export function isIterable<T>(value: unknown): value is Iterable<T> {
  function isIterableInstance(value: unknown): value is Iterable<T> {
    return !!value;
  }
  return !!(
    isIterableInstance(value) &&
    value[Symbol.iterator] instanceof Function
  );
}

export function isIterableIterator(value: unknown): value is (IterableIterator<any> | AsyncIterableIterator<any>)  {
  function isIteratorLike(value: unknown): value is { next?: unknown } {
    return typeof value === "object";
  }
  return (
    isIteratorLike(value) &&
    value.next instanceof Function &&
    (
      isAsyncIterable(value) ||
      isIterable(value)
    )
  );
}

export function isPromise<T = unknown>(value: unknown): value is Promise<T> {
  function isPromiseLike(value: unknown): value is { then?: unknown } {
    return typeof value === "object";
  }
  return (
    isPromiseLike(value) &&
    value.then instanceof Function
  );
}

export async function getNext<T>(iterator: Iterator<T> | AsyncIterator<T>, value?: any): Promise<IteratorResult<T>> {
  let next: IteratorResult<T> | Promise<IteratorResult<T>>;
  try {
    next = iterator.next(value);
    if (isPromise(next)) {
      next = await next;
    }
    if (next.done) {
      if (iterator.return) {
        next = iterator.return(value);
        if (isPromise(next)) {
          next = await next;
        }
      }
    }
    return next;
  } catch (e) {
    if (!iterator.throw) {
      throw e;
    }
    next = iterator.throw(e);
    if (isPromise(next)) {
      next = await next;
    }
    return next;
  }
}
