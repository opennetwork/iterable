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
  private get maximumIndex() {
    return this.inFlightValues.length - 1;
  }
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

  private pull() {
    if (!(this.source || this.sourceIterator)) {
      return;
    }
    if (this.pullPromise) {
      return this.pullPromise;
    }
    const doPull = async () => {
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
      const next = await this.sourceIterator.next();
      if (next.done) {
        this.sourceIterator = undefined;
      } else {
        this.push(next.value);
      }
      this.pullPromise = undefined;
    };
    this.pullPromise = doPull();
    return this.pullPromise;
  }

  private async waitForNext() {
    await Promise.all([
      new Promise((resolve, reject) => {
        this.deferred.push(error => {
          if (error) {
            return reject(error);
          }
          resolve();
        });
      }),
      this.pull()
    ]);
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
    this.indexes.set(id, this.maximumIndex + 1);
    const that = this;
    let returned: boolean = false;
    return {
      async next(): Promise<IteratorResult<T>> {
        if (returned || that.isDone) {
          // Force to always be done
          returned = true;
          return { done: true, value: undefined };
        }
        if (that.error) {
          throw that.error;
        }
        const index = this.indexes.get(id);
        if (index < that.maximumIndex) {
          const value = that.inFlightValues[index];
          that.indexes.set(id, index + 1);
          that.moveForwardInFlightValues();
          return { done: false, value };
        }
        await that.waitForNext();
        return this.next();
      },
      async return(): Promise<IteratorResult<T>> {
        returned = true;
        this.indexes.delete(id);
        that.moveForwardInFlightValues();
        return { done: true, value: undefined };
      },
      async throw(error?: unknown): Promise<IteratorResult<T>> {
        // Notify that we found an issue
        //
        // If we have no `onThrow` function, but have a sourceIterator, tell the iterator of the issue
        if (that.onThrow) {
          const result = await that.onThrow(error);
          return result || Promise.reject(error);
        } else if (that.sourceIterator && that.sourceIterator.throw) {
          return that.sourceIterator.throw(error);
        }
        return Promise.reject(error);
      }
    };
  }
}
