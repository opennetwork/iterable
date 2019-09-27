export interface LinkedListValue<T> {
  value: T;
  next?: object;
}

export interface LinkedList<T> {
  delete(index: object): boolean;
  get(index: object): LinkedListValue<T>;
  splice(index: object, deleteCount: number, ...insert: (Iterable<T> | T)[]): void;
  clear(): void;
}

function isLinkedListLikeLike(value: object): value is { delete?: unknown, get?: unknown, splice?: unknown, clear?: unknown } {
  return !!value;
}

export function isLinkedListLike(value: object): value is LinkedList<unknown> {
  return (
    isLinkedListLikeLike(value) &&
    typeof value.delete === "function" &&
    typeof value.get === "function" &&
    typeof value.splice === "function" &&
    typeof value.clear === "function"
  );
}
