import { filter, FilterFn } from "./filter";
import { AsyncOperation } from "../operation";

export function find<T>(callbackFn: FilterFn<T>): AsyncOperation<T, Promise<T | undefined>> {
  const op = filter(callbackFn);
  return async function (iterable: AsyncIterable<T>): Promise<T | undefined> {
    const iterator = op(iterable)[Symbol.asyncIterator]();
    const result = await iterator.next();
    await iterator.return?.();
    return result.value;
  };
}
