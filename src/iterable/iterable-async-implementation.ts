import {
  asyncDrain,
  asyncMap,
  asyncUnion,
  AsyncIterableLike,
  asyncIterable,
  asyncHasAny,
  asyncRetain,
  arrayRetainer,
  AsyncRetainer,
  Retainer,
  skip,
  asyncMask,
  asyncMaskReversible,
  DistinctEqualAsyncFn,
  asyncDistinct,
  GroupAsyncFn,
  asyncGroup,
  asyncHooks,
} from "../core";
import { ExtendedAsyncIterable } from "./iterable-async";
import { AsyncIterableTuple } from "./iterable-async-tuple";
import { IterableTypeReferenceMap } from "./reference-map-type";
import { TC39AsyncIteratorHelpers } from "../tc39/async";

export class ExtendedIterableAsyncImplementation<T> extends TC39AsyncIteratorHelpers<T> implements ExtendedAsyncIterable<T> {

  private readonly iterable: AsyncIterable<T>;

  constructor(iterable: AsyncIterableLike<T>, protected referenceMap: IterableTypeReferenceMap) {
    super();
    this.iterable = asyncIterable(iterable);
  }

  drain(): Promise<boolean> {
    return asyncDrain(this);
  }

  hasAny(): Promise<boolean> {
    return asyncHasAny(this);
  }

  retain(retainer: Retainer<T> | AsyncRetainer<T> = arrayRetainer()) {
    return this.referenceMap.asyncExtendedIterable(
      asyncRetain(this, retainer)
    );
  }

  union<O>(other: AsyncIterableLike<O>): ExtendedAsyncIterable<T | O> {
    return this.referenceMap.asyncExtendedIterable(
      asyncUnion(this, other)
    );
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

  toTuple<S extends number>(size: S): AsyncIterableTuple<T, S> {
    return this.referenceMap.asyncIterableTuple(this, size);
  }

  toIterable() {
    async function *iterable(iterable: AsyncIterable<T>) {
      for await (const value of iterable) {
        yield value;
      }
    }
    return iterable(this.iterable);
  }

  [Symbol.asyncIterator]() {
    return this.iterable[Symbol.asyncIterator]();
  }

}
