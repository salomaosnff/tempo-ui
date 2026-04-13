import { shallowRef, type ShallowRef } from "vue";

export type AsyncState = 'idle' | 'pending' | 'done' | 'error'

export type UseAsyncState<T> = {
    asyncState: ShallowRef<AsyncState>
    error: ShallowRef<any>
    value: ShallowRef<T | null>
    isIdle: () => boolean
    isPending: () => boolean
    isDone: () => boolean
    isError: () => boolean
    execute: () => Promise<T | null>
    reset: () => void
}

export function useAsync<T>(fn: () => T | Promise<T>): UseAsyncState<T> {
    const asyncState = shallowRef<AsyncState>('idle')
    const error = shallowRef<any>(null)
    const value = shallowRef<T | null>(null)

    const isIdle = () => asyncState.value === 'idle'
    const isPending = () => asyncState.value === 'pending'
    const isDone = () => asyncState.value === 'done'
    const isError = () => asyncState.value === 'error'

    async function execute() {
        if (asyncState.value === 'pending') return

        try {
            asyncState.value = 'pending'
            error.value = null
            value.value = await fn()
            return value.value
        } catch (err) {
            error.value = err
            throw err
        } finally {
            asyncState.value = 'done'
        }
    }

    function reset() {
        if (asyncState.value === 'pending') return

        asyncState.value = 'idle'
        error.value = null
        value.value = null
    }

    return {
        asyncState,
        error,
        value,

        isIdle,
        isPending,
        isDone,
        isError,

        execute,
        reset
    }
}