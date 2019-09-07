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
  take,
  DistinctEqualAsyncFn,
  asyncDistinct,
  GroupAsyncFn,
  asyncGroup,
  asyncHooks,
  ForEachAsyncFn,
  forEachAsync
} from "../core";
import { ExtendedAsyncIterable } from "./iterable-async";
import { AsyncIterableTuple } from "./iterable-async-tuple";
import { IterableTypeReferenceMap } from "./reference-map-type";

export class ExtendedIterableAsyncImplementation<T> implements ExtendedAsyncIterable<T> {

  private readonly iterable: AsyncIterable<T>;

  constructor(iterable: AsyncIterableLike<T>, protected referenceMap: IterableTypeReferenceMap) {
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
    return this.referenceMap.asyncExtendedIterable(
      asyncRetain(this, retainer)
    );
  }

  map<O>(fn: MapAsyncFn<T, O, this, this>): ExtendedAsyncIterable<O> {
    return this.referenceMap.asyncExtendedIterable(
      asyncMap(this, fn, this, this)
    );
  }

  flatMap<O>(fn: FlatMapAsyncFn<T, O, this, this>): ExtendedAsyncIterable<O> {
    return this.referenceMap.asyncExtendedIterable(
      asyncFlatMap(this, fn, this, this)
    );
  }

  union<O>(other: AsyncIterableLike<O>): ExtendedAsyncIterable<T | O> {
    return this.referenceMap.asyncExtendedIterable(
      asyncUnion(this, other)
    );
  }

  filter(fn: FilterAsyncFn<T, this, this>): ExtendedAsyncIterable<T> {
    return this.referenceMap.asyncExtendedIterable(
      asyncFilter(this, fn, this, this)
    );
  }

  except(fn: FilterAsyncFn<T, this, this>): ExtendedAsyncIterable<T> {
    const iterable: AsyncIterable<T> = asyncExcept(this, fn, this, this);
    return this.referenceMap.asyncExtendedIterable(iterable);
  }

  toArray() {
    return asyncToArray(this);
  }

  mask(maskIterable: Iterable<boolean>): ExtendedAsyncIterable<T> {
    return this.referenceMap.asyncExtendedIterable(asyncMask(this, maskIterable));
  }

  maskReversible(maskIterable: Iterable<boolean>, reverse: boolean = false): ExtendedAsyncIterable<T> {
    return this.referenceMap.asyncExtendedIterable(asyncMaskReversible(this, maskIterable, reverse));
  }

  skip(count: number): ExtendedAsyncIterable<T> {
    return this.mask(skip(count));
  }

  take(count: number): ExtendedAsyncIterable<T> {
    return this.maskReversible(take(count), true);
  }

  distinct(equalityFn?: DistinctEqualAsyncFn<T>): ExtendedAsyncIterable<T> {
    return this.referenceMap.asyncExtendedIterable(asyncDistinct(this, equalityFn));
  }

  group(fn: GroupAsyncFn<T, this, this>): ExtendedAsyncIterable<ExtendedAsyncIterable<T>> {
    return this.referenceMap.asyncExtendedIterable(
      asyncMap(
        asyncGroup(this, fn, this, this),
        async iterable => this.referenceMap.asyncExtendedIterable(iterable)
      )
    );
  }

  tap(fn: (value: T) => void | Promise<void>): ExtendedAsyncIterable<T> {
    return this.referenceMap.asyncExtendedIterable(
      asyncHooks({ preYield: (value: T) => fn(value) })(this)
    );
  }

  forEach(fn: ForEachAsyncFn<T, this, this>): Promise<void> {
    return forEachAsync(this, fn, this, this);
  }

  toTuple<S extends number>(size: S): AsyncIterableTuple<T, S> {
    return this.referenceMap.asyncIterableTuple(this, size);
  }

  [Symbol.asyncIterator]() {
    return this.iterable[Symbol.asyncIterator]();
  }

}
