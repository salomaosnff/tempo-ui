import { describe, it, expect, vi } from "vitest";
import { useOffsetPager } from "../useOffsetPager";
import type { OffsetPagerParams, OffsetPagerResponse } from "../useOffsetPager";
import { PagerState } from "../pager";

function createMockRequest<T>(responses: OffsetPagerResponse<T>[]) {
  let callIndex = 0;
  return vi.fn((params: OffsetPagerParams) => {
    const response = responses[callIndex];
    if (!response) throw new Error("No more responses");
    callIndex++;
    return response;
  });
}

describe("useOffsetPager", () => {
  describe("initial state", () => {
    it("should start with idle status", () => {
      const pager = useOffsetPager(() => ({
        items: [],
        total_items: 0,
      }));

      expect(pager.status.value).toBe(PagerState.IDLE);
    });

    it("should start with empty items", () => {
      const pager = useOffsetPager(() => ({
        items: [],
        total_items: 0,
      }));

      expect(pager.items.value).toEqual([]);
    });

    it("should start with no error", () => {
      const pager = useOffsetPager(() => ({
        items: [],
        total_items: 0,
      }));

      expect(pager.error.value).toBeNull();
    });

    it("should start with hasNext as false (no response yet)", () => {
      const pager = useOffsetPager(() => ({
        items: [],
        total_items: 0,
      }));

      expect(pager.hasNext.value).toBe(false);
    });

    it("should start with offset 0 by default", () => {
      const pager = useOffsetPager(() => ({
        items: [],
        total_items: 0,
      }));

      expect(pager.offset.value).toBe(0);
    });

    it("should start with initialOffset when provided", () => {
      const pager = useOffsetPager(
        () => ({ items: [], total_items: 0 }),
        { initialOffset: 10 }
      );

      expect(pager.offset.value).toBe(10);
    });
  });

  describe("load", () => {
    it("should load items and set status to done", async () => {
      const request = createMockRequest([
        { items: [1, 2, 3], total_items: 10 },
      ]);

      const pager = useOffsetPager(request);
      await pager.load();

      expect(pager.items.value).toEqual([1, 2, 3]);
      expect(pager.status.value).toBe(PagerState.DONE);
    });

    it("should pass custom params to the request", async () => {
      const request = createMockRequest([
        { items: ["a"], total_items: 1 },
      ]);

      const pager = useOffsetPager(request);
      await pager.load({ page_size: 5, offset: 10 });

      expect(request).toHaveBeenCalledWith({ page_size: 5, offset: 10 });
    });

    it("should update hasNext based on offset vs total_items", async () => {
      const request = createMockRequest([
        { items: [1, 2, 3], total_items: 10 },
      ]);

      const pager = useOffsetPager(request);
      await pager.load();

      // offset is still 0, total_items is 10 → hasNext = true
      expect(pager.hasNext.value).toBe(true);
    });

    it("should replace items on subsequent loads", async () => {
      const request = createMockRequest([
        { items: [1, 2, 3], total_items: 10 },
        { items: [4, 5, 6], total_items: 10 },
      ]);

      const pager = useOffsetPager(request);

      await pager.load();
      expect(pager.items.value).toEqual([1, 2, 3]);

      await pager.load();
      expect(pager.items.value).toEqual([4, 5, 6]);
    });

    it("should set items to empty array when request fails", async () => {
      const request = vi.fn(() => {
        throw new Error("Network Error");
      });

      const pager = useOffsetPager(request);
      await pager.load();

      expect(pager.items.value).toEqual([]);
      expect(pager.status.value).toBe(PagerState.ERROR);
      expect(pager.error.value).toBeInstanceOf(Error);
      expect(pager.error.value.message).toBe("Network Error");
    });
  });

  describe("next", () => {
    it("should replace items with next page and advance offset", async () => {
      const request = createMockRequest([
        { items: [1, 2, 3], total_items: 6 },
        { items: [4, 5, 6], total_items: 6 },
      ]);

      const pager = useOffsetPager(request);

      await pager.load();
      expect(pager.items.value).toEqual([1, 2, 3]);
      expect(pager.offset.value).toBe(0);

      await pager.next();
      expect(pager.items.value).toEqual([4, 5, 6]);
      expect(pager.offset.value).toBe(3); // 0 + 3 items
    });

    it("should do nothing when hasNext is false", async () => {
      const request = createMockRequest([
        { items: [1, 2, 3], total_items: 3 },
      ]);

      const pager = useOffsetPager(request);
      await pager.load();

      // offset=0, total_items=3 → hasNext should still be true
      // But after advancing by 3, offset=3, total_items=3 → hasNext = false
      // Actually, offset is only advanced by `next`, not by `load`
      // So hasNext = 0 < 3 = true, let's go to next
      await pager.next();
      // offset = 0 + 3 = 3, total_items = 3 → hasNext = false now

      expect(pager.hasNext.value).toBe(false);
      expect(request).toHaveBeenCalledTimes(2);
    });

    it("should pass offset in request params", async () => {
      const request = createMockRequest([
        { items: [1, 2], total_items: 10 },
        { items: [3, 4], total_items: 10 },
      ]);

      const pager = useOffsetPager(request);
      await pager.load();
      await pager.next();

      expect(request).toHaveBeenNthCalledWith(2, { offset: 2 });
    });

    it("should not call next before initial load when hasNext is false", async () => {
      const request = createMockRequest([]);
      const pager = useOffsetPager(request);

      await pager.next();

      expect(request).not.toHaveBeenCalled();
    });

    it("should correctly advance offset across multiple next calls", async () => {
      const request = createMockRequest([
        { items: [1, 2], total_items: 6 },
        { items: [3, 4], total_items: 6 },
        { items: [5, 6], total_items: 6 },
      ]);

      const pager = useOffsetPager(request);
      await pager.load();
      expect(pager.offset.value).toBe(0);

      await pager.next();
      expect(pager.offset.value).toBe(2);

      await pager.next();
      expect(pager.offset.value).toBe(4);
    });
  });

  describe("more", () => {
    it("should append items from next page", async () => {
      const request = createMockRequest([
        { items: [1, 2, 3], total_items: 6 },
        { items: [4, 5, 6], total_items: 6 },
      ]);

      const pager = useOffsetPager(request);
      await pager.load();
      await pager.more();

      expect(pager.items.value).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it("should prepend items when reverse is true", async () => {
      const request = createMockRequest([
        { items: [4, 5, 6], total_items: 6 },
        { items: [1, 2, 3], total_items: 6 },
      ]);

      const pager = useOffsetPager(request);
      await pager.load();
      await pager.more(true);

      expect(pager.items.value).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it("should do nothing when hasNext is false", async () => {
      const request = createMockRequest([
        { items: [1, 2, 3], total_items: 0 },
      ]);

      const pager = useOffsetPager(request);
      await pager.load();
      await pager.more();

      // offset=0, total_items=0 → hasNext = false
      expect(request).toHaveBeenCalledTimes(1);
      expect(pager.items.value).toEqual([1, 2, 3]);
    });

    it("should advance offset on more calls", async () => {
      const request = createMockRequest([
        { items: [1, 2], total_items: 6 },
        { items: [3, 4], total_items: 6 },
      ]);

      const pager = useOffsetPager(request);
      await pager.load();
      await pager.more();

      expect(pager.offset.value).toBe(2);
    });

    it("should accumulate items over multiple more calls", async () => {
      const request = createMockRequest([
        { items: [1], total_items: 3 },
        { items: [2], total_items: 3 },
        { items: [3], total_items: 3 },
      ]);

      const pager = useOffsetPager(request);
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

      const pager = useOffsetPager(request);
      await pager.load();

      expect(pager.status.value).toBe(PagerState.ERROR);
      expect(pager.error.value).toBe(error);
    });

    it("should set error state on async request failure", async () => {
      const error = new Error("Async Error");
      const request = vi.fn(async () => {
        throw error;
      });

      const pager = useOffsetPager(request);
      await pager.load();

      expect(pager.status.value).toBe(PagerState.ERROR);
      expect(pager.error.value).toBe(error);
    });

    it("should throw when calling load while already pending", async () => {
      const request = vi.fn(
        async () =>
          new Promise<OffsetPagerResponse<number>>((resolve) =>
            setTimeout(
              () => resolve({ items: [1], total_items: 1 }),
              100
            )
          )
      );

      const pager = useOffsetPager(request);
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
        return { items: [1], total_items: 1 };
      });

      const pager = useOffsetPager(request);
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

      const pager = useOffsetPager(request);
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
    it("should be true when offset < total_items", async () => {
      const request = createMockRequest([
        { items: [1, 2], total_items: 10 },
      ]);

      const pager = useOffsetPager(request);
      await pager.load();

      expect(pager.hasNext.value).toBe(true);
    });

    it("should be false when offset >= total_items", async () => {
      const request = createMockRequest([
        { items: [1, 2, 3], total_items: 3 },
        { items: [], total_items: 3 },
      ]);

      const pager = useOffsetPager(request);
      await pager.load();
      // offset = 0, total = 3 → hasNext = true
      await pager.next();
      // offset = 3, total = 3 → hasNext = false

      expect(pager.hasNext.value).toBe(false);
    });

    it("should respect initialOffset for hasNext computation", async () => {
      const request = createMockRequest([
        { items: [1], total_items: 5 },
      ]);

      const pager = useOffsetPager(request, { initialOffset: 5 });
      await pager.load();

      // offset = 5, total_items = 5 → hasNext = false
      expect(pager.hasNext.value).toBe(false);
    });
  });

  describe("shallow option", () => {
    it("should work with shallow = true", async () => {
      const request = createMockRequest([
        { items: [{ id: 1 }, { id: 2 }], total_items: 2 },
      ]);

      const pager = useOffsetPager(request, { shallow: true });
      await pager.load();

      expect(pager.items.value).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it("should work with shallow = false (default)", async () => {
      const request = createMockRequest([
        { items: [{ id: 1 }, { id: 2 }], total_items: 2 },
      ]);

      const pager = useOffsetPager(request);
      await pager.load();

      expect(pager.items.value).toEqual([{ id: 1 }, { id: 2 }]);
    });
  });
});
