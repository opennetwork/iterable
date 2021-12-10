import { createServer } from "http";
import { eventSource, asyncExtendedIterable } from "../dist/index.js";

let count = 0;

const server = createServer().listen(3001);
const source = eventSource(server, (request, response) => ({ request, response }), "request", "close");

asyncExtendedIterable(source)
  .map(({ request, response }) => {
    return {
      request,
      respondWith: value => response.end(value)
    }
  })
  .forEach(async event => {
    console.log("Event", event.request.url);
    event.respondWith(`Hello ${count += 1}`);
  })
  .then(() => console.log("Complete"))
  .catch(error => console.error(error));


