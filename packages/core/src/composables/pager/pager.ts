import type { ComputedRef, Ref } from "vue";

export const PagerState = {
    IDLE: 'idle',
    PENDING: 'pending',
    DONE: 'done',
    ERROR: 'error'
} as const

/**
 * Represent a pager loading state
 */
export type PagerState = (typeof PagerState[keyof typeof PagerState])

/**
 * Represents a Data Pager
 */
export interface Pager<T> {
    /** Items of the pager */
    items: Ref<T[]>

    /** Status of the pager */
    status: Readonly<Ref<PagerState>>

    /** Error of the pager */
    error: Ref<any>

    /** If there is a next page */
    hasNext: ComputedRef<boolean>

    /**
     * Replace all items with the next page
     */
    next(): Promise<void>

    /**
     * Replace all items with the specified parameters
     */
    load(params?: Record<string, any>): Promise<void>

    /**
     * Add the next page items to the current items
     * @param reverse If true, the next page will be added to the beginning of the current items
     */
    more(reverse?: boolean): Promise<void>
}