export function *union<L>(left: Iterable<L>) {
  return function *<R>(right: Iterable<R>): IterableIterator<L | R> {
    for (const value of left) {
      yield value;
    }
    for (const value of right) {
      yield value;
    }
  };
}
