import { assertTC39IteratorHelpersObject } from "./sync";
import { Arguments, Name, UnknownOperation } from "../../operations/operation";
import { isIterable } from "../../async-like";
import { TC39AsyncIteratorHelpers } from "../../tc39/async";
import { AssertTC39AsyncIteratorHelpersFn, assertTC39AsyncIteratorHelpersObject } from "./async";
import { InputOperationsArray } from "../../engine/context";

const test = (...operations: UnknownOperation[]) => {
  return {
    instance(iterable: AsyncIterable<unknown> | Iterable<unknown>) {
      let instance = new class extends TC39AsyncIteratorHelpers<unknown> {
        async *[Symbol.asyncIterator]() {
          yield * iterable;
        }
      };
      for (const operation of operations) {
        const name = operation[Name];
        if (!isOperationNamed(instance, name)) throw new Error(`Unknown operation name ${name}`);
        if (!isIterable(operation[Arguments])) throw new Error(`No arguments given for operation ${name}`);
        instance = instance[name](...operation[Arguments]);
      }
      return instance;
      function isOperationNamed<N extends string>(value: object, name: N): value is Record<N, (this: unknown, ...args: unknown[]) => typeof instance> {
        return !!name && name in value;
      }
    }
  };
};
const fn: AssertTC39AsyncIteratorHelpersFn = await assertTC39AsyncIteratorHelpersObject<InputOperationsArray, unknown>(test);
fn(test);
console.log("PASS assertAsyncTC39IteratorHelpersObject:class");
