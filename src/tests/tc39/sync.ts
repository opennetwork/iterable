import {
  InputOperationsArray,
  isIterableEngineContext,
  IterableEngineContext,
  UnknownReturnedIterableError
} from "../../engine/context";
import { asIndexedPairs, drop, filter, flatMap, forEach, map, reduce, take, toArray } from "../../operations/sync";

export interface IterableHelpersObject<T> extends Iterable<T> {

}

export function assertTC39IterableHelpersObject<O extends InputOperationsArray, T>(test: unknown): asserts test is (...operations: O) => Omit<IterableEngineContext<O, never | number>, "instance"> & { instance(): IterableHelpersObject<T> } {

  function assertFunction(value: unknown): asserts value is (...operations: unknown[]) => Omit<IterableEngineContext<unknown[], never | number>, "instance"> & { instance<T>(input: Iterable<T>): IterableHelpersObject<T> } {
    if (typeof test !== "function") throw new Error();
  }
  assertFunction(test);

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

  const forEachLog: unknown[] = [];
  const forEachOps = test(drop(1), take(3), forEach((value) => forEachLog.push(value)));
  getThrownResult(forEachOps.instance(naturals()));
  ok(forEachLog.join(", ") === "1, 2, 3"); // "1, 2, 3"

  function getThrownResult(iterable: Iterable<unknown>) {
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
