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

interface Constructable {
  new(): Partial<AsyncIterable<unknown> & Iterable<unknown>>;
  prototype?: Record<string, unknown>;
}

function createConstructor<T extends object>() {
  const constructor = function TC39IteratorHelpersConstructor() {};
  constructor.prototype = Object.create({});
  return constructor as unknown as Constructable;
}

export function createTC39IteratorHelpersConstructor<T extends object>(operations: Record<string, UnknownOperation | unknown>): TC39IteratorHelpersConstructor<T> {
  const constructor = createConstructor<T>();
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
  const Constructor = createConstructor<T>();
  const prototype = Constructor.prototype;
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
    prototype[name] = function iterableOperation(this: unknown, ...args: unknown[]): unknown {
      const prototype = Object.getPrototypeOf(this);
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
      if (isReturnedOperation(returned)) {
        return returned;
      }
      const extendable = new Constructor();
      extendable[Symbol.iterator] = returned[Symbol.iterator]?.bind(returned);
      extendable[Symbol.asyncIterator] = returned[Symbol.asyncIterator]?.bind(returned);
      return extendable;

      function isReturnedOperation(returned: unknown) {
        return isRecord(returned) && returned[name];
      }

      function isRecord(value: unknown): value is Record<string, unknown> {
        return !!value;
      }

      function isOperationIterable(returned: unknown): returned is Partial<Iterable<unknown> & AsyncIterable<unknown>> & { [Operations]?: unknown[] } {
        return isAsyncIterable(returned) || isIterable(returned);
      }

      function isCallableOperation<I>(fn: unknown): fn is (input: unknown) => unknown {
        return typeof fn === "function";
      }
    };

    if (that[name]) {
      // Retain original implementation if it exists
      // Maybe we're trying to polyfill where it now exists!! Exciting times
      return;
    }
    Object.assign(that, { [name]: prototype[name] });

    function isOperationNamed<N extends string>(value: unknown, name: N): value is Record<N, (this: unknown, ...args: unknown[]) => unknown> {
      return !!name;
    }
  }

}
