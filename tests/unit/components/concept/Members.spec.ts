import { beforeEach, describe, expect, it, vi } from "vitest";
import Members from "@/components/concept/Members.vue";
import { fireEvent, getByTestId, queryByTestId, render, RenderResult, within } from "@testing-library/vue";
import { flushPromises, RouterLinkStub } from "@vue/test-utils";
import testData from "./Members.testData.json";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import DataTable from "primevue/datatable";
import InputText from "primevue/inputtext";
import Checkbox from "primevue/checkbox";
import Column from "primevue/column";
import Button from "primevue/button";
import Menu from "primevue/menu";
import { createStore } from "vuex";
import { Services } from "im-library";
const { EntityService, SetService } = Services;

const mockPush = vi.fn();
const mockGo = vi.fn();
const mockRoute = { name: "Concept" };

vi.mock("vue-router", () => ({
  useRouter: () => ({
    push: mockPush,
    go: mockGo
  }),
  useRoute: () => mockRoute
}));

describe("Members.vue - populated", () => {
  let component: RenderResult;
  let mockStore: any;
  let getMembers: any;

  beforeEach(async () => {
    vi.resetAllMocks();

    mockStore = createStore({
      state: {
        isLoggedIn: false
      }
    });

    vi.spyOn(EntityService.prototype, "getEntityMembers").mockResolvedValue(testData);
    vi.spyOn(EntityService.prototype, "getFullExportSet").mockResolvedValue({ data: true });
    vi.spyOn(EntityService.prototype, "getPartialEntity").mockResolvedValue({ "http://www.w3.org/2000/01/rdf-schema#label": "Test Set" });
    vi.spyOn(EntityService.prototype, "getPartialAndTotalCount").mockResolvedValue({ totalCount: 11, result: [], pageSize: 10 });

    component = render(Members, {
      global: {
        plugins: [PrimeVue, ToastService, mockStore],
        components: { DataTable, InputText, Checkbox, Column, Button, Menu },
        stubs: {
          "router-link": RouterLinkStub
        }
      },
      props: { conceptIri: "http://endhealth.info/im#VSET_EthnicCategoryCEG16" }
    });

    await flushPromises();
  });

  it("does not display publish button", async () => {
    expect(component.queryByTestId("publishButton")).toBeFalsy();
  });

  it("displays download menu (no IMv1)", async () => {
    const downloadButton = component.getByTestId("downloadButton");
    await fireEvent.click(downloadButton);

    expect(queryByTestId(document.body, "menuWithPublish")).toBeFalsy();

    const menu = getByTestId(document.body, "menuWithoutPublish");
    const menuItems = within(menu).getAllByRole("menuitem");
    expect(menuItems.length).toBe(4);
  });

  it("downloads", async () => {
    const dl = vi.spyOn(window.URL, "createObjectURL").mockImplementation(() => {
      return "/#download";
    });

    const downloadButton = component.getByTestId("downloadButton");
    await fireEvent.click(downloadButton);

    const menu = getByTestId(document.body, "menuWithoutPublish");
    const downloadV1 = within(menu).getByText("Definition Only");
    await fireEvent.click(downloadV1);
    await flushPromises();

    expect(window.location.href).toBe("http://localhost/#download");
  });

  it("can load more", async () => {
    const table = component.getByTestId("table");

    expect(table.textContent).toContain("Load more...");
    const loadMore = within(table).getByText("Load more...");
    await fireEvent.click(loadMore);
  });
});

describe("Members.vue - publish", () => {
  let component: RenderResult;
  let mockStore: any;
  let publishMock: any;
  let imV1Mock: any;

  beforeEach(async () => {
    vi.resetAllMocks();

    mockStore = createStore({
      state: {
        isLoggedIn: true,
        currentUser: {
          roles: ["IM1_PUBLISH"]
        }
      }
    });

    publishMock = vi.spyOn(SetService.prototype, "publish").mockResolvedValue(true);
    imV1Mock = vi.spyOn(SetService.prototype, "IMV1").mockResolvedValue(true);

    vi.spyOn(EntityService.prototype, "getEntityMembers").mockResolvedValue(testData);
    vi.spyOn(EntityService.prototype, "getFullExportSet").mockResolvedValue({ data: true });
    vi.spyOn(EntityService.prototype, "getPartialEntity").mockResolvedValue({ "http://www.w3.org/2000/01/rdf-schema#label": "Test Set" });
    vi.spyOn(EntityService.prototype, "getPartialAndTotalCount").mockResolvedValue({ totalCount: 11, result: [], pageSize: 10 });

    component = render(Members, {
      global: {
        plugins: [PrimeVue, ToastService, mockStore],
        components: { DataTable, InputText, Checkbox, Column, Button, Menu },
        stubs: {
          "router-link": RouterLinkStub
        }
      },
      props: { conceptIri: "http://endhealth.info/im#VSET_EthnicCategoryCEG16" }
    });

    await flushPromises();
  });

  it("displays publish button", async () => {
    component.getByTestId("publishButton");
  });

  it("displays download menu (with IMv1)", async () => {
    const downloadButton = component.getByTestId("downloadButton");
    await fireEvent.click(downloadButton);

    expect(queryByTestId(document.body, "menuWithoutPublish")).toBeFalsy();

    const menu = getByTestId(document.body, "menuWithPublish");
    const menuItems = within(menu).getAllByRole("menuitem");
    expect(menuItems.length).toBe(5);
  });

  it("publishes", async () => {
    const publish = component.getByTestId("publishButton");
    await fireEvent.click(publish);

    expect(publishMock).toHaveBeenCalledOnce();
  });

  it("downloads IMv1", async () => {
    const downloadButton = component.getByTestId("downloadButton");
    await fireEvent.click(downloadButton);

    const menu = getByTestId(document.body, "menuWithPublish");
    const downloadV1 = within(menu).getByText("IMv1");
    await fireEvent.click(downloadV1);

    expect(imV1Mock).toHaveBeenCalledOnce();
  });
});
