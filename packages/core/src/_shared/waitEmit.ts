type AnyFunction = (...args: any[]) => any;

export type WaitableEvent<T> = T;

/**
 * Calls an event handler or an array of event handlers.
 * @param handler The event handler or array of event handlers to call.
 * @param args The arguments to pass to the event handler(s).
 */
export async function waitEmit<T extends AnyFunction>(
  handler?: T,
  ...args: Parameters<T>
): Promise<Awaited<ReturnType<T>>>;
export async function waitEmit<T extends AnyFunction>(
  handlers?: T[],
  ...args: Parameters<T>
): Promise<Awaited<ReturnType<T>>[]>;
export async function waitEmit(
  handlerOrHandlers?: AnyFunction | AnyFunction[],
  ...args: any[]
): Promise<any> {
  if (typeof handlerOrHandlers === "function") {
    return handlerOrHandlers(...args);
  }

  if (Array.isArray(handlerOrHandlers)) {
    return Promise.all(handlerOrHandlers.map((f) => f(...args)));
  }
}
