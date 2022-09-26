import {beforeEach, describe, expect, it, vi} from 'vitest';
import EntityChart from "@/components/concept/EntityChart.vue";
import ProgressSpinner from "primevue/progressspinner";
import OrganizationChart from "primevue/organizationchart";
import {fireEvent, render, RenderResult} from '@testing-library/vue';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import { Services } from "im-library";
const { EntityService } = Services;
import GRAPH from "./EntityChart.testData.json";

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

describe("EntityChart.vue", () => {
  vi.spyOn(EntityService.prototype, "getEntityGraph").mockResolvedValue(GRAPH);

  let component: RenderResult;

  beforeEach(async () => {
    component = render(EntityChart, {
      global: {
        plugins: [PrimeVue, ToastService],
        components: { ProgressSpinner, OrganizationChart },
      },
      props: { conceptIri: GRAPH.iri }
    });
  })

  it("Displays entity chart", async () => {
    const orgChart = component.getByTestId("orgChart");
    expect(orgChart.textContent).toContain(GRAPH.name);
  });

  it("Displays IS A's", async () => {
    const isA = component.getByTestId("isA");
    expect(isA.textContent).toContain(GRAPH.children[0].children[0].leafNodes[0].name);
  });

  it("Displays SubTypes", async () => {
    const subtype = component.getByTestId("subtype");
    expect(subtype.textContent).toContain(GRAPH.children[1].children[0].leafNodes[0].name);
  });

  it("Displays Properties", async () => {
    const properties = component.getAllByTestId("properties");

    // Semantic
    expect(properties[0].textContent).toContain(GRAPH.children[2].children[0].leafNodes[0].name);

    // Data Model
    for(let dmProp of GRAPH.children[3].children[0].children[0].leafNodes)
      expect(properties[1].textContent, "Property " + dmProp.name).toContain(dmProp.name);

    // Inherited
    for(let inherited of GRAPH.children[3].children[1].children[0].leafNodes)
      expect(properties[2].textContent, "Inherited " + inherited.name).toContain(inherited.name);
  });

  it("navigates to concept", async () => {
    const isA = component.getByText(GRAPH.children[0].children[0].leafNodes[0].name);
    await fireEvent.click(isA);
    expect(mockPush).toHaveBeenCalledOnce();
    expect(mockPush).toHaveBeenCalledWith({
      "name": "Concept",
      "params": {
        "selectedIri": GRAPH.children[0].children[0].leafNodes[0].iri,
      },
    });
  });
});
