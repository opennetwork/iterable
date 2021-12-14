import { FilterFn } from "./filter";
import { except } from "./except";
import { hasAny } from "./has-any";
import { Arguments, AsyncOperation, Name, Returns } from "../operation";

export function every<T>(callbackFn: FilterFn<T>) {
  const op = except(callbackFn);
  const any = hasAny();
  const fn: AsyncOperation<T, Promise<boolean>> = async function(iterable) {
    return !(await any(op(iterable)));
  };
  fn[Name] = "every";
  fn[Arguments] = [callbackFn];
  fn[Returns] = true;
  return fn;
}
every[Name] = "every";
every[Returns] = true;
