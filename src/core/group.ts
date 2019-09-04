import { AsyncIterableLike, asyncIterator } from "./async-like";

export type GroupFn<T, This, Parent> = (this: This, value: T, parent: Parent) => string;
export type GroupAsyncFn<T, This, Parent> = (this: This, value: T, parent: Parent) => Promise<string> | string;

export function *group<T, This, Parent>(iterable: Iterable<T>, callbackFn: GroupFn<T, This, Parent>, thisValue?: This, parent?: Parent): IterableIterator<IterableIterator<T>> {
  const groups: Record<string, T[]> = {};
  const newGroups: IterableIterator<T>[] = [];

  function getGroup(value: T): string {
    return callbackFn.call(thisValue, value, parent);
  }

  const baseIterator: Iterator<T> = iterable[Symbol.iterator]();

  function *groupIterable(key: string, initialValue: T) {
    yield initialValue;
    function *drainGroup() {
      while (groups[key].length) {
        yield groups[key].shift();
      }
    }
    let done: boolean = false;
    yield* drainGroup();
    do {
      done = doNextValue();
      yield* drainGroup();
    } while (!done);
  }

  function doNextValue(): boolean {
    const next = baseIterator.next();
    if (next.done) {
      return true;
    }
    const nextKey = getGroup(next.value);
    if (groups[nextKey]) {
      groups[nextKey].push(next.value);
    } else {
      groups[nextKey] = [];
      newGroups.push(groupIterable(nextKey, next.value));
    }
    return false;
  }

  let done: boolean = false;
  do {
    done = doNextValue();
    while (newGroups.length) {
      yield newGroups.shift();
    }
  } while (!done);
}

export async function *asyncGroup<T, This, Parent>(iterable: AsyncIterableLike<T>, callbackFn: GroupAsyncFn<T, This, Parent>, thisValue?: This, parent?: Parent): AsyncIterableIterator<AsyncIterableIterator<T>> {
  const groups: Record<string, T[]> = {};
  const newGroups: AsyncIterableIterator<T>[] = [];

  async function getGroup(value: T): Promise<string> {
    return callbackFn.call(thisValue, value, parent);
  }

  const baseIterator: AsyncIterator<T> = asyncIterator(iterable);

  async function *groupIterable(key: string, initialValue: T) {
    yield initialValue;
    let done: boolean;
    function *drainGroup() {
      while (groups[key].length) {
        yield groups[key].shift();
      }
    }
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
    const nextKey = await getGroup(next.value);
    if (groups[nextKey]) {
      groups[nextKey].push(next.value);
    } else {
      groups[nextKey] = [];
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
}
