import { AssertAsyncTC39IteratorHelpersFn, assertAsyncTC39IteratorHelpersObject } from "./async";
import { createIterableEngineContext, InputOperationsArray, IterableEngineContext } from "../../engine/context";

const test = (...operations: InputOperationsArray): IterableEngineContext<InputOperationsArray, never | number> => createIterableEngineContext(...operations);
const fn: AssertAsyncTC39IteratorHelpersFn = await assertAsyncTC39IteratorHelpersObject<InputOperationsArray, unknown>(test);
fn(test);
console.log("PASS assertAsyncTC39IteratorHelpersObject:createIterableEngineContext");
