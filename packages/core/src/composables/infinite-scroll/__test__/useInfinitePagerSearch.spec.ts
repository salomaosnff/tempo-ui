import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { ref, watch } from "vue";
import { PagerState } from "../../pager/pager";

// Define mocks before importing the composable
vi.mock("@vueuse/core", async (importOriginal) => {
  const original = await importOriginal<typeof import("@vueuse/core")>();
  return {
    ...original,
    useInfiniteScroll: vi.fn(() => ({
      pause: vi.fn(),
      resume: vi.fn(),
      isActive: ref(true),
    })),
    watchDebounced: vi.fn((source, cb, options) => {
      let timeout: any;
      return watch(
        source,
        (val: any) => {
          if (timeout) clearTimeout(timeout);
          timeout = setTimeout(() => cb(val), options.debounce);
        },
        { immediate: options.immediate },
      );
    }),
  };
});

// Mock the internal hook useInfinitePager to verify parameters
vi.mock("../useInfinitePager", () => ({
  useInfinitePager: vi.fn((pager, _element, _options) => ({
    pager,
    scroll: { pause: vi.fn(), resume: vi.fn(), isActive: ref(true) },
  })),
}));

// Now import the composable
import { useInfinitePagerSearch } from "../useInfinitePagerSearch";
import { useInfinitePager } from "../useInfinitePager";

describe("useInfinitePagerSearch", () => {
  let mockPager: any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    mockPager = {
      items: ref([]),
      status: ref(PagerState.IDLE),
      error: ref(null),
      hasNext: ref(true),
      load: vi.fn(),
      next: vi.fn(),
      more: vi.fn(),
    };
  });

  it("should initialize search ref with initialValue", () => {
    const { search } = useInfinitePagerSearch(mockPager, {} as any, { initialValue: "hello" });
    expect(search.value).toBe("hello");
  });

  it("should call useInfinitePager correctly with immediate: false", () => {
    const options = { infinitePagerOptions: { threshold: 100 } };
    useInfinitePagerSearch(mockPager, "mock-element" as any, options as any);

    expect(useInfinitePager).toHaveBeenCalledWith(
      mockPager,
      "mock-element",
      expect.objectContaining({
        threshold: 100,
        immediate: false,
      }),
    );
  });

  it("should call pager.load with search parameter immediately (immediate true)", () => {
    useInfinitePagerSearch(mockPager, {} as any, { initialValue: "query", immediate: true });

    // watchDebounced schedules the call even with immediate: true
    vi.advanceTimersByTime(400);

    expect(mockPager.load).toHaveBeenCalledWith({ search: "query" });
  });

  it("should call pager.load with search parameter immediately by default (immediate undefined)", () => {
    useInfinitePagerSearch(mockPager, {} as any, { initialValue: "default" });

    vi.advanceTimersByTime(400);

    expect(mockPager.load).toHaveBeenCalledWith({ search: "default" });
  });

  it("should NOT call pager.load immediately if immediate is false", () => {
    useInfinitePagerSearch(mockPager, {} as any, { immediate: false });
    expect(mockPager.load).not.toHaveBeenCalled();
  });

  it("should call pager.load when search changes (after debounce)", async () => {
    const { search } = useInfinitePagerSearch(mockPager, {} as any, {
      immediate: false,
      debounceOptions: { debounce: 400 },
    });

    search.value = "new search";
    await Promise.resolve();

    // Verify it doesn't call immediately
    expect(mockPager.load).not.toHaveBeenCalled();

    // Advance timers
    vi.advanceTimersByTime(400);

    expect(mockPager.load).toHaveBeenCalledWith({ search: "new search" });
  });

  it("should debounce multiple search changes", async () => {
    const { search } = useInfinitePagerSearch(mockPager, {} as any, {
      immediate: false,
      debounceOptions: { debounce: 400 },
    });

    search.value = "a";
    await Promise.resolve();
    vi.advanceTimersByTime(200);
    search.value = "ab";
    await Promise.resolve();
    vi.advanceTimersByTime(200);
    search.value = "abc";
    await Promise.resolve();

    expect(mockPager.load).not.toHaveBeenCalled();

    vi.advanceTimersByTime(400);

    expect(mockPager.load).toHaveBeenCalledTimes(1);
    expect(mockPager.load).toHaveBeenCalledWith({ search: "abc" });
  });
});
