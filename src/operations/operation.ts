import { InputFunction } from "../engine/context";

export const Name = Symbol.for("iterable/operation/name");
export const Arguments = Symbol.for("iterable/operation/arguments");
export const GetAsync = Symbol.for("iterable/operation/getAsync");
export const AsyncFn = Symbol.for("iterable/operation/asyncFn");

export interface SyncOperation<I, O> extends InputFunction<Iterable<I>, O> {
  [Arguments]?: unknown[];
  [Name]?: string;
  [GetAsync]?: () => AsyncOperation<I, unknown>;
}

export interface AsyncOperation<I, O> extends InputFunction<AsyncIterable<I>, O> {
  [Arguments]?: unknown[];
  [Name]?: string;
}

