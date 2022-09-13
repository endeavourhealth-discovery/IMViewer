import { shallowMount } from "@vue/test-utils";
import Home from "@/views/Home.vue";
import { setupServer } from "msw/node";
import { describe } from "vitest";

describe("Home.vue", () => {
  const restHandlers = [];
  const server = setupServer(...restHandlers);

  beforeAll(() => {
    server.listen({ onUnhandledRequest: "error" });
  });

  afterAll(() => {
    server.close();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe("route = Concept", () => {
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
      expect(mockRouter.push).toHaveBeenCalledTimes(1);
      expect(mockRouter.push).toHaveBeenCalledWith({ name: "Concept", params: { selectedIri: "test concept iri" } });
    });
  });

  describe("route = Other", () => {
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
      expect(mockRouter.back).toHaveBeenCalledTimes(1);
    });
  });
});
