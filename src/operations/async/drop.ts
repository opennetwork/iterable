import { Arguments, AsyncOperation, Name } from "../operation";

export function drop<T>(count: number) {
  const fn: AsyncOperation<T, AsyncIterable<T>> = async function *drop<T>(iterable: AsyncIterable<T>): AsyncIterable<T> {
    let dropped = 0;
    for await (const value of iterable) {
      if (dropped === count) {
        yield value;
      } else {
        dropped += 1;
      }
    }
  };
  fn[Name] = "drop";
  fn[Arguments] = [count];
  return fn;
}
drop[Name] = "drop";
