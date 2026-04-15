import { shallowRef } from "vue";
import type { Pager } from "../pager";
import { useInfinitePager, type InfinitePagerScrollElement, type InfinitePagerScrollOptions } from "./useInfinitePager";
import { watchDebounced, type WatchDebouncedOptions } from "@vueuse/core";

export interface InfinitePagerSearchOptions {
    initialValue?: string
    immediate?: boolean
    debounceOptions?: Omit<WatchDebouncedOptions<boolean>, 'immediate'>
    infinitePagerOptions?: Omit<InfinitePagerScrollOptions, 'immediate'>
}

export function useInfinitePagerSearch<T>(pager: Pager<T>, element: InfinitePagerScrollElement = document, options: InfinitePagerSearchOptions = {}) {
    const { debounceOptions = {}, infinitePagerOptions, initialValue, immediate = true } = options

    debounceOptions.debounce ??= 400

    const search = shallowRef(initialValue)
    const infinitePager = useInfinitePager(pager, element, { ...infinitePagerOptions, immediate: false })

    watchDebounced(search, (search) => pager.load({ search }), { ...debounceOptions, immediate })

    return {
        search,
        ...infinitePager
    }
}