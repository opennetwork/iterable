import { constructTC39IteratorHelpers } from "./tc39";
import * as Async from "./operations/async";
import * as Sync from "./operations/sync";

async function *asyncGenerator() {
}
function *syncGenerator() {
}

const AsyncIterator = Object.getPrototypeOf(Object.getPrototypeOf(asyncGenerator()[Symbol.asyncIterator]()));
const Iterator = Object.getPrototypeOf(Object.getPrototypeOf(syncGenerator()[Symbol.iterator]()));

constructTC39IteratorHelpers(AsyncIterator, Async);
constructTC39IteratorHelpers(Iterator, Sync);
