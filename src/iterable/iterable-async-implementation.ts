import {
  asyncDrain,
  asyncEvery,
  asyncExcept,
  asyncFilter,
  FilterAsyncFn,
  asyncMap,
  MapAsyncFn,
  asyncReduce,
  ReduceAsyncFn,
  asyncSome,
  asyncUnion,
  AsyncIterableLike,
  asyncIterable,
  asyncHasAny,
  asyncRetain,
  arrayRetainer,
  AsyncRetainer,
  Retainer,
  asyncToArray,
  skip,
  asyncMask,
  asyncFlatMap,
  FlatMapAsyncFn,
  asyncMaskReversible,
  take, DistinctEqualAsyncFn, asyncDistinct,
  GroupAsyncFn,
  asyncGroup,
  asyncHooks, ForEachAsyncFn, forEachAsync
} from "../core";
import { ExtendedAsyncIterable } from "./iterable-async";
import { AsyncIterableTuple } from "./iterable-async-tuple";
import { ExtendedIterableAsyncTupleImplementation } from "./iterable-async-tuple-implementation";

export class ExtendedIterableAsyncImplementation<T> implements ExtendedAsyncIterable<T> {

  private readonly iterable: AsyncIterable<T>;

  constructor(iterable: AsyncIterableLike<T>) {
    this.iterable = asyncIterable(iterable);
  }

  drain(): Promise<boolean> {
    return asyncDrain(this);
  }

  every(fn: FilterAsyncFn<T, this, this>): Promise<boolean> {
    return asyncEvery(this, fn, this, this);
  }

  some(fn: FilterAsyncFn<T, this, this>): Promise<boolean> {
    return asyncSome(this, fn, this, this);
  }

  hasAny(): Promise<boolean> {
    return asyncHasAny(this);
  }

  reduce<Accumulator = T>(fn: ReduceAsyncFn<T, this, this, Accumulator>, initialValue?: Accumulator): Promise<Accumulator> {
    return asyncReduce(this, fn, initialValue, this, this);
  }

  retain(retainer: Retainer<T> | AsyncRetainer<T> = arrayRetainer()) {
    return new ExtendedIterableAsyncImplementation(
      asyncRetain(this, retainer)
    );
  }

  map<O>(fn: MapAsyncFn<T, O, this, this>): ExtendedAsyncIterable<O> {
    return new ExtendedIterableAsyncImplementation<O>(
      asyncMap(this, fn, this, this)
    );
  }

  flatMap<O>(fn: FlatMapAsyncFn<T, O, this, this>): ExtendedAsyncIterable<O> {
    return new ExtendedIterableAsyncImplementation<O>(
      asyncFlatMap(this, fn, this, this)
    );
  }

  union<O>(other: AsyncIterableLike<O>): ExtendedAsyncIterable<T | O> {
    return new ExtendedIterableAsyncImplementation(
      asyncUnion(this, other)
    );
  }

  filter(fn: FilterAsyncFn<T, this, this>): ExtendedAsyncIterable<T> {
    return new ExtendedIterableAsyncImplementation(
      asyncFilter(this, fn, this, this)
    );
  }

  except(fn: FilterAsyncFn<T, this, this>): ExtendedAsyncIterable<T> {
    const iterable: AsyncIterable<T> = asyncExcept(this, fn, this, this);
    return new ExtendedIterableAsyncImplementation(iterable);
  }

  toArray() {
    return asyncToArray(this);
  }

  mask(maskIterable: Iterable<boolean>): ExtendedAsyncIterable<T> {
    return new ExtendedIterableAsyncImplementation(asyncMask(this, maskIterable));
  }

  maskReversible(maskIterable: Iterable<boolean>, reverse: boolean = false): ExtendedAsyncIterable<T> {
    return new ExtendedIterableAsyncImplementation(asyncMaskReversible(this, maskIterable, reverse));
  }

  skip(count: number): ExtendedAsyncIterable<T> {
    return this.mask(skip(count));
  }

  take(count: number): ExtendedAsyncIterable<T> {
    return this.maskReversible(take(count), true);
  }

  distinct(equalityFn?: DistinctEqualAsyncFn<T>): ExtendedAsyncIterable<T> {
    return new ExtendedIterableAsyncImplementation(asyncDistinct(this, equalityFn));
  }

  group(fn: GroupAsyncFn<T, this, this>): ExtendedAsyncIterable<ExtendedAsyncIterable<T>> {
    return new ExtendedIterableAsyncImplementation<ExtendedAsyncIterable<T>>(
      asyncMap(
        asyncGroup(this, fn, this, this),
        async iterable => new ExtendedIterableAsyncImplementation<T>(iterable)
      )
    );
  }

  tap(fn: (value: T) => void | Promise<void>): ExtendedAsyncIterable<T> {
    return new ExtendedIterableAsyncImplementation(
      asyncHooks({ preYield: (value: T) => fn(value) })(this)
    );
  }

  forEach(fn: ForEachAsyncFn<T, this, this>): Promise<void> {
    return forEachAsync(this, fn, this, this);
  }

  toTuple<S extends number>(size: S): AsyncIterableTuple<T, S> {
    return new ExtendedIterableAsyncTupleImplementation<T, S>(this, size);
  }

  [Symbol.asyncIterator]() {
    return this.iterable[Symbol.asyncIterator]();
  }

}
