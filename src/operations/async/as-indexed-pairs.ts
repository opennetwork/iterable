import { Arguments, AsyncOperation, Name } from "../operation";

export function asIndexedPairs<T>() {
  const fn: AsyncOperation<T, AsyncIterable<[number, T]>> = async function *asIndexedPairs<T>(iterable: AsyncIterable<T>): AsyncIterable<[number, T]> {
    let index = -1;
    for await (const value of iterable) {
      index += 1;
      yield [index, value];
    }
  };
  fn[Name] = "asIndexedPairs";
  fn[Arguments] = [];
  return fn;
}
asIndexedPairs[Name] = "asIndexedPairs";
