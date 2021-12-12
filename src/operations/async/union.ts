import { AsyncOperation } from "../operation";

export function union<R, L>(left: Iterable<L> | AsyncIterable<L>): AsyncOperation<R, AsyncIterable<L | R>> {
  return async function *(right: AsyncIterable<R>): AsyncIterable<L | R> {
    for await (const value of async(left)) {
      yield value;
    }
    for await (const value of async(right)) {
      yield value;
    }

    async function *async<T>(iterable: Iterable<T> | AsyncIterable<T>) {
      yield * iterable;
    }
  };
}
