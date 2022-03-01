import { shallowMount } from "@vue/test-utils";
import Home from "@/views/Home.vue";
import { beforeEach, describe, expect, it, vi } from "vitest";

// @vitest-environment jsdom

describe("Home.vue ___ route = Concept", () => {
  let wrapper;
  let mockStore;
  let mockRouter;

  beforeEach(() => {
    mockStore = {
      state: { conceptIri: "test concept iri" },
      commit: vi.fn()
    };
    mockRouter = {
      push: vi.fn(),
      back: vi.fn()
    };
    wrapper = shallowMount(Home, {
      global: {
        mocks: { $router: mockRouter, $store: mockStore },
        stubs: ["router-link", "router-view"]
      }
    });
    vi.clearAllMocks();
  });

  it("should updateRoute ___ Concept", async () => {
    wrapper.vm.updateRoute();
    await wrapper.vm.$nextTick();
    expect(mockStore.commit).toBeCalledTimes(1);
    expect(mockStore.commit).toBeCalledWith("updateConceptIri", "test concept iri");
    expect(mockRouter.push).toHaveBeenCalledTimes(1);
    expect(mockRouter.push).toHaveBeenCalledWith({ name: "Concept", params: { selectedIri: "test concept iri" } });
  });
});

describe("Home.vue ___ route = Other", () => {
  let wrapper;
  let mockStore;
  let mockRouter;

  beforeEach(() => {
    mockStore = {
      state: { conceptIri: "" },
      commit: vi.fn()
    };

    mockRouter = { push: vi.fn(), back: vi.fn() };
    wrapper = shallowMount(Home, {
      global: {
        mocks: { $router: mockRouter, $store: mockStore },
        stubs: ["router-link", "router-view"]
      }
    });
    vi.clearAllMocks();
  });

  it("updateRoute goes back on other routes", async () => {
    wrapper.vm.updateRoute();
    await wrapper.vm.$nextTick();
    expect(mockStore.commit).toBeCalledTimes(0);
    expect(mockRouter.back).toHaveBeenCalledTimes(1);
  });
});
