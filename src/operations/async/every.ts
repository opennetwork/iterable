import { FilterFn } from "./filter";
import { except } from "./except";
import { hasAny } from "./has-any";
import { AsyncOperation } from "../operation";

export function every<T>(callbackFn: FilterFn<T>): AsyncOperation<T, Promise<boolean>> {
  const op = except(callbackFn);
  const any = hasAny();
  return async function(iterable) {
    return !(await any(op(iterable)));
  };
}
