import { computed, readonly, ref, shallowRef, type Ref } from "vue";
import { PagerState, type Pager } from "./pager";

export interface PagePagerParams {
    /**
     * Page for pagination
     * @example Sykdkw06wQIVR-05tyFbWw
     */
    page?: number;

    /**
     * Page size
     * @example 20
     */
    page_size?: number;
}

export interface PagePagerResponse<T> {
    /** List of items */
    items: Array<T>;

    /** Total number of pages */
    total_pages: number
}

export interface UsePagePagerOptions {
    shallow?: boolean
    initialPage?: number
}

export interface PagePager<T> extends Pager<T> {
    /** Current page */
    page: Readonly<Ref<number>>
}

export function usePagePager<T>(request: (params: PagePagerParams) => PagePagerResponse<T> | Promise<PagePagerResponse<T>>, options: UsePagePagerOptions = {}): PagePager<T> {
    const { shallow = false, initialPage = 1 } = options

    let page = shallowRef(initialPage)

    const lastResponse = shallowRef<PagePagerResponse<T> | null>(null)
    const items = (shallow ? shallowRef<T[]>([]) : ref<T[]>([])) as Ref<T[]>
    const status = ref<PagerState>(PagerState.IDLE)
    const error = ref<any>(null)
    const hasNext = computed(() => {
        const totalItems = lastResponse.value?.total_pages ?? 0
        return page.value < totalItems
    })


    async function send(params: PagePagerParams = {}) {
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

        page.value++

        const newItems = await send({ page: page.value })

        if (!newItems) {
            return
        }

        items.value = newItems
    }

    async function more(reverse = false) {
        if (!hasNext.value) {
            return
        }

        page.value++

        const newItems = await send({ page: page.value })

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
        page,
        hasNext,
        load,
        next,
        more,
    }
}