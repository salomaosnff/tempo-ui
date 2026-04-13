import { inject, provide } from "vue";

/**
 * Creates a context for a component.
 * @param key - The key to use for the context.
 * @returns An object with methods to provide and inject the context.
 */
export function createContext<T>(key: string) {
  function provideValue(value: T): T {
    provide(key, value)
    return value
  }

  function injectValue(): T | null {
    return inject(key, null)
  }

  function injectValueOrThrow(): T {
    const value = injectValue()

    if (!value) {
      throw new Error(`Context ${String(key)} not found`)
    }

    return value
  }

  return {
    provide: provideValue,
    inject: injectValueOrThrow,
    injectOptional: injectValue
  }
}