import { createServer } from "http";
import { eventSource, asyncExtendedIterable } from "../dist";

asyncExtendedIterable(
  eventSource(createServer().listen(3001), (request, response) => ({ request, response }), "request", "close")
)
  .forEach(({ request, response }) => {
    console.log(request.url);
    response.end("Hello");
  })
  .then(() => console.log("Complete"))
  .catch(error => console.error(error));


