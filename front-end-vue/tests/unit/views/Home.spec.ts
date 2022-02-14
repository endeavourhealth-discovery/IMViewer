import { shallowMount } from "@vue/test-utils";
import Home from "@/views/Home.vue";

describe("Home.vue ___ route = Concept", () => {
  let wrapper: any;
  let mockStore: any;
  let mockRouter: any;

  beforeEach(() => {
    mockStore = {
      state: { conceptIri: "test concept iri" },
      commit: jest.fn()
    };
    mockRouter = {
      push: jest.fn(),
      back: jest.fn()
    };
    wrapper = shallowMount(Home, {
      global: {
        mocks: { $router: mockRouter, $store: mockStore },
        stubs: ["router-link", "router-view"]
      }
    });
    jest.clearAllMocks();
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
  let wrapper: any;
  let mockStore: any;
  let mockRouter: any;

  beforeEach(() => {
    mockStore = {
      state: { conceptIri: "" },
      commit: jest.fn()
    };

    mockRouter = { push: jest.fn(), back: jest.fn() };
    wrapper = shallowMount(Home, {
      global: {
        mocks: { $router: mockRouter, $store: mockStore },
        stubs: ["router-link", "router-view"]
      }
    });
    jest.clearAllMocks();
  });

  it("updateRoute goes back on other routes", async () => {
    wrapper.vm.updateRoute();
    await wrapper.vm.$nextTick();
    expect(mockStore.commit).toBeCalledTimes(0);
    expect(mockRouter.back).toHaveBeenCalledTimes(1);
  });
});
