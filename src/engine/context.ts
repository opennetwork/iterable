import { AsyncOperation, SyncOperation } from "../operations/operation";
import { PlusOne, MinusOne, LastIndex } from "./util-types";
import { isAsyncIterable, isIterable, isPromise } from "../async-like";
import { ExpectedAsyncOperationError } from "../operations/async";

export interface InputFunction<T = unknown, O = unknown> {
  (input: T): O;
}
export type InputOperationsArray<T = unknown, O = unknown> = [InputFunction<T, O>, ...InputFunction<T, O>[]];

type OperationReturnType<V> =
  V extends Iterable<infer Z> ?
    Z extends Promise<infer K> ? K : Z :
    V extends AsyncIterable<infer Z> ? Z : never;

export type DirectOperationsArray<O extends unknown[], OT = unknown, OO = unknown> = O extends InputOperationsArray<OT, OO> ? O : never;

export type TypedOperationsArray<O extends InputOperationsArray> = O & (
  {
    [P in keyof O]: P extends 0 ?
    O[P] :
    P extends number ?
      SyncOperation<
        OperationReturnType<O[MinusOne<P>]>,
        OperationReturnType<O[P]>
        > |
      AsyncOperation<OperationReturnType<O[MinusOne<P>]>, OperationReturnType<O[P]>> : O[P]
  }[keyof O]
);

export type OperationsInputType<Operations extends unknown[]> =
  [Operations[0]] extends DirectOperationsArray<[Operations[0]], infer T> ? T : (AsyncIterable<unknown> | Iterable<unknown>);

export interface IterablePromise<T> extends Iterable<T>, AsyncIterable<T> {
  then: PromiseLike<Iterable<T>>["then"];
}

export interface IterableEngineContext<Operations extends unknown[], OIndex extends number | never> {
  operation?: OIndex extends number ? DirectOperationsArray<Operations>[OIndex] : never;
  index?: OIndex;
  operations: Operations;
  concat(...operations: unknown[]): IterableEngineContext<unknown[], number | never>;
  asyncIterable(input: OperationsInputType<Operations>): AsyncIterable<OperationReturnType<Operations[LastIndex<Operations>]>>;
  iterable(input: OperationsInputType<Operations>): Iterable<OperationReturnType<Operations[LastIndex<Operations>]>>;
  contexts(): Iterable<IterableEngineContext<Operations, number>>;
  instance(input: OperationsInputType<Operations>): IterablePromise<Operations[LastIndex<Operations>]>;
}

export function createIterableEngineContext<
  OT,
  OO,
  O extends InputOperationsArray<OT, OO>,
  Operations extends InputOperationsArray<OT, OO>
>(...operations: Operations): IterableEngineContext<Operations, never> {
  assertTyped(operations);
  const emptyContext: IterableEngineContext<Operations, never> = {
    operations,
    concat(operations: unknown[]): IterableEngineContext<unknown[], number | never> {
      const unknownContext: IterableEngineContext<unknown[], number> = this ?? emptyContext;
      return {
        ...unknownContext,
        operations: unknownContext.operations.concat(operations)
      };
    },
    async *asyncIterable(input) {
      const unknownContext: IterableEngineContext<unknown[], number> = this ?? emptyContext;
      const unknownInput: unknown = input;
      if (!(isAsyncIterable(unknownInput) || isIterable(unknownInput))) throw new Error();
      yield * iterateAsync(unknownContext, unknownInput);
    },
    *iterable(input) {
      const unknownContext: IterableEngineContext<unknown[], number> = this ?? emptyContext;
      const unknownInput: unknown = input;
      if (!isIterable(unknownInput)) throw new Error();
      yield * iterate(unknownContext, unknownInput);
    },
    *contexts(this: IterableEngineContext<Operations, number | never>): Iterable<IterableEngineContext<Operations, number>> {
      let current: IterableEngineContext<Operations, number> = this ?? emptyContext;
      while ((current.index ?? -1) + 1 < current.operations.length) {
        current = getNextIterableEngineContext(current);
        yield current;
      }
    },
    instance(input) {
      type T = Operations[LastIndex<Operations>];
      const context = this;
      const instance: IterablePromise<T> = {
        async *[Symbol.asyncIterator]() {
          yield * context.asyncIterable(input);
        },
        *[Symbol.iterator]() {
          yield * context.iterable(input);
        },
        then(resolve, reject) {
          return async().then(resolve, reject);
          async function async() {
            try {
              const values: T[] = [];
              let value: T;
              for await (value of instance) {
                values.push(value);
              }
              return values;
            } catch (error) {
              if (error instanceof UnknownReturnedIterableError) {
                return error.value;
              } else {
                await Promise.reject(error);
                throw error;
              }
            }
          }
        }
      };
      return instance;
    }
  };

  // const context = {
  //   operations,
  //   get nextContext() {
  //     return function () {
  //       return getNextIterableEngineContext(context);
  //     };
  //   },
  //   *[Symbol.iterator](): Iterator<IterableEngineContext<Operations, number>> {
  //     let current: IterableEngineContext<Operations, number> = this;
  //     while ((current.index ?? -1) + 1 < current.operations.length) {
  //       yield current = getNextIterableEngineContext(current);
  //     }
  //   }
  // };
  return emptyContext;
  function assertTyped(value: unknown): asserts value is DirectOperationsArray<Operations> {
    if (value !== operations) {
      throw new Error("No");
    }
  }
}

// export function getNextIterableEngineContext<
//   C extends IterableEngineContext<[unknown, unknown[]], never>
// >(context: C): IterableEngineContext<C["operations"], 0>;
// export function getNextIterableEngineContext<
//   C extends IterableEngineContext<[unknown, unknown[]], number>,
//   IA extends PlusOne<C["index"]>,
// >(context: C): IterableEngineContext<C["operations"], IA & number>;
export function getNextIterableEngineContext<
  O extends unknown[],
  C extends IterableEngineContext<O, number | never>,
>(context: C): IterableEngineContext<O, number>;
export function getNextIterableEngineContext<
  C extends IterableEngineContext<unknown[], never>,
  IA extends number
>(context: C): IterableEngineContext<unknown[], number> {
  const index = (context.index ?? -1) + 1;
  return {
    ...context,
    operation: context.operations[index],
    index: (context.index ?? -1) + 1
  };
}

class IterableError extends Error {

}


class AsyncInterruptError extends IterableError {
  constructor(public context: IterableEngineContext<unknown[], number | never>, public next: CallableIterableEngineContext) {
    super();
  }
}

class PromiseInterruptError extends AsyncInterruptError {
  constructor(public promise: Promise<unknown> | Promise<unknown>[], context: IterableEngineContext<unknown[], number | never>, next: CallableIterableEngineContext) {
    super(context, next);
  }
}

class AsyncIterableInterruptError extends AsyncInterruptError {
  constructor(public iterable: AsyncIterable<unknown>, context: IterableEngineContext<unknown[], number | never>, next: CallableIterableEngineContext) {
    super(context, next);
  }
}

class UnknownValueError extends IterableError {
  constructor(public value: unknown) {
    super();
  }
}

class UnknownReturnedIterableError extends IterableError {
  constructor(public value?: unknown) {
    super("Unknown return value for iterable operation");
  }
}

export function iterateAsync<O extends unknown[], C extends IterableEngineContext<O, number | never>>(context: IterableEngineContext<unknown[], never | number> | CallableIterableEngineContext, input: AsyncIterable<unknown> | Iterable<unknown>): AsyncIterable<
  OperationReturnType<C["operations"][LastIndex<C["operations"]>]>
>;
export async function *iterateAsync(context: IterableEngineContext<unknown[], never | number>, input: AsyncIterable<unknown> | Iterable<unknown>): AsyncIterable<unknown> {
  let current: AsyncIterable<unknown> | Iterable<unknown> = input;
  for (const next of context.contexts()) {
    if (!isCallable(next)) throw new IterableError("Unexpected instance state");
    current = operationAsync(context, next, current);
  }
  if (isIterable(current) || isAsyncIterable(current)) {
    yield * current;
  }
}

export function iterate<O extends (unknown[] | InputOperationsArray), C extends IterableEngineContext<O, number | never>>(context: IterableEngineContext<unknown[], never | number>, input: AsyncIterable<unknown> | Iterable<unknown>): Iterable<
  OperationReturnType<O[LastIndex<C["operations"]>]>
  >;
export function *iterate(context: IterableEngineContext<unknown[], never | number>, input: AsyncIterable<unknown> | Iterable<unknown>): Iterable<unknown> {
  let current: AsyncIterable<unknown> | Iterable<unknown> = input;
  for (const next of context.contexts()) {
    if (!isCallable(next)) throw new IterableError("Unexpected instance state");
    current = operation(context, next, current);
  }
  if (isIterable(current)) {
    yield* current;
  } else {
    throw new UnknownValueError(current);
  }
}

async function *async(input: AsyncIterable<unknown> | Iterable<unknown>) {
  yield *input;
}

type CallableIterableEngineContext = IterableEngineContext<[InputFunction<AsyncIterable<unknown> | Iterable<unknown>>, ...InputFunction<AsyncIterable<unknown> | Iterable<unknown>>[]], number>;

function isCallable<T>(context: unknown): context is CallableIterableEngineContext {
  function isContext(context: unknown): context is {
    index: unknown,
    operation: unknown,
    operations: unknown,
    contexts: unknown,
    asyncIterable: unknown,
  } {
    return !!context;
  }
  return isContext(context) && (
    typeof context.index === "number" &&
    typeof context.contexts === "function" &&
    typeof context.operation === "function" &&
    typeof context.asyncIterable === "function" &&
    Array.isArray(context.operations) &&
    !!context.operations[0]
  );
}

async function *operationAsync(context: IterableEngineContext<unknown[], number | never>, next: CallableIterableEngineContext, input: AsyncIterable<unknown> | Iterable<unknown>): AsyncIterable<unknown> {
  let returned;
  try {
    return yield * operation(context, next, input);
  } catch (error) {
    if (error instanceof PromiseInterruptError) {
      if (!Array.isArray(error.promise)) {
        debug(next, "Have promise");
        returned = await error.promise;
      } else {
        debug(next, "Have promises");
        returned = (async function *(promises: Promise<unknown>[]) {
          for (const promise of promises) {
            yield await promise;
          }
        })(error.promise);
      }
    } else if (error instanceof AsyncIterableInterruptError) {
      debug(next, "Have async result");
      returned = error.iterable;
    } else // This would only be caught if it was thrown at function call time
    // this is not true for generators
    if (error instanceof ExpectedAsyncOperationError) {
      debug(next, "Have async operation");
      returned = error.operation(async(input));
    } else {
      await Promise.reject(error);
      throw error;
    }
  }
  if (isAsyncIterable(returned)) return yield * returned;
  if (!isIterable(returned)) throw new UnknownReturnedIterableError(returned);
  try {
    yield * iterableOperationReturn(context, next, returned);
  } catch (error) {
    if (error instanceof ExpectedAsyncOperationError) {
      return yield * operationAsync(context, {
        ...next,
        operation: error.operation
      }, input);
    } else {
      await Promise.reject(error);
      throw error;
    }
  }
}

function *operation(context: IterableEngineContext<unknown[], number | never>, next: CallableIterableEngineContext, input: AsyncIterable<unknown> | Iterable<unknown>): Iterable<unknown> {
  debug(next, "Try sync");
  const returned = next.operation(input);
  if (!isIterable(returned)) {
    if (isAsyncIterable(returned)) throw new AsyncIterableInterruptError(returned, context, next);
    if (isPromise(returned)) throw new PromiseInterruptError(returned, context, next);
    throw new UnknownReturnedIterableError(returned);
  }
  debug(next, "Have sync");
  yield * iterableOperationReturn(context, next, returned);
}

// TODO we can swap this to iterate further only on additional iteration requests
function *iterableOperationReturn(context: IterableEngineContext<unknown[], number | never>, next: CallableIterableEngineContext, input: Iterable<unknown>) {
  const promises: Promise<unknown>[] = [];
  const values = [];
  for (const value of input) {
    if (isPromise(value)) {
      // Prepend the values already resolved
      promises.push(...values.map(value => Promise.resolve(value)));
      promises.push(value);
    } else
      // Always add as a promise and stop yielding if we have hit async mode
    if (promises.length) {
      promises.push(Promise.resolve(value));
    } else {
      yield value;
      values.push(value);
    }
  }
  if (promises.length) throw new PromiseInterruptError(promises, context, next);
}

function debug(context: IterableEngineContext<unknown[], number | never> | CallableIterableEngineContext, ...args: unknown[]) {
  // console.log(context.operation, ...args);
}
