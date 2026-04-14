import { computed, readonly, ref, shallowRef, type ComputedRef, type Ref } from "vue";
import { PagerState, type Pager } from "./pager";

export interface CursorPagerParams {
    /**
     * Cursor for pagination
     * @example Sykdkw06wQIVR-05tyFbWw
     */
    cursor?: string;

    /**
     * Page size
     * @example 20
     */
    page_size?: number;
}

export interface CursorPagerResponse<T> {
    /** List of items */
    items: Array<T>;

    /** Total number of items */
    total_items: number;

    /** Whether there is a next page */
    has_next: boolean;

    /**
     * Cursor for pagination
     * @example Sykdkw06wQIVR-05tyFbWw
     */
    cursor: string | null;
}

export interface UseCursorPagerOptions {
    shallow?: boolean
    initialCursor?: string | null
}

export interface CursorPager<T> extends Pager<T> {
    /**
     * Current cursor
     */
    cursor: ComputedRef<string | null>
}

export function useCursorPager<T>(request: (params: CursorPagerParams) => CursorPagerResponse<T> | Promise<CursorPagerResponse<T>>, options: UseCursorPagerOptions = {}): CursorPager<T> {
    const { shallow = false, initialCursor } = options
    const lastResponse = shallowRef<CursorPagerResponse<T> | null>(null)
    const items = (shallow ? shallowRef<T[]>([]) : ref<T[]>([])) as Ref<T[]>
    const status = ref<PagerState>(PagerState.IDLE)
    const error = ref<any>(null)
    const hasNext = computed(() => lastResponse.value?.has_next ?? false)

    const cursor = computed(() => lastResponse.value?.cursor ?? initialCursor ?? null)

    async function send(params: CursorPagerParams = {}) {
        if (status.value === PagerState.PENDING) {
            throw new Error("Pager already loading")
        }

        try {
            status.value = PagerState.PENDING
            lastResponse.value = await request(params)
            status.value = PagerState.DONE
            return lastResponse.value.items
        } catch (err) {
            status.value = PagerState.ERROR
            error.value = err
        }
    }

    async function next() {
        if (!hasNext.value) {
            return
        }

        const newItems = await send({ cursor: cursor.value ?? undefined })

        if (!newItems) {
            return
        }

        items.value = newItems
    }

    async function more(reverse = false) {
        if (!hasNext.value) {
            return
        }

        const newItems = await send({ cursor: cursor.value ?? undefined })

        if (!newItems) {
            return
        }

        items.value = reverse ? [...newItems, ...items.value] : [...items.value, ...newItems]
    }

    async function load(params: Record<string, any>) {
        const result = await send(params)
        items.value = result ?? []
    }

    return {
        items,
        error: readonly(error),
        status: readonly(status),
        cursor,
        hasNext,
        load,
        next,
        more,
    }
}