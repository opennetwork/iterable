import { reduce } from "./reduce";
import { AsyncIterableLike, asyncIterator, isAsyncIterable, isIterable } from "./async-like";
import { isCancelled, Cancellable } from "./cancellable";

type DeferredFn = (error: unknown) => void;
export type TransientAsyncIteratorSourceOnThrowFn<T> = (error: unknown) => void | Promise<void> | IteratorResult<T> | Promise<IteratorResult<T>>;
export type TransientAsyncIteratorSourceFn<T> = (() => Promise<T>) | (() => T);

export function source<T>(source?: AsyncIterableLike<T> | TransientAsyncIteratorSourceFn<T>, cancellable?: Cancellable): TransientAsyncIteratorSource<T> {
  return TransientAsyncIteratorSource.from(source, cancellable);
}

export class TransientAsyncIteratorSource<T = any> implements AsyncIterable<T> {

  private idGenerator: number = 0;
  private indexes: Map<number, number> = new Map();
  private sourceIterator?: AsyncIterator<T>;
  private inFlightValues: T[] = [];
  private deferred: DeferredFn[] = [];
  private isDone: boolean = false;
  private errorValue: unknown = undefined;
  private pullPromise: Promise<void> = undefined;

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

  // Allows for querying if anything was _pushed_ to the source
  get inFlight() {
    return this.open && this.inFlightValues.length > 0;
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
    if (!this.indexes.size) {
      // Nothing to do, don't push to in flight because
      // otherwise they'll just be sitting there for no reason
      //
      // No one is listening to hear the tree fall
      return false;
    }
    this.inFlightValues.push(value);
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

  private moveForwardInFlightValues() {
    if (!this.indexes.size) {
      if (this.inFlightValues.length !== 0) {
        // No need to hold any values if we have nothing to consume them
        this.inFlightValues = [];
      }
      return; // No need to move forward, no indexes
    }
    const newMinimumIndex = reduce(this.indexes.values(), (min, next: number) => Math.min(next, min));
    if (newMinimumIndex === 0) {
      // Nothing to do, already there
      return;
    }
    if (newMinimumIndex < 0) {
      throw new Error("0: Pushable is in an invalid state, please report this here https://github.com/opennetwork/iterable");
    }
    // We want to go down to zero so we don't keep climbing to infinity
    this.inFlightValues = this.inFlightValues.slice(newMinimumIndex);
    this.indexes.forEach((value, key, map) => map.set(key, 0));
  }

  [Symbol.asyncIterator]() {
    const id = (this.idGenerator += 1);
    // Start at the head
    this.indexes.set(id, this.inFlightValues.length);
    let returned: boolean = false;
    const iterator = {
      next: async (): Promise<IteratorResult<T>> => {
        const index = this.indexes.get(id);
        if (index >= this.inFlightValues.length) {
          if (returned || this.isDone) {
            // Force to always be done
            returned = true;
            return { done: true, value: undefined };
          }
          if (this.error) {
            throw this.error;
          }
          await this.waitForNext();
          return iterator.next();
        }
        const value = this.inFlightValues[index];
        this.indexes.set(id, index + 1);
        this.moveForwardInFlightValues();
        return { done: false, value };
      },
      return: async (): Promise<IteratorResult<T>> => {
        returned = true;
        this.indexes.delete(id);
        this.moveForwardInFlightValues();
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
    return iterator;
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
