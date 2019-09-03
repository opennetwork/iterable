import {
  MapAsyncFn,
  FlatMapAsyncFn,
  FilterAsyncFn,
  ReduceAsyncFn,
  AsyncIterableLike,
  Retainer,
  AsyncRetainer
} from "../core";

export interface ExtendedAsyncIterable<T> extends AsyncIterable<T> {

  drain(): Promise<boolean>;
  every(fn: FilterAsyncFn<T, this, this>): Promise<boolean>;
  some(fn: FilterAsyncFn<T, this, this>): Promise<boolean>;
  hasAny(): Promise<boolean>;
  reduce<Accumulator = T>(fn: ReduceAsyncFn<T, this, this, Accumulator>, initialValue?: Accumulator): Promise<Accumulator>;
  map<O>(fn: MapAsyncFn<T, O, this, this>): ExtendedAsyncIterable<O>;
  flatMap<O>(fn: FlatMapAsyncFn<T, O, this, this>): ExtendedAsyncIterable<O>;
  union<O>(other: AsyncIterableLike<O>): ExtendedAsyncIterable<T | O>;
  filter(fn: FilterAsyncFn<T, this, this>): ExtendedAsyncIterable<T>;
  except(fn: FilterAsyncFn<T, this, this>): ExtendedAsyncIterable<T>;
  retain(retainer?: Retainer<T> | AsyncRetainer<T>): ExtendedAsyncIterable<T>;
  skip(count: number): ExtendedAsyncIterable<T>;
  take(count: number): ExtendedAsyncIterable<T>;
  mask(maskIterable: AsyncIterableLike<boolean>): ExtendedAsyncIterable<T>;
  maskReversible(maskIterable: AsyncIterableLike<boolean>, reverse?: boolean): ExtendedAsyncIterable<T>;
  toArray(): Promise<T[]>;

}
