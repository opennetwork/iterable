import { Push } from "@virtualstate/promise";
import { applyTC39AsyncIteratorHelpers, TC39AsyncIterable } from "../../tc39";

interface OnOptions {
  signal?: AbortSignal;
}

function on<K extends keyof HTMLElementEventMap>(this: EventTarget, type: K, options?: OnOptions) {
  return onHTMLEvent(this, type, options);
}

declare global {
  interface EventTarget {
    on<K extends keyof HTMLElementEventMap>(type: K, options?: OnOptions): TC39AsyncIterable<HTMLElementEventMap[K]>;
  }
}

if (typeof window !== "undefined" && typeof HTMLElement !== "undefined") {
  Object.assign(HTMLElement.prototype, { on });
}
Object.assign(EventTarget.prototype, { on });

function onHTMLEvent<K extends keyof HTMLElementEventMap>(target: EventTarget, type: K, options?: OnOptions) {
  return onEvent(target, type, options).filter(isMatching);

  function isMatching(event: Event): event is HTMLElementEventMap[K] {
    return event.type === type;
  }
}

function onEvent(target: EventTarget, type: string, options?: OnOptions) {
  const push = new Push<Event>();
  target.addEventListener(type, handler);
  if (options?.signal) {
    options.signal.addEventListener("abort", () => {
      target.removeEventListener(type, handler);
      push.close();
    });
  }
  applyTC39AsyncIteratorHelpers(push);
  return push;

  function handler(event: Event) {
    push.push(event);
  }
}

{

  const controller = new AbortController();
  const { signal } = controller;
  const element = new EventTarget();

  queueMicrotask(() => {
    element.dispatchEvent(new Event("click"));
  });

  for await (const event of element.on("click", { signal })) {
    console.log({ event });
    controller.abort();
  }
}

{

  const controller = new AbortController();
  const { signal } = controller;
  const element = new EventTarget();

  Object.assign(element, {
    matches() {
      return true;
    }
  });

  let count = 0;

  const interval = setInterval(() => {
    const event = new Event("click");
    Object.assign(event, {
      clientX: Math.random(),
      clientY: Math.random()
    });
    element.dispatchEvent(event);
    count += 1;
    if (count > 5) {
      clearInterval(interval);
      controller.abort();
    }
  }, 10);

  await element.on("click", { signal })
    .filter(isHTMLElementTarget)
    .filter(event => event.target.matches(".foo"))
    .map(({ clientX, clientY }) => ({ clientX, clientY }))
    .forEach(console.log);


}

{

  const controller = new AbortController();
  const { signal } = controller;
  const element = new EventTarget();
  const other = new EventTarget();

  Object.assign(element, {
    matches() {
      return true;
    }
  });

  let count = 0;

  const interval = setInterval(() => {
    const event = new Event("click");
    Object.assign(event, {
      clientX: Math.random(),
      clientY: Math.random()
    });
    count += 1;
    if (count > 5) {
      clearInterval(interval);
      other.dispatchEvent(event);
    } else {
      element.dispatchEvent(event);
    }
  }, 10);

  other.addEventListener(
    "click",
    () => {
      controller.abort();
    },
    {
      once: true
    }
  );

  await element.on("click", { signal })
    .forEach(console.log);

}




function isHTMLElementTarget<E extends Event>(event: E): event is E & { target: HTMLElement, clientX: number, clientY: number } {
  return !!(isLike<HTMLElement>(event.target) && event.target.matches);
}

function isLike<T>(value: unknown): value is T {
  return !!value;
}
