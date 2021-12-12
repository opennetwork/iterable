import { AsyncOperation } from "../operation";

export class ExpectedAsyncOperationError extends Error {
  constructor(public operation: AsyncOperation<unknown, unknown>) {
    super();
  }
}
