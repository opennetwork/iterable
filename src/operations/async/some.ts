import { filter, FilterFn } from "./filter";
import { hasAny } from "./has-any";
import { Arguments, AsyncOperation, Name } from "../operation";

export function some<T>(callbackFn: FilterFn<T>) {
  const op = filter(callbackFn);
  const any = hasAny();
  const fn: AsyncOperation<T, Promise<boolean>> = async function(iterable) {
    return any(op(iterable));
  };
  fn[Name] = "some";
  fn[Arguments] = [callbackFn];
  return fn;
}
some[Name] = "some";
