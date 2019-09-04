import { isAsyncIterable } from "./async-like";
import { source, TransientAsyncIteratorSource } from "./transient-source";

interface ListenableOn {
  on(eventName: string, callback: (...args: any[]) => void): void;
  off?(eventName: string, callback: (...args: any[]) => void): void;
  once?(eventName: string, callback: (...args: any[]) => void): void;
}

interface ListenableAdd {
  addListener(eventName: string, callback: (...args: any[]) => void): void;
  removeListener?(eventName: string, callback: (...args: any[]) => void): void;
  once?(eventName: string, callback: (...args: any[]) => void): void;
}

function isListenableAdd<T>(listenable: ListenableAdd | ListenableOn): listenable is ListenableAdd {
  function isListenableAddInstance(listenable: unknown): listenable is ListenableAdd {
    return !!listenable;
  }
  return (
    isListenableAddInstance(listenable) &&
    listenable.addListener instanceof Function
  );
}

export function eventSource<T = any>(listenable: ListenableAdd | ListenableOn, map: (...args: any[]) => T, eventName: string = "data", endEventName: string = "end", errorEventName: string = "error"): TransientAsyncIteratorSource<T> {
  const on = (isListenableAdd(listenable) ? listenable.addListener : listenable.on).bind(listenable);
  const off = ((isListenableAdd(listenable) ? listenable.removeListener : listenable.off) || (() => {})).bind(listenable);
  const once = listenable.once ? listenable.once.bind(listenable) : function(eventName: string, handler: (...args: any[]) => void) {
    const newHandler = (...args: any[]) => {
      off(eventName, newHandler);
      handler(...args);
    };
    on(eventName, newHandler);
  };
  const target = new TransientAsyncIteratorSource<T>();
  on(eventName, onEvent);
  once(endEventName, onEnd);
  once(errorEventName, onError);
  return target;

  function onOff() {
    off(eventName, onEvent);
    off(endEventName, onEnd);
    off(errorEventName, onError);
  }

  function onEvent(...args: any[]) {
    target.push(map(...args));
  }

  function onEnd() {
    onOff();
    target.close();
  }

  function onError(error: unknown) {
    onOff();
    target.throw(error);
  }
}
