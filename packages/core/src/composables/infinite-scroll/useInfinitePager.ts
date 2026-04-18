import { PagerState, type Pager } from "../pager/pager";
import { useInfiniteScroll } from "@vueuse/core";

export type InfinitePagerScrollElement = Parameters<typeof useInfiniteScroll>[0];
export type InfinitePagerScrollOptions = Parameters<typeof useInfiniteScroll>[2] & {
  immediate?: boolean;
};

export function useInfinitePager<T>(
  pager: Pager<T>,
  element: InfinitePagerScrollElement = document,
  options: InfinitePagerScrollOptions = {},
) {
  const scroll = useInfiniteScroll(element, () => pager.more(), {
    ...options,
    canLoadMore(el) {
      if (typeof options.canLoadMore === "function" && !options.canLoadMore(el)) {
        return false;
      }

      return pager.hasNext.value && pager.status.value !== PagerState.PENDING;
    },
  });

  if (options.immediate ?? true) {
    pager.load();
  }

  return {
    pager,
    scroll,
  };
}
