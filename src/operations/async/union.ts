import { AsyncOperation } from "../operation";

export function union<R, L>(left: AsyncIterable<L>): AsyncOperation<R, AsyncIterable<L | R>> {
  return async function *(right: AsyncIterable<R>): AsyncIterable<L | R> {
    for await (const value of left) {
      yield value;
    }
    for await (const value of right) {
      yield value;
    }
  };
}
