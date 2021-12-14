import { filter, FilterFn } from "./filter";
import { Arguments, AsyncOperation, Name, Returns } from "../operation";

export function find<T>(callbackFn: FilterFn<T>) {
  const op = filter(callbackFn);
  const fn: AsyncOperation<T, Promise<T | undefined>> = async function (iterable: AsyncIterable<T>): Promise<T | undefined> {
    const iterator = op(iterable)[Symbol.asyncIterator]();
    const result = await iterator.next();
    await iterator.return?.();
    return result.value;
  };
  fn[Name] = "find";
  fn[Arguments] = [callbackFn];
  fn[Returns] = true;
  return fn;
}
find[Name] = "find";
find[Returns] = true;
