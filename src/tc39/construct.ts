import {
  Internal,
  Name,
  Operations,
  Returns,
  UnknownOperation
} from "../operations/operation";
import { isAsyncIterable, isIterable } from "../async-like";

export class TC39IteratorHelpers {
  constructor(operations: Record<string, UnknownOperation | unknown>) {
    constructTC39IteratorHelpers(this, operations);
  }
}

export interface TC39IteratorHelpersConstructor<T> {
  new (): T;
  prototype: T;
}

export function createTC39IteratorHelpersConstructor<T extends object>(operations: Record<string, UnknownOperation | unknown>): TC39IteratorHelpersConstructor<T> {
  const constructor: Function & { prototype?: T } = function TC39IteratorHelpersConstructor() {};
  constructor.prototype = Object.create({});
  constructTC39IteratorHelpers<T>(constructor.prototype, operations);
  assertConstructor(constructor);
  return constructor;
  function assertConstructor(value: unknown): asserts value is TC39IteratorHelpersConstructor<T> {
    /* c8 ignore start */
    if (value !== constructor) {
      throw new Error("Expected constructor");
    }
    /* c8 ignore end */
  }
}

export function constructTC39IteratorHelpers<T extends object>(that: unknown, operations: Record<string, UnknownOperation | unknown>): asserts that is T {
  for (const operation of Object.values(operations)) {
    if (!isUnknownOperation(operation)) continue;
    if (operation[Internal]) continue;
    defineOperation(operation);
  }
  function isUnknownOperation(operation: unknown): operation is UnknownOperation {
    return typeof operation === "function";
  }
  function defineOperation(operation: UnknownOperation) {
    const name = operation[Name];
    if (!isOperationNamed(that, name)) {
      return;
    }
    that[name] = function iterableOperation(this: unknown, ...args: unknown[]): unknown {
      const prototype = Object.getPrototypeOf(this);
      const emptyPrototype = prototype === Object.getPrototypeOf({});
      const fn = operation(...args);
      if (!isCallableOperation(fn)) throw new Error("Expected function return");
      if (!isOperationIterable(this)) throw new Error("Expected iterable this type");
      const returned = fn(this);
      if (operation[Returns]) {
        return returned;
      }
      if (!isOperationIterable(returned)) {
        throw new Error("Expected iterable return type");
      }
      return new class extends (emptyPrototype ? TC39IteratorHelpers : prototype.constructor) {
        [Symbol.asyncIterator]: unknown;
        [Symbol.iterator]: unknown;
        constructor() {
          super(emptyPrototype ? operations : returned);
          this[Symbol.asyncIterator] = isAsyncIterable(returned) ? returned[Symbol.asyncIterator].bind(returned) : undefined;
          this[Symbol.iterator] = isIterable(returned) ? returned[Symbol.iterator].bind(returned) : undefined;
        }
      };

      function isOperationIterable(returned: unknown): returned is (Iterable<unknown> | AsyncIterable<unknown>) & { [Operations]?: unknown[] } {
        return isAsyncIterable(returned) || isIterable(returned);
      }

      function isCallableOperation<I>(fn: unknown): fn is (input: Iterable<unknown> | AsyncIterable<unknown>) => unknown {
        return typeof fn === "function";
      }
    };

    function isOperationNamed<N extends string>(value: unknown, name: N): value is Record<N, (this: unknown, ...args: unknown[]) => unknown> {
      return !!name;
    }
  }

}
