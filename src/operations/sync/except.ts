import { FilterFn, filterNegatable } from "./filter";
import { Arguments, AsyncFn, GetAsync, Name } from "../operation";
import * as Async from "../async";

export function except<T>(callbackFn: FilterFn<T>) {
  const fn = filterNegatable(callbackFn, true);
  fn[Name] = "except";
  fn[GetAsync] = () => Async.except(callbackFn);
  fn[Arguments] = [callbackFn];
  return fn;
}
except[Name] = "except";
except[AsyncFn] = Async.except;
