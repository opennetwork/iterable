import { FilterFn, filterNegatable } from "./filter";

export function except<T>(callbackFn: FilterFn<T>) {
  return filterNegatable(callbackFn, true);
}
