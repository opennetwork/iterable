import {
  asIndexedPairs,
  drop,
  every,
  filter,
  FilterFn,
  find,
  flatMap,
  forEach,
  ForEachFn,
  map,
  MapFn,
  reduce,
  ReduceFn,
  some,
  take,
  toArray
} from "../../operations/async";
import { InputOperationsArray, IterableEngineContext, UnknownReturnedIterableError } from "../../engine/context";
import { isAsyncIterable, isIterable } from "../../async-like";

export interface TC39AsyncIterableHelpersObject<T> extends AsyncIterable<T> {
  map?<O>(mapperFn: MapFn<T, O>): TC39AsyncIterableHelpersObject<O>;
  filter?(filterFn: FilterFn<T>): TC39AsyncIterableHelpersObject<T>;
  take?(limit: number): TC39AsyncIterableHelpersObject<T>;
  drop?(limit: number): TC39AsyncIterableHelpersObject<T>;
  asIndexedPairs?(): TC39AsyncIterableHelpersObject<[number, T]>;
  flatMap?<O>(mapperFn: MapFn<T, Iterable<O>>): TC39AsyncIterableHelpersObject<O>;
  reduce?<A>(reduceFn: ReduceFn<T, A>, initial: A): Promise<A>;
  toArray?(): Promise<T[]>;
  forEach?(callbackFn: ForEachFn<T>): Promise<void>;
  some?(filterFn: FilterFn<T>): Promise<boolean>;
  every?(filterFn: FilterFn<T>): Promise<boolean>;
  find?(filterFn: FilterFn<T>): Promise<T | undefined>;
}

export interface TC39AsyncIteratorHelpersFn<O extends InputOperationsArray, T> {
  (...operations: O): Omit<IterableEngineContext<O, never | number>, "instance"> & { instance(input: AsyncIterable<T> | Iterable<T>): TC39AsyncIterableHelpersObject<T> };
}

export interface AssertTC39AsyncIteratorHelpersFn<O extends InputOperationsArray = InputOperationsArray, T = unknown> {
  (test: unknown): asserts test is TC39AsyncIteratorHelpersFn<O, T>;
}

export async function assertTC39AsyncIteratorHelpersObject<O extends InputOperationsArray, T>(test: unknown): Promise<AssertTC39AsyncIteratorHelpersFn<O, T>> {
  let error: unknown;
  try {
    function assertFunction(value: unknown): asserts value is (...operations: unknown[]) => ReturnType<TC39AsyncIteratorHelpersFn<O, unknown>> {
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
    const mapNaturalsResultIterator = mapNaturalsOps.instance(naturals())[Symbol.asyncIterator]();

    ok((await mapNaturalsResultIterator.next()).value === 0); //  {value: 0, done: false};
    ok((await mapNaturalsResultIterator.next()).value === 1); //  {value: 1, done: false};
    ok((await mapNaturalsResultIterator.next()).value === 4); //  {value: 4, done: false};

    const filterNaturalsOps = test(filter((value: number) => {
      return value % 2 == 0;
    }));
    const filterNaturalsResultIterator = filterNaturalsOps.instance(naturals())[Symbol.asyncIterator]();
    ok((await filterNaturalsResultIterator.next()).value === 0); //  {value: 0, done: false};
    ok((await filterNaturalsResultIterator.next()).value === 2); //  {value: 2, done: false};
    ok((await filterNaturalsResultIterator.next()).value === 4); //  {value: 4, done: false};

    const takeNaturalsOps = test(take(3));
    const takeNaturalsResultIterator = takeNaturalsOps.instance(naturals())[Symbol.asyncIterator]();
    ok((await takeNaturalsResultIterator.next()).value === 0); //  {value: 0, done: false};
    ok((await takeNaturalsResultIterator.next()).value === 1); //  {value: 1, done: false};
    ok((await takeNaturalsResultIterator.next()).value === 2); //  {value: 2, done: false};
    const takeNaturalsResultDone = await takeNaturalsResultIterator.next(); //  {value: undefined, done: true};
    ok(takeNaturalsResultDone.done === true);
    ok(!takeNaturalsResultDone.value);

    const dropNaturalsOps = test(drop(3));
    const dropNaturalsResultIterator = dropNaturalsOps.instance(naturals())[Symbol.asyncIterator]();
    ok((await dropNaturalsResultIterator.next()).value === 3); //  {value: 3, done: false};
    ok((await dropNaturalsResultIterator.next()).value === 4); //  {value: 4, done: false};
    ok((await dropNaturalsResultIterator.next()).value === 5); //  {value: 5, done: false};

    const asIndexedPairsOps = test(asIndexedPairs());
    const asIndexedPairsResultIterator = asIndexedPairsOps.instance(["a", "b", "c"])[Symbol.asyncIterator]();
    const asIndexedPairsResult0 = await asIndexedPairsResultIterator.next();
    ok(Array.isArray(asIndexedPairsResult0.value));
    ok(asIndexedPairsResult0.value[0] === 0);
    ok(asIndexedPairsResult0.value[1] === "a");
    const asIndexedPairsResult1 = await asIndexedPairsResultIterator.next();
    ok(Array.isArray(asIndexedPairsResult1.value));
    ok(asIndexedPairsResult1.value[0] === 1);
    ok(asIndexedPairsResult1.value[1] === "b");
    const asIndexedPairsResult2 = await asIndexedPairsResultIterator.next();
    ok(Array.isArray(asIndexedPairsResult2.value));
    ok(asIndexedPairsResult2.value[0] === 2);
    ok(asIndexedPairsResult2.value[1] === "c");

    const flatMapOps = test(flatMap((value: string) => value.split(" ")));
    const flatMapResultIterator = flatMapOps.instance(["It's Sunny in", "", "California"])[Symbol.asyncIterator]();
    ok((await flatMapResultIterator.next()).value === "It's"); //  {value: "It's", done: false};
    ok((await flatMapResultIterator.next()).value === "Sunny"); //  {value: "Sunny", done: false};
    ok((await flatMapResultIterator.next()).value === "in"); //  {value: "in", done: false};
    ok((await flatMapResultIterator.next()).value === ""); //  {value: "", done: false};
    ok((await flatMapResultIterator.next()).value === "California"); //  {value: "California", done: false};
    const flatMapResultDone = await flatMapResultIterator.next(); //  {value: undefined, done: true};
    ok(flatMapResultDone.done === true);
    ok(!flatMapResultDone.value);

    const reduceNaturalsOps = test(take(5), reduce((sum: number, value: number) => {
      return sum + value;
    }, 3));
    const reduceNaturalsResultIterable = reduceNaturalsOps.instance(naturals());
    const reduceNaturalsResult = await getThrownResult(reduceNaturalsResultIterable);
    ok(reduceNaturalsResult === 13);

    const naturalsArrayOps = test(take(5), toArray());
    // toArray is an Iterable so is seen as a valid operation result
    const naturalsArrayResult = await naturalsArrayOps.instance(naturals());
    const naturalsArrayResultIterator = isIterable(naturalsArrayResult) ?
      naturalsArrayResult[Symbol.iterator]() : naturalsArrayResult[Symbol.asyncIterator]();
    const naturalsArrayResult0 = await naturalsArrayResultIterator.next();
    ok(naturalsArrayResult0.value === 0);
    const naturalsArrayResult1 = await naturalsArrayResultIterator.next();
    ok(naturalsArrayResult1.value === 1);
    const naturalsArrayResult2 = await naturalsArrayResultIterator.next();
    ok(naturalsArrayResult2.value === 2);
    const naturalsArrayResult3 = await naturalsArrayResultIterator.next();
    ok(naturalsArrayResult3.value === 3);
    const naturalsArrayResult4 = await naturalsArrayResultIterator.next();
    ok(naturalsArrayResult4.value === 4);
    const naturalsArrayResultDone = await naturalsArrayResultIterator.next();
    ok(naturalsArrayResultDone.done);

    const forEachLog: unknown[] = [];
    const forEachOps = test(drop(1), take(3), forEach((value) => forEachLog.push(value)));
    await getThrownResult(forEachOps.instance(naturals()));
    ok(forEachLog.join(", ") === "1, 2, 3"); // "1, 2, 3"

    const someOps = test(take(4), some(v => v > 1));
    ok((await getThrownResult(someOps.instance(naturals()))) === true);
    const someOpsOneTrue = test(take(4), some(v => v === 1));
    ok((await getThrownResult(someOpsOneTrue.instance(naturals()))) === true);

    const everyOverOps = test(drop(1), take(4), every(v => v > 1));
    ok(await getThrownResult(everyOverOps.instance(naturals())) === false); // false, first value is 1
    const everyOverEqualOps = test(drop(1), take(4), every(v => v >= 1));
    ok(await getThrownResult(everyOverEqualOps.instance(naturals())) === true);

    const findOps = test(find((value: number) => value > 1));
    ok(await getThrownResult(findOps.instance(naturals())) === 2);
  } catch (caught) {
    error = caught;
  }

  return (inner: unknown) => {
    if (inner !== test) throw new Error("Unexpected value");
    if (error) throw error;
  };

  async function getThrownResult(iterable: unknown) {
    if (!isAsyncIterable(iterable)) return iterable;
    try {
      let value;
      for await (value of iterable) { }
      return void value;
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
