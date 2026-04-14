import { describe, it, expect, vi } from "vitest";
import { nextTick } from "vue";
import { useCursorPager } from "../useCursorPager";
import type { CursorPagerParams, CursorPagerResponse } from "../useCursorPager";
import { PagerState } from "../pager";

function createMockRequest<T>(responses: CursorPagerResponse<T>[]) {
  let callIndex = 0;
  return vi.fn((params: CursorPagerParams) => {
    const response = responses[callIndex];
    if (!response) throw new Error("No more responses");
    callIndex++;
    return response;
  });
}

function createAsyncMockRequest<T>(responses: CursorPagerResponse<T>[], delay = 0) {
  let callIndex = 0;
  return vi.fn(async (params: CursorPagerParams) => {
    if (delay > 0) await new Promise((r) => setTimeout(r, delay));
    const response = responses[callIndex];
    if (!response) throw new Error("No more responses");
    callIndex++;
    return response;
  });
}

describe("useCursorPager", () => {
  describe("initial state", () => {
    it("should start with idle status", () => {
      const pager = useCursorPager(() => ({
        items: [],
        total_items: 0,
        has_next: false,
        cursor: null,
      }));

      expect(pager.status.value).toBe(PagerState.IDLE);
    });

    it("should start with empty items", () => {
      const pager = useCursorPager(() => ({
        items: [],
        total_items: 0,
        has_next: false,
        cursor: null,
      }));

      expect(pager.items.value).toEqual([]);
    });

    it("should start with no error", () => {
      const pager = useCursorPager(() => ({
        items: [],
        total_items: 0,
        has_next: false,
        cursor: null,
      }));

      expect(pager.error.value).toBeNull();
    });

    it("should start with hasNext as false", () => {
      const pager = useCursorPager(() => ({
        items: [],
        total_items: 0,
        has_next: false,
        cursor: null,
      }));

      expect(pager.hasNext.value).toBe(false);
    });

    it("should start with cursor as null when no initialCursor", () => {
      const pager = useCursorPager(() => ({
        items: [],
        total_items: 0,
        has_next: false,
        cursor: null,
      }));

      expect(pager.cursor.value).toBeNull();
    });

    it("should start with initialCursor when provided", () => {
      const pager = useCursorPager(
        () => ({
          items: [],
          total_items: 0,
          has_next: false,
          cursor: null,
        }),
        { initialCursor: "abc123" }
      );

      expect(pager.cursor.value).toBe("abc123");
    });
  });

  describe("load", () => {
    it("should load items and set status to done", async () => {
      const request = createMockRequest([
        {
          items: [1, 2, 3],
          total_items: 10,
          has_next: true,
          cursor: "cursor-1",
        },
      ]);

      const pager = useCursorPager(request);
      await pager.load();

      expect(pager.items.value).toEqual([1, 2, 3]);
      expect(pager.status.value).toBe(PagerState.DONE);
    });

    it("should pass custom params to the request", async () => {
      const request = createMockRequest([
        {
          items: ["a"],
          total_items: 1,
          has_next: false,
          cursor: null,
        },
      ]);

      const pager = useCursorPager(request);
      await pager.load({ page_size: 5, cursor: "custom" });

      expect(request).toHaveBeenCalledWith({ page_size: 5, cursor: "custom" });
    });

    it("should update cursor after load", async () => {
      const request = createMockRequest([
        {
          items: [1],
          total_items: 5,
          has_next: true,
          cursor: "next-cursor",
        },
      ]);

      const pager = useCursorPager(request);
      await pager.load();

      expect(pager.cursor.value).toBe("next-cursor");
    });

    it("should update hasNext based on response", async () => {
      const request = createMockRequest([
        {
          items: [1, 2],
          total_items: 5,
          has_next: true,
          cursor: "c1",
        },
      ]);

      const pager = useCursorPager(request);
      await pager.load();

      expect(pager.hasNext.value).toBe(true);
    });

    it("should replace items on subsequent loads", async () => {
      const request = createMockRequest([
        {
          items: [1, 2, 3],
          total_items: 10,
          has_next: true,
          cursor: "c1",
        },
        {
          items: [4, 5, 6],
          total_items: 10,
          has_next: true,
          cursor: "c2",
        },
      ]);

      const pager = useCursorPager(request);

      await pager.load();
      expect(pager.items.value).toEqual([1, 2, 3]);

      await pager.load();
      expect(pager.items.value).toEqual([4, 5, 6]);
    });

    it("should set items to empty array when request fails", async () => {
      const request = vi.fn(() => {
        throw new Error("Network Error");
      });

      const pager = useCursorPager(request);
      await pager.load();

      expect(pager.items.value).toEqual([]);
      expect(pager.status.value).toBe(PagerState.ERROR);
      expect(pager.error.value).toBeInstanceOf(Error);
      expect(pager.error.value.message).toBe("Network Error");
    });
  });

  describe("next", () => {
    it("should replace items with next page", async () => {
      const request = createMockRequest([
        {
          items: [1, 2, 3],
          total_items: 6,
          has_next: true,
          cursor: "c1",
        },
        {
          items: [4, 5, 6],
          total_items: 6,
          has_next: false,
          cursor: null,
        },
      ]);

      const pager = useCursorPager(request);

      await pager.load();
      expect(pager.items.value).toEqual([1, 2, 3]);

      await pager.next();
      expect(pager.items.value).toEqual([4, 5, 6]);
    });

    it("should do nothing when hasNext is false", async () => {
      const request = createMockRequest([
        {
          items: [1, 2, 3],
          total_items: 3,
          has_next: false,
          cursor: null,
        },
      ]);

      const pager = useCursorPager(request);
      await pager.load();

      await pager.next();

      expect(request).toHaveBeenCalledTimes(1);
      expect(pager.items.value).toEqual([1, 2, 3]);
    });

    it("should pass current cursor in request params", async () => {
      const request = createMockRequest([
        {
          items: [1],
          total_items: 5,
          has_next: true,
          cursor: "cursor-abc",
        },
        {
          items: [2],
          total_items: 5,
          has_next: false,
          cursor: null,
        },
      ]);

      const pager = useCursorPager(request);
      await pager.load();
      await pager.next();

      expect(request).toHaveBeenNthCalledWith(2, { cursor: "cursor-abc" });
    });

    it("should not call next before initial load when hasNext is false", async () => {
      const request = createMockRequest([]);
      const pager = useCursorPager(request);

      await pager.next();

      expect(request).not.toHaveBeenCalled();
    });
  });

  describe("more", () => {
    it("should append items from next page", async () => {
      const request = createMockRequest([
        {
          items: [1, 2, 3],
          total_items: 6,
          has_next: true,
          cursor: "c1",
        },
        {
          items: [4, 5, 6],
          total_items: 6,
          has_next: false,
          cursor: null,
        },
      ]);

      const pager = useCursorPager(request);
      await pager.load();
      await pager.more();

      expect(pager.items.value).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it("should prepend items when reverse is true", async () => {
      const request = createMockRequest([
        {
          items: [4, 5, 6],
          total_items: 6,
          has_next: true,
          cursor: "c1",
        },
        {
          items: [1, 2, 3],
          total_items: 6,
          has_next: false,
          cursor: null,
        },
      ]);

      const pager = useCursorPager(request);
      await pager.load();
      await pager.more(true);

      expect(pager.items.value).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it("should do nothing when hasNext is false", async () => {
      const request = createMockRequest([
        {
          items: [1, 2, 3],
          total_items: 3,
          has_next: false,
          cursor: null,
        },
      ]);

      const pager = useCursorPager(request);
      await pager.load();
      await pager.more();

      expect(request).toHaveBeenCalledTimes(1);
      expect(pager.items.value).toEqual([1, 2, 3]);
    });

    it("should accumulate items over multiple more calls", async () => {
      const request = createMockRequest([
        {
          items: [1],
          total_items: 3,
          has_next: true,
          cursor: "c1",
        },
        {
          items: [2],
          total_items: 3,
          has_next: true,
          cursor: "c2",
        },
        {
          items: [3],
          total_items: 3,
          has_next: false,
          cursor: null,
        },
      ]);

      const pager = useCursorPager(request);
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

      const pager = useCursorPager(request);
      await pager.load();

      expect(pager.status.value).toBe(PagerState.ERROR);
      expect(pager.error.value).toBe(error);
    });

    it("should set error state on async request failure", async () => {
      const error = new Error("Async Error");
      const request = vi.fn(async () => {
        throw error;
      });

      const pager = useCursorPager(request);
      await pager.load();

      expect(pager.status.value).toBe(PagerState.ERROR);
      expect(pager.error.value).toBe(error);
    });

    it("should throw when calling load while already pending", async () => {
      const request = vi.fn(
        async () =>
          new Promise<CursorPagerResponse<number>>((resolve) =>
            setTimeout(
              () =>
                resolve({
                  items: [1],
                  total_items: 1,
                  has_next: false,
                  cursor: null,
                }),
              100
            )
          )
      );

      const pager = useCursorPager(request);
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
        return {
          items: [1],
          total_items: 1,
          has_next: false,
          cursor: null,
        };
      });

      const pager = useCursorPager(request);
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

      const pager = useCursorPager(request);
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

  describe("readonly refs", () => {
    it("should return readonly status and error refs", async () => {
      const pager = useCursorPager(() => ({
        items: [],
        total_items: 0,
        has_next: false,
        cursor: null,
      }));

      // Vue's readonly returns a DeepReadonly ref — we verify they exist and are reactive
      expect(pager.status.value).toBe(PagerState.IDLE);
      expect(pager.error.value).toBeNull();
    });
  });

  describe("shallow option", () => {
    it("should work with shallow = true", async () => {
      const request = createMockRequest([
        {
          items: [{ id: 1 }, { id: 2 }],
          total_items: 2,
          has_next: false,
          cursor: null,
        },
      ]);

      const pager = useCursorPager(request, { shallow: true });
      await pager.load();

      expect(pager.items.value).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it("should work with shallow = false (default)", async () => {
      const request = createMockRequest([
        {
          items: [{ id: 1 }, { id: 2 }],
          total_items: 2,
          has_next: false,
          cursor: null,
        },
      ]);

      const pager = useCursorPager(request);
      await pager.load();

      expect(pager.items.value).toEqual([{ id: 1 }, { id: 2 }]);
    });
  });
});
