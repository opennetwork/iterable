import { InputFunction } from "../engine/context";

export const Name = Symbol.for("iterable/operation/name");
export const Returns = Symbol.for("iterable/operation/returns");
export const Arguments = Symbol.for("iterable/operation/arguments");
export const GetAsync = Symbol.for("iterable/operation/getAsync");
export const AsyncFn = Symbol.for("iterable/operation/asyncFn");
export const Operations = Symbol.for("iterable/operation/operations");
export const Internal = Symbol.for("iterable/operation/internal");

export interface SyncOperation<I, O> extends InputFunction<Iterable<I>, O> {
  [Arguments]?: unknown[];
  [Name]?: string;
  [GetAsync]?: () => AsyncOperation<I, unknown>;
  [Returns]?: boolean;
  [Internal]?: boolean;
}

export interface AsyncOperation<I, O> extends InputFunction<AsyncIterable<I>, O> {
  [Arguments]?: unknown[];
  [Name]?: string;
  [Returns]?: boolean;
  [Internal]?: boolean;
}

export type Operation<I, O> = SyncOperation<I, O> | AsyncOperation<I, O>;
export type UnknownOperation = Partial<Operation<unknown, unknown>> & ((...args: unknown[]) => unknown);
