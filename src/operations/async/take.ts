import { Arguments, AsyncOperation, Name } from "../operation";

export function take<T>(count: number) {
  const fn: AsyncOperation<T, AsyncIterable<T>> = async function *take<T>(iterable: AsyncIterable<T>): AsyncIterable<T> {
    let yielded = 0;
    for await (const value of iterable) {
      yield value;
      yielded += 1;
      if (yielded === count) {
        break;
      }
    }
  };
  fn[Name] = "take";
  fn[Arguments] = [count];
  return fn;
}
take[Name] = "take";
