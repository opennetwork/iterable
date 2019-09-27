import { FilterAsyncFn, FilterFn, asyncFilterNegatable, filterNegatable } from "./filter";
import { AsyncIterableLike } from "../async-like";

export function except<T, This, Parent>(iterable: Iterable<T>, callbackFn: FilterFn<T, This, Parent>, thisValue?: This, parent?: Parent): Iterable<T> {
  return filterNegatable(iterable, callbackFn, true, thisValue, parent);
}

export function asyncExcept<T, This, Parent>(iterable: AsyncIterableLike<T>, callbackFn: FilterAsyncFn<T, This, Parent>, thisValue?: This, parent?: Parent): AsyncIterable<T> {
  return asyncFilterNegatable(iterable, callbackFn, true, thisValue, parent);
}
