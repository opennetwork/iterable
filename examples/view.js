import { asyncView, source, asyncExtendedIterable } from "../dist/index.js";

const iterable = asyncExtendedIterable(asyncView(source(() => Math.random())))

iterable
  .take(2)
  .forEach(async iterable => {
    return asyncExtendedIterable(iterable)
      .take(2)
      .forEach(value => console.log({ value }));
  })
  .then(() => {
    return iterable
      .take(2)
      .forEach(async iterable => {
        return asyncExtendedIterable(iterable)
          .take(2)
          .forEach(value => console.log({ value }));
      })
  })
  .then(() => console.log("Complete"))
  .catch(error => console.error(error));

