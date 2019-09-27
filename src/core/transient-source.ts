import { AsyncIterableLike, asyncIterator, isAsyncIterable, isIterable } from "./async-like";
import { isCancelled, Cancellable } from "./cancellable";
import { WeakLinkedList } from "@opennetwork/linked-list";

type DeferredFn = (error: unknown) => void;
export type TransientAsyncIteratorSourceOnThrowFn<T> = (error: unknown) => void | Promise<void> | IteratorResult<T> | Promise<IteratorResult<T>>;
export type TransientAsyncIteratorSourceFn<T> = (() => Promise<T>) | (() => T);

export function source<T>(source?: AsyncIterableLike<T> | TransientAsyncIteratorSourceFn<T>, cancellable?: Cancellable): TransientAsyncIteratorSource<T> {
  return TransientAsyncIteratorSource.from(source, cancellable);
}

export class TransientAsyncIteratorSource<T = any> implements AsyncIterable<T> {

  private sourceIterator?: AsyncIterator<T>;
  private deferred: DeferredFn[] = [];
  private isDone: boolean = false;
  private errorValue: unknown = undefined;
  private pullPromise: Promise<void> = undefined;

  private values = new WeakLinkedList<T>();
  private nextIndex: object = {};
  private index: object = undefined;

  constructor(private source?: AsyncIterableLike<T>, private sourceCancellable?: Cancellable, private onThrow?: TransientAsyncIteratorSourceOnThrowFn<T>) {

  }

  static from<T>(source?: AsyncIterableLike<T> | TransientAsyncIteratorSourceFn<T>, cancellable?: Cancellable): TransientAsyncIteratorSource<T> {
    if (!source) {
      return new TransientAsyncIteratorSource<T>(undefined, cancellable);
    }
    if (isAsyncIterable(source) || isIterable(source)) {
      return new TransientAsyncIteratorSource(source, cancellable);
    }
    const iterable = {
      [Symbol.asyncIterator]: (): AsyncIterator<T> => ({
        next: async (): Promise<IteratorResult<T>> => ({ done: false, value: await source() })
      })
    };
    return new TransientAsyncIteratorSource(
      iterable,
      cancellable
    );
  }

  get error() {
    return this.errorValue;
  }

  get open() {
    return !(this.isDone || this.error);
  }

  get hasSource() {
    if (!this.open || isCancelled(this.sourceCancellable)) {
      return false;
    }
    return !!(this.source || this.sourceIterator);
  }

  /**
   * @param value
   * @returns {boolean} false if the value won't be processed
   */
  push(value: T): boolean {
    if (!this.open) {
      return false;
    }
    this.values.insert(this.index, this.nextIndex, value);
    this.index = this.nextIndex;
    this.nextIndex = {};
    this.invokeDeferred(undefined);
    return true;
  }

  /**
   * @returns {boolean} false if the pushable is not open
   */
  close(): boolean {
    if (!this.open) {
      return false;
    }
    this.isDone = true;
    this.invokeDeferred(undefined);
    return true;
  }

  /**
   * @param error
   * @returns {boolean} false if the pushable is not open
   */
  throw(error?: unknown): boolean {
    if (!this.open) {
      return false;
    }
    this.errorValue = error || new Error();
    this.invokeDeferred(this.error);
    return true;
  }

  async setSource(source?: AsyncIterableLike<T>, sourceCancellable?: Cancellable) {
    const hadSource = this.hasSource;
    this.source = source;
    this.sourceCancellable = sourceCancellable;
    this.sourceIterator = undefined;
    // If there wasn't a source before, and there is a source now, then pull the next value
    // to trigger the waiting iterators
    //
    // The caller of this function should wait for this to be done in case we run into an issue
    // The issue will only be from _their source_ rather than one of the deferred functions
    // as pull invokes `push` rather than invoking the iterators directly
    //
    // If someone replaces the source while we're pulling, then we will
    // be waiting for that source as well, so be aware that this _may_ throw an error from _a separate source_
    // this is because we loop around when we get a new source
    if (!hadSource && source && this.deferred.length) {
      return this.pull();
    }
  }

  private pull() {
    if (!(this.source || this.sourceIterator)) {
      return;
    }
    if (this.pullPromise) {
      return this.pullPromise;
    }
    const doPull = async (): Promise<void> => {
      if (isCancelled(this.sourceCancellable)) {
        if (this.sourceIterator && this.sourceIterator.return) {
          // Invoking this method notifies the AsyncIterator object that the caller does not intend to make any more next method calls to the AsyncIterator.
          await this.sourceIterator.return();
        }
        this.pullPromise = undefined;
        this.source = undefined;
        this.sourceIterator = undefined;
        return;
      }
      // Swap to the iterator and get rid of the iterable
      // we no longer need it
      if (!this.sourceIterator) {
        this.sourceIterator = asyncIterator(this.source);
        this.source = undefined;
      }
      const iterator = this.sourceIterator;
      const next = await iterator.next();
      // The source iterator could change while we're in progress
      // as soon as it has, ignore what you found and move on
      if (!next.done && this.sourceIterator === iterator) {
        this.push(next.value);
      } else if (this.sourceIterator !== iterator) {
        // We have a new source iterator, so lets start again
        return doPull();
      } else if (next.done) {
        this.sourceIterator = undefined;
      }
      this.pullPromise = undefined;
    };
    this.pullPromise = doPull();
    return this.pullPromise;
  }

  private async waitForNext() {
    const promise = new Promise((resolve, reject) => {
      this.deferred.push(error => {
        if (error) {
          return reject(error);
        }
        resolve();
      });
    });
    await this.pull();
    return promise;
  }

  private invokeDeferred(error: unknown) {
    let fn: DeferredFn;
    while (fn = this.deferred.shift()) {
      fn(error);
    }
  }

  [Symbol.asyncIterator]() {
    let index: object = this.nextIndex;
    let currentIndexConsumed: boolean = false;

    let nextPromise: Promise<unknown> = undefined;

    // We need this to be in series so that we have a stable progression from one value to the next
    const nextSeries = async (): Promise<IteratorResult<T>> => {
      if (!index || this.isDone) {
        // Force to always be done
        index = undefined;
        return { done: true, value: undefined };
      }
      if (this.error) {
        throw this.error;
      }

      const node = this.values.get(index);

      if (!node) {
        await this.waitForNext();
        return nextSeries();
      }

      if (!currentIndexConsumed) {
        currentIndexConsumed = true;
        return { done: false, value: node.value };
      }

      if (node.next) {
        index = node.next;
        currentIndexConsumed = false;
        return nextSeries();
      }

      // We're at the end, wait for the next index
      index = this.nextIndex;
      currentIndexConsumed = false;
      return nextSeries();
    };

    return {
      next: async () => {
        const currentPromise = (nextPromise || Promise.resolve(undefined))
          .then(nextSeries)
          .then(result => {
            if (currentPromise === nextPromise) {
              nextPromise = undefined;
            }
            return result;
          });
        nextPromise = currentPromise;
        return currentPromise;
      },
      return: async (): Promise<IteratorResult<T>> => {
        index = undefined;
        return { done: true, value: undefined };
      },
      throw: async (error?: unknown): Promise<IteratorResult<T>> => {
        // Notify that we found an issue
        //
        // If we have no `onThrow` function, but have a sourceIterator, tell the iterator of the issue
        if (this.onThrow) {
          const result = await this.onThrow(error);
          return result || Promise.reject(error);
        } else if (this.sourceIterator && this.sourceIterator.throw) {
          return this.sourceIterator.throw(error);
        }
        return Promise.reject(error);
      }
    };
  }
}

export function isTransientAsyncIteratorSource(value: unknown): value is TransientAsyncIteratorSource<any> {
  type Like = AsyncIterable<any> & {
    open?: unknown,
    inFlight?: unknown,
    push?: unknown,
    close?: unknown,
    throw?: unknown,
    hasSource?: unknown,
    setSource?: unknown
  };
  function isTransientAsyncIteratorSourceLike(value: unknown): value is Like {
    return isAsyncIterable(value);
  }
  return (
    isTransientAsyncIteratorSourceLike(value) &&
    typeof value.open === "boolean" &&
    typeof value.inFlight === "boolean" &&
    typeof value.hasSource === "boolean" &&
    typeof value.push === "function" &&
    typeof value.close === "function" &&
    typeof value.throw === "function" &&
    typeof value.setSource === "function"
  );
}
