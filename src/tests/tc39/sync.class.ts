import { assertTC39IteratorHelpersObject } from "./sync";
import { TC39SyncIteratorHelpers } from "../../tc39/sync";
import { Arguments, Name, UnknownOperation } from "../../operations/operation";
import { isIterable } from "../../async-like";
assertTC39IteratorHelpersObject((...operations: UnknownOperation[]) => {
  return {
    instance(iterable: Iterable<unknown>) {
      let instance = new class extends TC39SyncIteratorHelpers<unknown> {
        *[Symbol.iterator]() {
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
});
console.log("PASS assertTC39IteratorHelpersObject:class");
