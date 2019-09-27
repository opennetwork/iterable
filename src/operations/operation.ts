export interface SyncOperation<I, O> {
  (input: Iterable<I>): O;
}

export interface AsyncOperation<I, O> {
  (input: AsyncIterable<I>): O;
}
