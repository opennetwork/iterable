import { AsyncOperation, SyncOperation } from "../operation";

export type GroupFn<T> = (value: T) => unknown;

export function group<T, This, Parent>(callbackFn: GroupFn<T>): AsyncOperation<T, AsyncIterable<AsyncIterable<T>>> {
  // TODO investigate
  return async function *(iterable) {
    const groups = new Map<unknown, T[]>();
    const newGroups: AsyncIterable<T>[] = [];

    const baseIterator: AsyncIterator<T> = iterable[Symbol.asyncIterator]();

    async function *groupIterable(key: unknown, initialValue: T) {
      yield initialValue;
      function *drainGroup() {
        let next;
        while ((next = groups.get(key)) && next.length) {
          yield next.shift();
        }
      }
      let done: boolean = false;
      yield* drainGroup();
      do {
        done = await doNextValue();
        yield* drainGroup();
      } while (!done);
    }

    async function doNextValue(): Promise<boolean> {
      const next = await baseIterator.next();
      if (next.done) {
        return true;
      }
      const nextKey = callbackFn(next.value);
      if (groups.has(nextKey)) {
        groups.get(nextKey).push(next.value);
      } else {
        groups.set(nextKey, []);
        newGroups.push(groupIterable(nextKey, next.value));
      }
      return false;
    }

    let done: boolean = false;
    do {
      done = await doNextValue();
      while (newGroups.length) {
        yield newGroups.shift();
      }
    } while (!done);
  };
}
