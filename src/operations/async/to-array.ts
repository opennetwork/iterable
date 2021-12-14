import { Arguments, AsyncOperation, Name, Returns } from "../operation";

export function toArray<T>() {
  const fn: AsyncOperation<T, Promise<T[]>> = async function(iterable) {
    const values: T[] = [];
    for await (const value of iterable) {
      values.push(value);
    }
    return values;
  };
  fn[Name] = "toArray";
  fn[Arguments] = [];
  fn[Returns] = true;
  return fn;
}
toArray[Name] = "toArray";
toArray[Returns] = true;
