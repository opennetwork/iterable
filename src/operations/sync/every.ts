import { FilterFn } from "./filter";
import { except } from "./except";
import { hasAny } from "./has-any";
import { SyncOperation } from "../operation";

export function every<T>(callbackFn: FilterFn<T>): SyncOperation<T, boolean> {
  const op = except(callbackFn);
  const anyOp = hasAny();
  return function(iterable) {
    const iterableResult = op(iterable);
    return !anyOp(iterableResult);
  };
}
