import { FilterFn, filterNegatable } from "./filter";
import { Arguments, AsyncOperation, Name } from "../operation";

export function except<T>(callbackFn: FilterFn<T>): AsyncOperation<T, AsyncIterable<T>> {
  const fn = filterNegatable(callbackFn, true);
  fn[Name] = "except";
  fn[Arguments] = [callbackFn];
  return fn;
}
except[Name] = "except";
