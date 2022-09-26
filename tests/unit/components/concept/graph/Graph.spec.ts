import { beforeEach, describe, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import {render, fireEvent, RenderResult, within} from '@testing-library/vue';

import Graph from "@/components/concept/graph/Graph.vue";
import ProgressSpinner from "primevue/progressspinner";
import MultiSelect from "primevue/multiselect";
import { Services } from "im-library";
const { EntityService } = Services;

import testData from "./Graph.testData.json"
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import Toast from "primevue/toast";

describe("Graph.vue", () => {
  // Spies
  vi.spyOn(EntityService.prototype, "getBundleByPredicateExclusions").mockResolvedValue(testData.getBundleByPredicateExclusions);
  vi.spyOn(EntityService.prototype, "getPartialAndTotalCount").mockResolvedValue(testData.getPartialAndTotalCount);

  let component: RenderResult;

  beforeEach(() => {
    component = render(Graph, {
      global: {
        plugins: [PrimeVue, ToastService],
        components: {ProgressSpinner, MultiSelect, Toast},
        provide: {PrimeVueToastSymbol: vi.fn()},
        stubs: {
          GraphComponent: true
        }
      },
      props: {conceptIri: "http://snomed.info/sct#298382003"}
    });
  });

  it("selected predicates", async () => {
    await flushPromises();

    const multiSelect = component.getByTestId("selectedPredicates");
    await fireEvent.click(multiSelect);

    const optionItems: HTMLElement[] = await component.findAllByRole("option");
    await fireEvent.click(optionItems[0]);

    // Check GraphComponent is updated
  });
});

