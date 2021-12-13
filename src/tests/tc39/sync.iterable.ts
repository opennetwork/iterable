import { assertTC39IterableHelpersObject } from "./sync";
import { createIterableEngineContext, InputOperationsArray } from "../../engine/context";

assertTC39IterableHelpersObject((...operations: InputOperationsArray) => createIterableEngineContext(...operations));
console.log("PASS createIterableEngineContext");
