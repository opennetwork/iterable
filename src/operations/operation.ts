import { InputFunction } from "../engine/context";

export interface SyncOperation<I, O> extends InputFunction<Iterable<I>, O> {

}

export interface AsyncOperation<I, O> extends InputFunction<AsyncIterable<I>, O> {

}
