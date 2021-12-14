import { assertTC39IteratorHelpersObject } from "./sync";
import { createIterableEngineContext, InputOperationsArray } from "../../engine/context";

assertTC39IteratorHelpersObject((...operations: InputOperationsArray) => createIterableEngineContext(...operations));
console.log("PASS createIterableEngineContext");
