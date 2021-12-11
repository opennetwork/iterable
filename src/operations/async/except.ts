import { FilterFn, filterNegatable } from "./filter";
import { AsyncOperation } from "../operation";

export function except<T>(callbackFn: FilterFn<T>): AsyncOperation<T, AsyncIterable<T>> {
  return filterNegatable(callbackFn);
}
