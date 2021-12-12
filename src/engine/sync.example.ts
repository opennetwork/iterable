import {
  createIterableEngineContext, getNextIterableEngineContext,
  InputOperationsArray,
  IterableEngineContext, iterate, iterateAsync,
  TypedOperationsArray
} from "./context";
import { filter, map } from "../operations/sync";
import * as Async from "../operations/async";

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
  }),
  Async.map(async function asyncMapTwo(value: number) {
    return value * 10;
  }),
  Async.map(function mapThree(value: number) {
    return { value, plus: value + value };
  }),
);

const results = ops.operations[0]([1, 2, 3]);
const next = [...ops.operations[1](results)];
console.log(next);
const async = await Promise.all([...ops.operations[2](next)]);
console.log(async);
const sync = [...ops.operations[3](async)];
console.log(sync);
console.log([...ops.contexts()]);

for (const v of syncOps.iterable( [1, 2, 3])) {
  console.log({ v });
}
const instance = syncOps.instance( [1, 2, 3]);
for (const v of instance) {
  console.log({ v });
}
console.log([...instance]);
console.log(instance, instance.then);
console.log([...(await instance)]);
console.log("Async");
for await (const v of ops.asyncIterable( [1, 2, 3])) {
  console.log({ v });
}
const asyncInstance = ops.instance([1, 2, 3]);
for await (const v of asyncInstance) {
  console.log({ v });
}
console.log([...(await asyncInstance)]);
