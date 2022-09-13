import { flushPromises, shallowMount } from "@vue/test-utils";
import App from "@/App.vue";
import Toast from "primevue/toast";
import ProgressSpinner from "primevue/progressspinner";
import { setupServer } from "msw/node";

describe("App.vue", () => {
  let wrapper;
  let mockStore;

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

  beforeEach(() => {
    vi.resetAllMocks();
    mockStore = {
      state: { historyCount: 1 },
      commit: vi.fn(),
      dispatch: vi.fn()
    };
    wrapper = shallowMount(App, {
      global: {
        components: { Toast, ProgressSpinner },
        stubs: ["router-link", "router-view"],
        mocks: { $store: mockStore }
      }
    });
  });

  it("should check auth and update store history count on mount", async () => {
    await flushPromises();
    expect(mockStore.dispatch).toHaveBeenCalledTimes(1);
    expect(mockStore.dispatch).toHaveBeenCalledWith("authenticateCurrentUser");
  });
});
