import { arrayRetainer, retain } from "../../retain";

export function view() {
  return function <T>(iterable: Iterable<T>): Iterable<Iterable<T>> {
    return {
      [Symbol.iterator]: () => {
        const baseIterable: Iterable<T> = retain(iterable, arrayRetainer());
        return {
          next() {
            return { done: false, value: baseIterable };
          }
        };
      }
    };
  };
}
