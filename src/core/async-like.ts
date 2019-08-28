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
    return !!(
      value &&
      value.hasOwnProperty(Symbol.asyncIterator)
    );
  }
  return !!(
    isAsyncIterableInstance(value) &&
    value[Symbol.asyncIterator] instanceof Function
  );
}

export function isIterable<T>(value: unknown): value is Iterable<T> {
  function isIterableInstance(value: unknown): value is Iterable<T> {
    return !!(
      value &&
      value.hasOwnProperty(Symbol.iterator)
    );
  }
  return !!(
    isIterableInstance(value) &&
    value[Symbol.iterator] instanceof Function
  );
}
