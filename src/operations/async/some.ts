import { filter, FilterFn } from "./filter";
import { hasAny } from "./has-any";
import { AsyncOperation } from "../operation";

export function some<T>(callbackFn: FilterFn<T>): AsyncOperation<T, Promise<boolean>> {
  const op = filter(callbackFn);
  const any = hasAny();
  return async function(iterable) {
    return any(op(iterable));
  };
}
