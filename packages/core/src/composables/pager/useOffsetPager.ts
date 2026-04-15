import { computed, readonly, ref, shallowRef, type Ref } from "vue";
import { PagerState, type Pager } from "./pager";

export interface OffsetPagerParams {
    /**
     * Offset for pagination
     * @example Sykdkw06wQIVR-05tyFbWw
     */
    offset?: number;

    /**
     * Page size
     * @example 20
     */
    page_size?: number;
}

export interface OffsetPagerResponse<T> {
    /** List of items */
    items: Array<T>;

    /** Total number of items */
    total_items: number;
}

export interface UseOffsetPagerOptions {
    shallow?: boolean
    initialOffset?: number
}

export interface OffsetPager<T> extends Pager<T> {
    /** Current offset */
    offset: Readonly<Ref<number>>
}

export function useOffsetPager<T>(request: (params: OffsetPagerParams) => OffsetPagerResponse<T> | Promise<OffsetPagerResponse<T>>, options: UseOffsetPagerOptions = {}): OffsetPager<T> {
    const { shallow = false, initialOffset = 0 } = options

    const offset = shallowRef(initialOffset)

    const lastResponse = shallowRef<OffsetPagerResponse<T> | null>(null)
    const lastParams = shallowRef<Record<string, any>>({})
    const items = (shallow ? shallowRef<T[]>([]) : ref<T[]>([])) as Ref<T[]>
    const status = ref<PagerState>(PagerState.IDLE)
    const error = ref<any>(null)
    const hasNext = computed(() => {
        const totalItems = lastResponse.value?.total_items ?? 0
        return offset.value < totalItems
    })


    async function send(params?: OffsetPagerParams) {
        if (status.value === PagerState.PENDING) {
            throw new Error("Pager already loading")
        }

        if (params) {
            lastParams.value = params
        }

        try {
            status.value = PagerState.PENDING
            lastResponse.value = await request(lastParams.value)
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

        offset.value += lastResponse.value?.items.length ?? 0

        const newItems = await send({ ...lastParams.value, offset: offset.value })

        if (!newItems) {
            return
        }

        items.value = newItems
    }

    async function more(reverse = false) {
        if (!hasNext.value) {
            return
        }

        offset.value += lastResponse.value?.items.length ?? 0

        const newItems = await send({ ...lastParams.value, offset: offset.value })

        if (!newItems) {
            return
        }

        items.value = reverse ? [...newItems, ...items.value] : [...items.value, ...newItems]
    }

    async function load(params?: Record<string, any>) {
        const result = await send(params)
        items.value = result ?? []
    }

    return {
        items,
        error: readonly(error),
        status: readonly(status),
        offset: readonly(offset),
        hasNext,
        load,
        next,
        more,
    }
}