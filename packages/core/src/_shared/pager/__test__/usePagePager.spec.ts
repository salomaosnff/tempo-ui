import { describe, it, expect, vi } from "vitest";
import { usePagePager } from "../usePagePager";
import type { PagePagerParams, PagePagerResponse } from "../usePagePager";
import { PagerState } from "../pager";

function createMockRequest<T>(responses: PagePagerResponse<T>[]) {
  let callIndex = 0;
  return vi.fn((params: PagePagerParams) => {
    const response = responses[callIndex];
    if (!response) throw new Error("No more responses");
    callIndex++;
    return response;
  });
}

describe("usePagePager", () => {
  describe("initial state", () => {
    it("should start with idle status", () => {
      const pager = usePagePager(() => ({
        items: [],
        total_pages: 0,
      }));

      expect(pager.status.value).toBe(PagerState.IDLE);
    });

    it("should start with empty items", () => {
      const pager = usePagePager(() => ({
        items: [],
        total_pages: 0,
      }));

      expect(pager.items.value).toEqual([]);
    });

    it("should start with no error", () => {
      const pager = usePagePager(() => ({
        items: [],
        total_pages: 0,
      }));

      expect(pager.error.value).toBeNull();
    });

    it("should start with hasNext as false (no response yet)", () => {
      const pager = usePagePager(() => ({
        items: [],
        total_pages: 0,
      }));

      expect(pager.hasNext.value).toBe(false);
    });

    it("should start with page 1 by default", () => {
      const pager = usePagePager(() => ({
        items: [],
        total_pages: 0,
      }));

      expect(pager.page.value).toBe(1);
    });

    it("should start with initialPage when provided", () => {
      const pager = usePagePager(
        () => ({ items: [], total_pages: 0 }),
        { initialPage: 3 }
      );

      expect(pager.page.value).toBe(3);
    });
  });

  describe("load", () => {
    it("should load items and set status to done", async () => {
      const request = createMockRequest([
        { items: [1, 2, 3], total_pages: 5 },
      ]);

      const pager = usePagePager(request);
      await pager.load();

      expect(pager.items.value).toEqual([1, 2, 3]);
      expect(pager.status.value).toBe(PagerState.DONE);
    });

    it("should pass custom params to the request", async () => {
      const request = createMockRequest([
        { items: ["a"], total_pages: 1 },
      ]);

      const pager = usePagePager(request);
      await pager.load({ page_size: 5, page: 2 });

      expect(request).toHaveBeenCalledWith({ page_size: 5, page: 2 });
    });

    it("should update hasNext based on page vs total_pages", async () => {
      const request = createMockRequest([
        { items: [1, 2, 3], total_pages: 5 },
      ]);

      const pager = usePagePager(request);
      await pager.load();

      // page=1, total_pages=5 → hasNext = true
      expect(pager.hasNext.value).toBe(true);
    });

    it("should replace items on subsequent loads", async () => {
      const request = createMockRequest([
        { items: [1, 2, 3], total_pages: 5 },
        { items: [4, 5, 6], total_pages: 5 },
      ]);

      const pager = usePagePager(request);

      await pager.load();
      expect(pager.items.value).toEqual([1, 2, 3]);

      await pager.load();
      expect(pager.items.value).toEqual([4, 5, 6]);
    });

    it("should set items to empty array when request fails", async () => {
      const request = vi.fn(() => {
        throw new Error("Network Error");
      });

      const pager = usePagePager(request);
      await pager.load();

      expect(pager.items.value).toEqual([]);
      expect(pager.status.value).toBe(PagerState.ERROR);
      expect(pager.error.value).toBeInstanceOf(Error);
      expect(pager.error.value.message).toBe("Network Error");
    });
  });

  describe("next", () => {
    it("should replace items with next page and increment page", async () => {
      const request = createMockRequest([
        { items: [1, 2, 3], total_pages: 3 },
        { items: [4, 5, 6], total_pages: 3 },
      ]);

      const pager = usePagePager(request);

      await pager.load();
      expect(pager.items.value).toEqual([1, 2, 3]);
      expect(pager.page.value).toBe(1);

      await pager.next();
      expect(pager.items.value).toEqual([4, 5, 6]);
      expect(pager.page.value).toBe(2);
    });

    it("should do nothing when hasNext is false", async () => {
      const request = createMockRequest([
        { items: [1, 2, 3], total_pages: 1 },
      ]);

      const pager = usePagePager(request);
      await pager.load();

      // page=1, total_pages=1 → hasNext = false
      expect(pager.hasNext.value).toBe(false);

      await pager.next();

      expect(request).toHaveBeenCalledTimes(1);
      expect(pager.items.value).toEqual([1, 2, 3]);
      expect(pager.page.value).toBe(1);
    });

    it("should pass current page in request params", async () => {
      const request = createMockRequest([
        { items: [1], total_pages: 3 },
        { items: [2], total_pages: 3 },
      ]);

      const pager = usePagePager(request);
      await pager.load();
      await pager.next();

      expect(request).toHaveBeenNthCalledWith(2, { page: 2 });
    });

    it("should not call next before initial load when hasNext is false", async () => {
      const request = createMockRequest([]);
      const pager = usePagePager(request);

      await pager.next();

      expect(request).not.toHaveBeenCalled();
    });

    it("should correctly increment page across multiple next calls", async () => {
      const request = createMockRequest([
        { items: [1], total_pages: 4 },
        { items: [2], total_pages: 4 },
        { items: [3], total_pages: 4 },
      ]);

      const pager = usePagePager(request);
      await pager.load();
      expect(pager.page.value).toBe(1);

      await pager.next();
      expect(pager.page.value).toBe(2);

      await pager.next();
      expect(pager.page.value).toBe(3);
    });

    it("should stop navigating when reaching last page", async () => {
      const request = createMockRequest([
        { items: [1], total_pages: 2 },
        { items: [2], total_pages: 2 },
      ]);

      const pager = usePagePager(request);
      await pager.load();

      // page=1, total_pages=2 → hasNext = true
      await pager.next();
      // page=2, total_pages=2 → hasNext = false

      expect(pager.hasNext.value).toBe(false);
      expect(pager.page.value).toBe(2);

      await pager.next();
      // should not increment
      expect(pager.page.value).toBe(2);
      expect(request).toHaveBeenCalledTimes(2);
    });
  });

  describe("more", () => {
    it("should append items from next page", async () => {
      const request = createMockRequest([
        { items: [1, 2, 3], total_pages: 2 },
        { items: [4, 5, 6], total_pages: 2 },
      ]);

      const pager = usePagePager(request);
      await pager.load();
      await pager.more();

      expect(pager.items.value).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it("should prepend items when reverse is true", async () => {
      const request = createMockRequest([
        { items: [4, 5, 6], total_pages: 2 },
        { items: [1, 2, 3], total_pages: 2 },
      ]);

      const pager = usePagePager(request);
      await pager.load();
      await pager.more(true);

      expect(pager.items.value).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it("should do nothing when hasNext is false", async () => {
      const request = createMockRequest([
        { items: [1, 2, 3], total_pages: 1 },
      ]);

      const pager = usePagePager(request);
      await pager.load();
      await pager.more();

      expect(request).toHaveBeenCalledTimes(1);
      expect(pager.items.value).toEqual([1, 2, 3]);
    });

    it("should increment page on more calls", async () => {
      const request = createMockRequest([
        { items: [1], total_pages: 3 },
        { items: [2], total_pages: 3 },
      ]);

      const pager = usePagePager(request);
      await pager.load();
      await pager.more();

      expect(pager.page.value).toBe(2);
    });

    it("should accumulate items over multiple more calls", async () => {
      const request = createMockRequest([
        { items: [1], total_pages: 3 },
        { items: [2], total_pages: 3 },
        { items: [3], total_pages: 3 },
      ]);

      const pager = usePagePager(request);
      await pager.load();
      await pager.more();
      await pager.more();

      expect(pager.items.value).toEqual([1, 2, 3]);
    });
  });

  describe("error handling", () => {
    it("should set error state on request failure", async () => {
      const error = new Error("API Error");
      const request = vi.fn(() => {
        throw error;
      });

      const pager = usePagePager(request);
      await pager.load();

      expect(pager.status.value).toBe(PagerState.ERROR);
      expect(pager.error.value).toBe(error);
    });

    it("should set error state on async request failure", async () => {
      const error = new Error("Async Error");
      const request = vi.fn(async () => {
        throw error;
      });

      const pager = usePagePager(request);
      await pager.load();

      expect(pager.status.value).toBe(PagerState.ERROR);
      expect(pager.error.value).toBe(error);
    });

    it("should throw when calling load while already pending", async () => {
      const request = vi.fn(
        async () =>
          new Promise<PagePagerResponse<number>>((resolve) =>
            setTimeout(
              () => resolve({ items: [1], total_pages: 1 }),
              100
            )
          )
      );

      const pager = usePagePager(request);
      const firstLoad = pager.load();

      await expect(pager.load()).rejects.toThrow("Pager already loading");

      await firstLoad;
    });
  });

  describe("status transitions", () => {
    it("should transition from IDLE -> PENDING -> DONE", async () => {
      const states: string[] = [];

      const request = vi.fn(async () => {
        states.push(PagerState.PENDING);
        return { items: [1], total_pages: 1 };
      });

      const pager = usePagePager(request);
      states.push(pager.status.value);

      await pager.load();
      states.push(pager.status.value);

      expect(states).toEqual([
        PagerState.IDLE,
        PagerState.PENDING,
        PagerState.DONE,
      ]);
    });

    it("should transition from IDLE -> PENDING -> ERROR on failure", async () => {
      const states: string[] = [];

      const request = vi.fn(async () => {
        states.push(PagerState.PENDING);
        throw new Error("fail");
      });

      const pager = usePagePager(request);
      states.push(pager.status.value);

      await pager.load();
      states.push(pager.status.value);

      expect(states).toEqual([
        PagerState.IDLE,
        PagerState.PENDING,
        PagerState.ERROR,
      ]);
    });
  });

  describe("hasNext computation", () => {
    it("should be true when page < total_pages", async () => {
      const request = createMockRequest([
        { items: [1, 2], total_pages: 5 },
      ]);

      const pager = usePagePager(request);
      await pager.load();

      expect(pager.hasNext.value).toBe(true);
    });

    it("should be false when page >= total_pages", async () => {
      const request = createMockRequest([
        { items: [1], total_pages: 1 },
      ]);

      const pager = usePagePager(request);
      await pager.load();

      // page=1, total_pages=1 → 1 < 1 = false
      expect(pager.hasNext.value).toBe(false);
    });

    it("should respect initialPage for hasNext computation", async () => {
      const request = createMockRequest([
        { items: [1], total_pages: 3 },
      ]);

      const pager = usePagePager(request, { initialPage: 3 });
      await pager.load();

      // page=3, total_pages=3 → hasNext = false
      expect(pager.hasNext.value).toBe(false);
    });

    it("should be true when initialPage is before last page", async () => {
      const request = createMockRequest([
        { items: [1], total_pages: 5 },
      ]);

      const pager = usePagePager(request, { initialPage: 2 });
      await pager.load();

      // page=2, total_pages=5 → hasNext = true
      expect(pager.hasNext.value).toBe(true);
    });
  });

  describe("shallow option", () => {
    it("should work with shallow = true", async () => {
      const request = createMockRequest([
        { items: [{ id: 1 }, { id: 2 }], total_pages: 1 },
      ]);

      const pager = usePagePager(request, { shallow: true });
      await pager.load();

      expect(pager.items.value).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it("should work with shallow = false (default)", async () => {
      const request = createMockRequest([
        { items: [{ id: 1 }, { id: 2 }], total_pages: 1 },
      ]);

      const pager = usePagePager(request);
      await pager.load();

      expect(pager.items.value).toEqual([{ id: 1 }, { id: 2 }]);
    });
  });
});
