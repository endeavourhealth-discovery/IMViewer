import {beforeEach, describe, it, vi, expect, SpyInstance} from 'vitest';
import {flushPromises} from '@vue/test-utils';
import {render, RenderResult, within} from '@testing-library/vue';

import { Services } from "im-library";
const { EntityService, ConfigService } = Services;

import Concept from "@/views/Concept.vue";
import Menu from "primevue/menu";
import Button from "primevue/button";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import ProgressSpinner from "primevue/progressspinner";
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";
import Panel from "primevue/panel";
import testData from './Concept.testData.json';
import ToastService from 'primevue/toastservice';
import PrimeVue from 'primevue/config';
import {createStore} from 'vuex';

Object.assign(navigator, {
  clipboard: {
    writeText: () => {}
  }
});

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

describe("Concept.vue", () => {
  let component: RenderResult;
  let mockMenu: any;
  let store: any;
  let getPartial: SpyInstance;

  beforeEach(async () => {
    vi.resetAllMocks();

    getPartial = vi.spyOn(EntityService.prototype, "getPartialEntity").mockResolvedValue(testData.CONCEPT);
    vi.spyOn(EntityService.prototype, "getDefinitionBundle").mockResolvedValue(testData.INFERRED);
    vi.spyOn(EntityService.prototype, "getPartialAndTotalCount").mockResolvedValue(testData.MEMBERS);
    vi.spyOn(EntityService.prototype, "getPagedChildren").mockResolvedValue(testData.CHILDREN);
    vi.spyOn(EntityService.prototype, "getEntityTermCodes").mockResolvedValue(testData.TERMS);

    vi.spyOn(ConfigService.prototype, "getComponentLayout").mockResolvedValue(testData.CONFIG);

    mockMenu = { render: () => {}, methods: { toggle: vi.fn(), show: vi.fn(), hide: vi.fn() } };

    window.HTMLElement.prototype.scrollIntoView = vi.fn();

    store = createStore({
      state: {
        conceptIri: "http://endhealth.info/im#CriticalCareEncounter",
        selectedEntityType: "Class",
        activeModule: "default",
        conceptActivePanel: 6
      },
      mutations: {
        updateConceptIri: (state, value) => { state.conceptIri = value },
        updateSelectedEntityType: (state, value) => { state.selectedEntityType = value },
        updateConceptActivePanel: (state, value) => { state.conceptActivePanel = value }
      }
    });

    component = render(Concept, {
      global: {
        components: {
          Menu,
          Button,
          TabPanel,
          TabView,
          Panel,
          ProgressSpinner,
          Splitter,
          SplitterPanel,
        },
        plugins: [PrimeVue, ToastService, store],
        directives: { tooltip: vi.fn() },
        stubs: { Panel: Panel, Menu: mockMenu, FontAwesomeIcon: true,
          SecondaryTree: true,
          TopBar: true,
          TermCodeTable: true,
          TextSectionHeader: true,
          ProfileDisplay: true,
          QueryDefinition: true,
          QueryText: true,
          Definition: true,
          Properties: true
        }
      },
    });

    await flushPromises();
  });

  it("renders sub components", async () => {
    expect(document.body.getElementsByTagName("top-bar-stub").length).toBe(1);
    expect(document.body.getElementsByTagName("definition-stub").length).toBe(2);
    expect(document.body.getElementsByTagName("secondary-tree-stub").length).toBe(1);
    expect(document.body.getElementsByTagName("properties-stub").length).toBe(0);
  });

  it("switches tab on type change", async () => {
    const tabPanel = component.getByTestId("tabPanel");
    let tabs = within(tabPanel).getAllByRole("tab");

    expect(tabPanel.textContent).toContain("Details")
    expect(tabs[0].getAttribute("aria-selected")).toBe("true")
    expect(tabPanel.textContent).not.toContain("Properties")
    expect(document.body.getElementsByTagName("properties-stub").length).toBe(0);

    getPartial.mockResolvedValue(testData.DATAMODEL);
    await store.commit('updateConceptIri', 'http://endhealth.info/im#dataModel');
    await flushPromises();

    tabs = within(tabPanel).getAllByRole("tab");
    expect(tabs[0].textContent).toContain("Details")
    expect(tabs[0].getAttribute("aria-selected")).toBe("false")
    expect(tabs[3].textContent).toContain("Properties")
    expect(tabs[3].getAttribute("aria-selected")).toBe("true");
    expect(document.body.getElementsByTagName("properties-stub").length).toBe(1);
  });
});
