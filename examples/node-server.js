import { createServer } from "http";
import { eventSource, asyncExtendedIterable } from "../dist";

asyncExtendedIterable(
  eventSource(createServer().listen(3001), (request, response) => ({ request, response }), "request", "close")
)
  .map(({ request, response }) => {
    return {
      request,
      responseWith: value => response.end(value)
    }
  })
  .forEach(event => {
    event.responseWith("Hello 1");
  })
  .then(() => console.log("Complete"))
  .catch(error => console.error(error));


