import { reduce } from "./reduce";

type DeferredFn = (error: unknown) => void;

export class Queue<T = any> implements AsyncIterable<T> {

  private idGenerator: number = 0;
  private get maximumIndex() {
    return this.inFlightValues.length - 1;
  }
  private indexes: Map<number, number> = new Map();
  private inFlightValues: T[] = [];
  private deferred: DeferredFn[] = [];
  private isDone: boolean = false;
  private errorValue: unknown = undefined;

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
  next(value: T): boolean {
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

  private waitForNext() {
    return new Promise((resolve, reject) => {
      this.deferred.push(error => {
        if (error) {
          return reject(error);
        }
        resolve();
      });
    });
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

  async *[Symbol.asyncIterator]() {
    const id = (this.idGenerator += 1);
    // Start at the head
    this.indexes.set(id, this.maximumIndex + 1);
    const that = this;
    async function *drain(): AsyncIterable<T> {
      // Catch up
      // If there are no values to consume, maximumIndex will be one less than our index
      let index: number;
      while ((index = that.indexes.get(id)) < that.maximumIndex) {
        const value = that.inFlightValues[index];
        that.indexes.set(id, index + 1);
        yield value;
      }
      // We want to remove any values that aren't required any more
      that.moveForwardInFlightValues();
    }
    async function *loop(): AsyncIterable<T> {
      yield* drain();
      if (that.isDone) {
        return;
      }
      if (that.error) {
        throw that.error;
      }
      await that.waitForNext();
      yield* loop();
    }
    yield* loop();
    this.indexes.delete(id);
    that.moveForwardInFlightValues();
  }
}
