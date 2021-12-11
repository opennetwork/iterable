import { AsyncOperation } from "../operation";

export function hasAny(): AsyncOperation<unknown, Promise<boolean>> {
  return async function(iterable) {
    const iterator = iterable[Symbol.asyncIterator]();
    const result = await iterator.next();
    return !result.done;
  };
}
