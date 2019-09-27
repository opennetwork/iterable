import { filter, asyncFilter, FilterAsyncFn, FilterFn } from "./filter";
import { AsyncIterableLike } from "../async-like";
import { hasAny, asyncHasAny } from "./has-any";

export function some<T, This, Parent>(iterable: Iterable<T>, callbackFn: FilterFn<T, This, Parent>, thisValue?: This, parent?: Parent): boolean {
  const iterableResult = filter(iterable, callbackFn, thisValue, parent);
  return hasAny(iterableResult);
}

export async function asyncSome<T, This, Parent>(iterable: AsyncIterableLike<T>, callbackFn: FilterAsyncFn<T, This, Parent>, thisValue?: This, parent?: Parent): Promise<boolean> {
  const iterableResult = asyncFilter(iterable, callbackFn, thisValue, parent);
  return asyncHasAny(iterableResult);
}
