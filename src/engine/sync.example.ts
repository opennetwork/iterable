import {
  createIterableEngineContext, getNextIterableEngineContext,
  InputOperationsArray,
  IterableEngineContext, iterate, iterateAsync,
  TypedOperationsArray
} from "./context";
import { filter, map } from "../operations/sync";

const syncOps = createIterableEngineContext(
  filter<unknown, number>(function filter(value: unknown): value is number {
    return typeof value === "number";
  }),
  map(function syncMapOne(value: number) {
    return value + 1;
  }),
  map(function syncMapTwo(value: number) {
    return value + 1;
  }),
  filter(function filter(value: number): value is number {
    return value >= 4;
  })
);
const ops = createIterableEngineContext(
  filter<unknown, number>(function filter(value: unknown): value is number {
    return typeof value === "number";
  }),
  map(function syncMap(value: number) {
    return value + 1;
  }),
  map(async function asyncMap(value: number) {
    return value + 1;
  }),
  filter(function filter(value: number): value is number {
    return value >= 4;
  })
);

const results = ops.operations[0]([1, 2, 3]);
const next = [...ops.operations[1](results)];
console.log(next);
const async = await Promise.all([...ops.operations[2](next)]);
console.log(async);
const sync = [...ops.operations[3](async)];
console.log(sync);

console.log([...ops]);

const first = getNextIterableEngineContext(ops);
const second = getNextIterableEngineContext(first);
const third = getNextIterableEngineContext(second);
const last = getNextIterableEngineContext(third);

console.log([...third.operation([1, 2, 3])]);

// console.log([...iterate(syncOps, [1, 2, 3])]);
console.log("Async");
// console.log([...iterate(ops, [1, 2, 3])]);
for await (const v of iterateAsync(ops, [1, 2, 3])) {
  console.log(v);
}
