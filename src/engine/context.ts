import { AsyncOperation, SyncOperation } from "../operations/operation";
import { PlusOne, MinusOne, LastIndex } from "./util-types";
import { isAsyncIterable, isIterable, isPromise } from "../async-like";

export interface InputFunction<T = unknown, O = unknown> {
  (input: T): O;
}
export type InputOperationsArray<T = unknown, O = unknown> = InputFunction<T, O>[];

type OperationReturnType<V> =
  V extends Iterable<infer Z> ?
    Z extends Promise<infer K> ? K : Z :
    V extends AsyncIterable<infer Z> ? Z : never;

export type DirectOperationsArray<O extends unknown[]> = O extends InputOperationsArray ? O : never;

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

export interface IterableEngineContext<Operations extends unknown[], OIndex extends number | never> {
  operation?: OIndex extends number ? DirectOperationsArray<Operations>[OIndex] : never;
  index?: OIndex;
  operations: Operations;
  next: Iterator<IterableEngineContext<Operations, number>>["next"];
  [Symbol.iterator](): Iterator<IterableEngineContext<Operations, number>>;
}

export function createIterableEngineContext<
  OT,
  OO,
  O extends InputOperationsArray<OT, OO>,
  Operations extends InputOperationsArray<OT, OO>
>(...operations: Operations): IterableEngineContext<Operations, never> {
  assertTyped(operations);
  return {
    operations,
    next() {
      return this[Symbol.iterator]().next();
    },
    *[Symbol.iterator](): Iterator<IterableEngineContext<Operations, number>> {
      let current: IterableEngineContext<Operations, number> = this;
      while ((current.index ?? -1) + 1 < current.operations.length) {
        yield current = getNextIterableEngineContext(current);
      }
    }
  };
  function assertTyped(value: unknown): asserts value is DirectOperationsArray<Operations> {
    if (value !== operations) {
      throw new Error("No");
    }
  }
}

export function getNextIterableEngineContext<
  C extends IterableEngineContext<unknown[], never>
>(context: C): IterableEngineContext<C["operations"], 0>;
export function getNextIterableEngineContext<
  C extends IterableEngineContext<unknown[], number>,
  IA extends PlusOne<C["index"]>,
>(context: C): IterableEngineContext<C["operations"], IA & number>;
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
  constructor(public context: IterableEngineContext<unknown[], number | never>, public next: IterableEngineContext<unknown[], number>) {
    super();
  }
}

class PromiseInterruptError extends AsyncInterruptError {
  constructor(public promise: Promise<unknown> | Promise<unknown>[], context: IterableEngineContext<unknown[], number | never>, next: IterableEngineContext<unknown[], number>) {
    super(context, next);
  }
}

class AsyncIterableInterruptError extends AsyncInterruptError {
  constructor(public iterable: AsyncIterable<unknown>, context: IterableEngineContext<unknown[], number | never>, next: IterableEngineContext<unknown[], number>) {
    super(context, next);
  }
}

class UnknownReturnedIterableError extends IterableError {
  constructor() {
    super("Unknown return value for iterable operation");
  }
}

export function iterateAsync<C extends IterableEngineContext<unknown[], number | never>>(context: IterableEngineContext<unknown[], never | number>, input: AsyncIterable<unknown> | Iterable<unknown>): AsyncIterable<
  OperationReturnType<C["operations"][LastIndex<C["operations"]>]>
>;
export async function *iterateAsync(context: IterableEngineContext<unknown[], never | number>, input: AsyncIterable<unknown> | Iterable<unknown>): AsyncIterable<unknown> {
  yield * iterateCaught(input);

  async function *iterateCaught(input: AsyncIterable<unknown> | Iterable<unknown>) {
    try {
      yield * iterate(context, input);
    } catch (error) {
      if (error instanceof PromiseInterruptError) {
        let input;
        if (Array.isArray(error.promise)) {
          input = await Promise.all(error.promise);
        } else {
          input = await error.promise;
        }
        if (!(isIterable(input) || isAsyncIterable(input))) throw new UnknownReturnedIterableError();
        return yield * iterateAsync(error.next, input);
      }
      if (error instanceof AsyncIterableInterruptError) {
        return yield * iterateAsync(error.next, error.iterable);
      }
      await Promise.reject(error);
      throw error;
    }
  }
}

export function iterate<C extends IterableEngineContext<unknown[], number | never>>(context: IterableEngineContext<unknown[], never | number>, input: AsyncIterable<unknown> | Iterable<unknown>): Iterable<
  OperationReturnType<C["operations"][LastIndex<C["operations"]>]>
  >;
export function *iterate(context: IterableEngineContext<unknown[], never | number>, input: AsyncIterable<unknown> | Iterable<unknown>): Iterable<unknown> {
  let current: AsyncIterable<unknown> | Iterable<unknown> = input;
  for (const next of context) {
    if (!isCallable(next)) throw new IterableError("Unexpected instance state");
    current = operation(context, next, current);
  }
  if (isIterable(current)) {
    yield * current;
  }

  function isCallable(context: IterableEngineContext<unknown[], never | number>): context is IterableEngineContext<InputFunction<AsyncIterable<unknown> | Iterable<unknown>>[], number> {
    return typeof context.index === "number" && typeof context.operation === "function";
  }
}

function *operation(context: IterableEngineContext<unknown[], number | never>, next: IterableEngineContext<InputFunction<AsyncIterable<unknown> | Iterable<unknown>>[], number>, input: AsyncIterable<unknown> | Iterable<unknown>): Iterable<unknown> {
  const returned = next.operation(input);
  if (!isIterable(returned)) {
    if (isPromise(returned)) throw new PromiseInterruptError(returned, context, next);
    if (isAsyncIterable(returned)) throw new AsyncIterableInterruptError(returned, context, next);
    throw new UnknownReturnedIterableError();
  }
  // TODO we can swap this to iterate further only on additional iteration requests
  const promises: Promise<unknown>[] = [];
  const values = [];
  for (const value of returned) {
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
