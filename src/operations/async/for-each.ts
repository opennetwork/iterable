import { Arguments, AsyncOperation, Name, Returns } from "../operation";

export type ForEachFn<T> = (value: T) => void | Promise<void> | unknown;

export function forEach<T>(callbackFn: ForEachFn<T>) {
  const fn: AsyncOperation<T, Promise<void>> = async function(iterable) {
    for await (const value of iterable) {
      await callbackFn(value);
    }
  };
  fn[Name] = "forEach";
  fn[Arguments] = [callbackFn];
  fn[Returns] = true;
  return fn;
}
forEach[Name] = "forEach";
forEach[Returns] = true;
