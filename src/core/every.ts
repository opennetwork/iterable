import { FilterAsyncFn, FilterFn } from "./filter";
import { AsyncIterableLike } from "./async-like";
import { except, asyncExcept } from "./except";
import { asyncHasAny, hasAny } from "./has-any";

export function every<T, This, Parent>(iterable: Iterable<T>, callbackFn: FilterFn<T, This, Parent>, thisValue?: This, parent?: Parent): boolean {
  const iterableResult = except(iterable, callbackFn, thisValue, parent);
  return !hasAny(iterableResult);
}

export async function asyncEvery<T, This, Parent>(iterable: AsyncIterableLike<T>, callbackFn: FilterAsyncFn<T, This, Parent>, thisValue?: This, parent?: Parent): Promise<boolean> {
  const iterableResult = asyncExcept(iterable, callbackFn, thisValue, parent);
  return !await asyncHasAny(iterableResult);
}
