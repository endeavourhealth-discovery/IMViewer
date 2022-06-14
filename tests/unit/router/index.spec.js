import router from "@/router/index";
import App from "@/App.vue";
import Toast from "primevue/toast";
import store from "@/store/index";
import { flushPromises, shallowMount } from "@vue/test-utils";
import { vi } from "vitest";
import { Services } from "im-library";
const { Env } = Services;

vi.mock("@/main", () => {
  return {
    default: {
      $entityService: {
        iriExists: vi.fn()
      },
      $env: { AUTH_URL: "" }
    }
  };
});

import vm from "@/main";

describe("router", () => {
  beforeEach(() => {
    console.log = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });
  describe("router ___ no snomed", () => {
    let wrapper;

    beforeEach(async () => {
      vi.resetAllMocks();
      window.sessionStorage.clear();
      store.commit("updateSnomedLicenseAccepted", "false");
      store.dispatch = vi.fn().mockResolvedValue({ authenticated: false });
      router.push("/");
      await router.isReady();

      wrapper = shallowMount(App, {
        global: {
          components: { Toast },
          plugins: [router, store]
        }
      });

      await flushPromises();
      await wrapper.vm.$nextTick();
      vi.clearAllMocks();
    });

    it("routes to snomedLicense if snomedAccepted ___ false", () => {
      expect(wrapper.vm.$route.path).toBe("/snomedLicense");
      store.commit("updateSnomedLicenseAccepted", "true");
    });
  });

  describe("router ___ snomed", () => {
    let wrapper;

    beforeEach(async () => {
      vi.resetAllMocks();
      window.sessionStorage.clear();
      store.commit("updateSnomedLicenseAccepted", "true");
      store.dispatch = vi.fn().mockResolvedValue({ authenticated: false });
      router.push("/");
      await router.isReady();

      wrapper = shallowMount(App, {
        global: {
          components: { Toast },
          plugins: [router, store]
        }
      });

      await flushPromises();
      await wrapper.vm.$nextTick();
      vi.clearAllMocks();
    });

    it("routes to home if snomedAccepted ___ true", () => {
      expect(wrapper.vm.$route.path).toBe("/");
    });
  });

  // describe("router ___ no auth", () => {
  //   let wrapper;

  //   beforeEach(async () => {
  //     vi.resetAllMocks();
  //     window.sessionStorage.clear();
  //     store.state.snomedLicenseAccepted = "true";
  //     store.dispatch = vi.fn().mockResolvedValue({ authenticated: false });
  //     router.push("/");
  //     await router.isReady();

  //     wrapper = shallowMount(App, {
  //       global: {
  //         components: { Toast },
  //         plugins: [router, store]
  //       }
  //     });

  //     await flushPromises();
  //     await wrapper.vm.$nextTick();
  //     vi.clearAllMocks();
  //   });

  //   it("routes to login if false", async () => {
  //     router.push({ name: "UserEdit" });
  //     await flushPromises();
  //     expect(wrapper.vm.$route.path).toBe("/user/login");
  //   });
  // });

  // describe("router ___ auth", () => {
  //   let wrapper;

  //   beforeEach(async () => {
  //     vi.resetAllMocks();
  //     window.sessionStorage.clear();
  //     store.state.snomedLicenseAccepted = "true";
  //     store.dispatch = vi.fn().mockResolvedValue({ authenticated: true });
  //     router.push("/");
  //     await router.isReady();

  //     wrapper = shallowMount(App, {
  //       global: {
  //         components: { Toast },
  //         plugins: [router, store]
  //       }
  //     });

  //     await flushPromises();
  //     await wrapper.vm.$nextTick();
  //     vi.clearAllMocks();
  //   });

  //   it("routes to login if false", async () => {
  //     router.push({ name: "UserEdit" });
  //     await flushPromises();
  //     expect(wrapper.vm.$route.path).toBe("/user/my-account/edit");
  //   });
  // });

  describe("router ___ blockedIri", () => {
    let wrapper;

    beforeEach(async () => {
      vi.resetAllMocks();
      window.sessionStorage.clear();
      store.state.snomedLicenseAccepted = "true";
      store.state.blockedIris = ["http://www.w3.org/2001/XMLSchema#string"];
      store.dispatch = vi.fn().mockResolvedValue({ authenticated: true });
      router.push("/");
      await router.isReady();

      wrapper = shallowMount(App, {
        global: {
          components: { Toast },
          plugins: [router, store]
        }
      });

      await flushPromises();
      await wrapper.vm.$nextTick();
      vi.clearAllMocks();
    });

    it("doesn't route if iri is blocked", async () => {
      router.push({ name: "Concept", params: { selectedIri: "http://www.w3.org/2001/XMLSchema#string" } });
      await flushPromises();
      expect(wrapper.vm.$route.path).toBe("/");
    });
  });

  describe("router ___ concept", () => {
    let wrapper;

    beforeEach(async () => {
      vi.resetAllMocks();
      window.sessionStorage.clear();
      store.state.snomedLicenseAccepted = "true";
      store.commit = vi.fn();
      store.dispatch = vi.fn().mockResolvedValue({ authenticated: true });
      vm.$entityService.iriExists = vi.fn().mockResolvedValue(true);
      router.push("/");
      await router.isReady();

      wrapper = shallowMount(App, {
        global: {
          components: { Toast },
          plugins: [router, store]
        }
      });

      await flushPromises();
      await wrapper.vm.$nextTick();
      vi.clearAllMocks();
    });

    it("updates conceptIri on concept routing", async () => {
      router.push({ name: "Concept", params: { selectedIri: "http://snomed.info/sct#298382003" } });
      await flushPromises();
      expect(store.commit).toHaveBeenCalledTimes(4);
      expect(store.commit).toHaveBeenLastCalledWith("updateConceptIri", "http://snomed.info/sct#298382003");
      expect(wrapper.vm.$route.path).toBe("/concept/http:%2F%2Fsnomed.info%2Fsct%23298382003");
    });
  });
});
