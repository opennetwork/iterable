import {
  InputOperationsArray,
  isIterableEngineContext,
  IterableEngineContext,
  UnknownReturnedIterableError
} from "../../engine/context";
import {
  asIndexedPairs,
  drop, every,
  filter, FilterFn, find,
  flatMap,
  forEach, ForEachFn,
  map, MapFn,
  reduce, ReduceFn,
  some,
  take,
  toArray
} from "../../operations/sync";
import { isIterable } from "../../async-like";
import { TC39AsyncIteratorHelpersFn } from "./async";

export interface TC39IterableHelpersObject<T> extends Iterable<T> {
  map?<O>(mapperFn: MapFn<T, O>): TC39IterableHelpersObject<O>;
  filter?(filterFn: FilterFn<T>): TC39IterableHelpersObject<T>;
  take?(limit: number): TC39IterableHelpersObject<T>;
  drop?(limit: number): TC39IterableHelpersObject<T>;
  asIndexedPairs?(): TC39IterableHelpersObject<[number, T]>;
  flatMap?<O>(mapperFn: MapFn<T, Iterable<O>>): TC39IterableHelpersObject<O>;
  reduce?<A>(reduceFn: ReduceFn<T, A>, initial: A): A;
  toArray?(): T[];
  forEach?(callbackFn: ForEachFn<T>): void;
  some?(filterFn: FilterFn<T>): boolean;
  every?(filterFn: FilterFn<T>): boolean;
  find?(filterFn: FilterFn<T>): T | undefined;
}

export function assertTC39IteratorHelpersObject<O extends InputOperationsArray, T>(input: unknown): asserts input is (...operations: O) => Omit<IterableEngineContext<O, never | number>, "instance"> & { instance(): TC39IterableHelpersObject<T> } {

  type HelperFn = <T = unknown, O = unknown, A extends InputOperationsArray<T, O> = InputOperationsArray<T, O>>(...operations: A) => (Omit<IterableEngineContext<A, never | number>, "instance"> & { instance<T>(input: Iterable<T>): TC39IterableHelpersObject<T> });
  function assertFunction(value: unknown): asserts value is HelperFn {
    if (typeof value !== "function") throw new Error();
  }
  assertFunction(input);
  const test: HelperFn = input;

  function* naturals() {
    let i = 0;
    while (true) {
      yield i;
      i += 1;
    }
  }

  const mapNaturalsOps = test(map((value: number) => {
    return value * value;
  }));
  const mapNaturalsResultIterator = mapNaturalsOps.instance(naturals())[Symbol.iterator]();

  ok(mapNaturalsResultIterator.next().value === 0); //  {value: 0, done: false};
  ok(mapNaturalsResultIterator.next().value === 1); //  {value: 1, done: false};
  ok(mapNaturalsResultIterator.next().value === 4); //  {value: 4, done: false};

  const filterNaturalsOps = test(filter((value: number) => {
    return value % 2 == 0;
  }));
  const filterNaturalsResultIterator = filterNaturalsOps.instance(naturals())[Symbol.iterator]();
  ok(filterNaturalsResultIterator.next().value === 0); //  {value: 0, done: false};
  ok(filterNaturalsResultIterator.next().value === 2); //  {value: 2, done: false};
  ok(filterNaturalsResultIterator.next().value === 4); //  {value: 4, done: false};

  const takeNaturalsOps = test(take(3));
  const takeNaturalsResultIterator = takeNaturalsOps.instance(naturals())[Symbol.iterator]();
  ok(takeNaturalsResultIterator.next().value === 0); //  {value: 0, done: false};
  ok(takeNaturalsResultIterator.next().value === 1); //  {value: 1, done: false};
  ok(takeNaturalsResultIterator.next().value === 2); //  {value: 2, done: false};
  const takeNaturalsResultDone = takeNaturalsResultIterator.next(); //  {value: undefined, done: true};
  ok(takeNaturalsResultDone.done === true);
  ok(!takeNaturalsResultDone.value);

  const dropNaturalsOps = test(drop(3));
  const dropNaturalsResultIterator = dropNaturalsOps.instance(naturals())[Symbol.iterator]();
  ok(dropNaturalsResultIterator.next().value === 3); //  {value: 3, done: false};
  ok(dropNaturalsResultIterator.next().value === 4); //  {value: 4, done: false};
  ok(dropNaturalsResultIterator.next().value === 5); //  {value: 5, done: false};

  const asIndexedPairsOps = test(asIndexedPairs());
  const asIndexedPairsResult = [...asIndexedPairsOps.instance(["a", "b", "c"])];
  ok(asIndexedPairsResult.length === 3);
  ok(Array.isArray(asIndexedPairsResult[0]));
  ok(asIndexedPairsResult[0][0] === 0);
  ok(asIndexedPairsResult[0][1] === "a");
  ok(Array.isArray(asIndexedPairsResult[1]));
  ok(asIndexedPairsResult[1][0] === 1);
  ok(asIndexedPairsResult[1][1] === "b");
  ok(Array.isArray(asIndexedPairsResult[2]));
  ok(asIndexedPairsResult[2][0] === 2);
  ok(asIndexedPairsResult[2][1] === "c");

  const flatMapOps = test(flatMap((value: string) => value.split(" ")));
  const flatMapResultIterator = flatMapOps.instance(["It's Sunny in", "", "California"])[Symbol.iterator]();
  ok(flatMapResultIterator.next().value === "It's"); //  {value: "It's", done: false};
  ok(flatMapResultIterator.next().value === "Sunny"); //  {value: "Sunny", done: false};
  ok(flatMapResultIterator.next().value === "in"); //  {value: "in", done: false};
  ok(flatMapResultIterator.next().value === ""); //  {value: "", done: false};
  ok(flatMapResultIterator.next().value === "California"); //  {value: "California", done: false};
  const flatMapResultDone = flatMapResultIterator.next(); //  {value: undefined, done: true};
  ok(flatMapResultDone.done === true);
  ok(!flatMapResultDone.value);

  const reduceNaturalsOps = test(take(5), reduce((sum: number, value: number) => {
    return sum + value;
  }, 3));
  const reduceNaturalsResultIterable = reduceNaturalsOps.instance(naturals());
  const reduceNaturalsResult = getThrownResult(reduceNaturalsResultIterable);
  ok(reduceNaturalsResult === 13);

  const naturalsArrayOps = test(take(5), toArray());
  // toArray is an Iterable so is seen as a valid operation result
  const naturalsArrayResult = [...naturalsArrayOps.instance(naturals())];
  ok(Array.isArray(naturalsArrayResult));
  ok(naturalsArrayResult.length === 5);
  ok(naturalsArrayResult[0] === 0);
  ok(naturalsArrayResult[1] === 1);
  ok(naturalsArrayResult[2] === 2);
  ok(naturalsArrayResult[3] === 3);
  ok(naturalsArrayResult[4] === 4);
  const naturalsArrayResultIterator = naturalsArrayOps.instance(naturals())[Symbol.iterator]();
  const naturalsArrayResult0 = naturalsArrayResultIterator.next();
  ok(naturalsArrayResult0.value === 0);
  const naturalsArrayResult1 = naturalsArrayResultIterator.next();
  ok(naturalsArrayResult1.value === 1);
  const naturalsArrayResult2 = naturalsArrayResultIterator.next();
  ok(naturalsArrayResult2.value === 2);
  const naturalsArrayResult3 = naturalsArrayResultIterator.next();
  ok(naturalsArrayResult3.value === 3);
  const naturalsArrayResult4 = naturalsArrayResultIterator.next();
  ok(naturalsArrayResult4.value === 4);
  const naturalsArrayResultDone = naturalsArrayResultIterator.next();
  ok(naturalsArrayResultDone.done);

  const forEachLog: unknown[] = [];
  const forEachOps = test<number>(drop(1), take(3), forEach((value) => forEachLog.push(value)));
  getThrownResult(forEachOps.instance(naturals()));
  ok(forEachLog.join(", ") === "1, 2, 3"); // "1, 2, 3"

  const someOps = test<number>(take(4), some(v => v > 1));
  ok(getThrownResult(someOps.instance(naturals())) === true);
  const someOpsOneTrue = test(take(4), some(v => v === 1));
  ok(getThrownResult(someOpsOneTrue.instance(naturals())) === true);

  const everyOverOps = test<number>(drop(1), take(4), every(v => v > 1));
  ok(getThrownResult(everyOverOps.instance(naturals())) === false); // false, first value is 1
  const everyOverEqualOps = test<number>(drop(1), take(4), every(v => v >= 1));
  ok(getThrownResult(everyOverEqualOps.instance(naturals())) === true);

  const findOps = test<number>(find((value: number) => value > 1));
  ok(getThrownResult(findOps.instance(naturals())) === 2);

  function getThrownResult(iterable: unknown) {
    if (!isIterable(iterable)) return iterable;
    try {
      return void [...iterable];
    } catch (error) {
      if (error instanceof UnknownReturnedIterableError) {
        return error.value;
      }
      throw error;
    }
  }

  function ok(value: unknown, message?: string): asserts value {
    if (!value) {
      throw new Error(message);
    }
  }
}
