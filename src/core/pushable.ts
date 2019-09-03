type DeferredFn = (error: Error | undefined) => void;

export class Pushable<T> implements AsyncIterable<T> {

  private values: T[] = [];
  private deferred: DeferredFn[] = [];
  private isDone: boolean = false;

  push(value: T) {
    this.values.push(value);
    this.invokeDeferred(undefined);
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
      this.invokeDeferred(undefined);
    }
  }

  private invokeDeferred(error: Error | undefined) {
    let fn: DeferredFn;
    while (fn = this.deferred.shift()) {
      fn(error);
    }
  }

  async *[Symbol.asyncIterator]() {
    for (const value of this.values) {
      yield value;
    }
    let index: number = this.values.length;
    console.log("Starting loop");
    const that = this;
    async function *loop(): AsyncIterable<T> {
      if (that.isDone) {
        return;
      }
      // Catch up
      if (that.values.length !== index) {
        while (index < that.values.length) {
          yield that.values[index];
          index += 1;
        }
      }
      await Promise.race([
        new Promise((resolve, reject) => {
          that.deferred.push(error => {
            if (error) {
              return reject(error);
            }
            resolve();
          });
        })
      ]);
      yield *loop();
    }
    yield* loop();
  }
}
