import { filter, FilterFn } from "./filter";
import { hasAny } from "./has-any";
import { SyncOperation } from "../operation";

export function some<T>(callbackFn: FilterFn<T>): SyncOperation<T, boolean> {
  const filterOp = filter(callbackFn);
  const hasAnyOp = hasAny();
  return function(iterable) {
    const filtered = filterOp(iterable);
    return hasAnyOp(filtered);
  };
}
