import { computed, ref, shallowRef, type Ref } from "vue";



/**
 * Hook for pagination
 * @param load Function that loads the next page
 * @param default_page_size Default page size
 * @returns 
 */
export function usePager<T>(
    load: (params: PageParams) => PageResponse<T> | Promise<PageResponse<T>>,
    default_page_size = 20,
) {
    const items = ref<T[]>([]) as Ref<T[]>;
    const last_result = shallowRef<PageResponse<T> | null>(null);
    const is_loading = shallowRef(false);
    const error = shallowRef<any>(null);
    const has_next = computed(() => last_result.value?.has_next ?? false);

    /**
     * Requests the next page
     */
    async function request(params: PageParams) {
        if (is_loading.value) {
            return;
        }
        if (params.page_size) {
            default_page_size = params.page_size;
        }
        try {
            is_loading.value = true;
            error.value = null;
            const result = await load(params);
            last_result.value = result;
            return result;
        } catch (err) {
            error.value = err;
        } finally {
            is_loading.value = false;
        }
    }

    /**
     * Loads the next page
     */
    async function load_more(reverse = false) {
        const result = await request({
            cursor: last_result.value?.cursor ?? undefined,
            page_size: default_page_size,
        });
        if (!result) {
            return [];
        }
        if (reverse) {
            items.value.unshift(...result.items);
        } else {
            items.value.push(...result.items);
        }

        return result.items;
    }

    /**
     * Loads the next page
     */
    async function next() {
        const result = await request({
            cursor: last_result.value?.cursor ?? undefined,
            page_size: default_page_size,
        });
        if (!result) {
            return [];
        }
        items.value = result.items;
        return items.value;
    }

    /**
     * Clears the pager
     */
    async function clear() {
        if (is_loading.value) {
            return;
        }
        last_result.value = null;
        items.value = [];
        is_loading.value = false;
        error.value = null;
    }

    /**
     * Refreshes the pager by clearing it and loading the first page
     */
    async function refresh() {
        clear();
        await next();
    }

    return {
        items,
        last_result,
        is_loading,
        error,
        has_next,
        load_more,
        next,
        clear,
        refresh
    };
}
