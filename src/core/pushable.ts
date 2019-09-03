type DeferredFn<T> = (error: Error | undefined, result: IteratorResult<T> | undefined) => void;

export class Pushable<T> implements AsyncIterable<T> {

  private values: T[] = [];
  private deferred: DeferredFn<T>[];
  private isDone: boolean = false;

  push(value: T) {
    this.values.push(value);
    this.invokeDeferred(undefined, {
      done: false,
      value: value
    });
  }

  close() {
    return this.done();
  }

  done(error?: Error) {
    if (this.isDone) {
      throw new Error("Already done");
    }
    this.isDone = true;
    if (error) {
      this.invokeDeferred(error);
    } else {
      this.invokeDeferred(undefined, {
        done: true,
        value: undefined
      });
    }
  }

  private invokeDeferred(error: Error | undefined, result?: IteratorResult<T>) {
    let fn: DeferredFn<T>;
    while (fn = this.deferred.shift()) {
      fn(error, result);
    }
  }

  async *[Symbol.asyncIterator]() {
    for (const value of this.values) {
      yield value;
    }
    if (this.isDone) {
      return;
    }
    const deferred = this.deferred;
    async function *loop(): AsyncIterable<T> {
      const result: IteratorResult<T> | undefined = await new Promise((resolve, reject) => {
        deferred.push((error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        });
      });
      if (!result) {
        // ended
        return;
      }
      if (result.done) {
        return;
      }
      yield result.value;
      yield *loop();
    }
    yield* loop();
  }
}
