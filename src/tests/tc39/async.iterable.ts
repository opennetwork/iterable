import { AssertTC39AsyncIteratorHelpersFn, assertTC39AsyncIteratorHelpersObject } from "./async";
import { createIterableEngineContext, InputOperationsArray, IterableEngineContext } from "../../engine/context";

const test = (...operations: InputOperationsArray): IterableEngineContext<InputOperationsArray, never | number> => createIterableEngineContext(...operations);
const fn: AssertTC39AsyncIteratorHelpersFn = await assertTC39AsyncIteratorHelpersObject<InputOperationsArray, unknown>(test);
fn(test);
console.log("PASS assertAsyncTC39IteratorHelpersObject:createIterableEngineContext");
