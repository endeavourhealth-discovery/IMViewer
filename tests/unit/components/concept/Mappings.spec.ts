import {beforeEach, describe, expect, it, vi} from 'vitest';
import testData from "./Mappings.testData.json";

import Mappings from "@/components/concept/Mappings.vue";
import SimpleMaps from "@/components/concept/mapping/SimpleMaps.vue";
import ProgressSpinner from "primevue/progressspinner";
import OrganizationChart from "primevue/organizationchart";
import OverlayPanel from "primevue/overlaypanel";
import {fireEvent, render, RenderResult} from '@testing-library/vue';
import { Services } from "im-library";
import {flushPromises} from '@vue/test-utils';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import PrimeVue from 'primevue/config';
const { EntityService } = Services;

describe("Mappings.vue - populated", () => {
  let component: RenderResult;

  beforeEach(async () => {
    vi.resetAllMocks();

    vi.spyOn(EntityService.prototype, "getPartialEntity").mockResolvedValue(testData.HAS_MAPS);
    vi.spyOn(EntityService.prototype, "getNamespaces").mockResolvedValue(testData.NAMESPACES);
    vi.spyOn(EntityService.prototype, "getMatchedFrom").mockResolvedValue(testData.MATCHED_FROM);
    vi.spyOn(EntityService.prototype, "getMatchedTo").mockResolvedValue(testData.MATCHED_TO);

    component = render(Mappings, {
      global: {
        plugins: [PrimeVue],
        components: { ProgressSpinner, OrganizationChart, OverlayPanel, SimpleMaps, DataTable, Column },
      },
      props: { conceptIri: "http://snomed.info/sct#723312009" }
    });

    await flushPromises();
  });

  it("displays mappings", async () => {
    component.getByTestId("mappings");
  });

  it("displays Has Map", async () => {
    const hasMap = component.getAllByTestId("hasMap");
    expect(hasMap[0].textContent).toContain(testData.HAS_MAPS['http://endhealth.info/im#hasMap'][0]["http://endhealth.info/im#combinationOf"][0]["http://endhealth.info/im#oneOf"][0]["http://endhealth.info/im#mappedTo"][0].name);
    expect(hasMap[1].textContent).toContain(testData.HAS_MAPS['http://endhealth.info/im#hasMap'][0]["http://endhealth.info/im#combinationOf"][1]["http://endhealth.info/im#someOf"][0]["http://endhealth.info/im#mappedTo"][0].name);
  });

  it("displays Matched From", async () => {
    const matchedFrom = component.getAllByTestId("matchedFrom");
    expect(matchedFrom[0].textContent).toContain(testData.MATCHED_FROM[0].name);
    expect(matchedFrom[0].textContent).toContain(testData.MATCHED_FROM[1].name);
  });

  it("displays Matched To", async () => {
    const matchedTo = component.getAllByTestId("matchedTo");
    expect(matchedTo[0].textContent).toContain(testData.MATCHED_TO[0].name);
  });

  it("displays & hides overlay", async () => {
    const matches = component.getAllByTestId("col-name");
    let overlay = component.queryByTestId("matchedFromOverlay");
    expect(overlay, "Initially hidden").toBeFalsy();
    await fireEvent.mouseEnter(matches[0]);

    overlay = component.getByTestId("matchedFromOverlay");
    expect(overlay.textContent, "Overlay content").toContain(testData.MATCHED_FROM[0].code)

    await fireEvent.mouseLeave(matches[0]);
    overlay = component.queryByTestId("matchedFromOverlay");
    expect(overlay, "Hides on mouseLeave").toBeFalsy();
  });
});

describe("Mappings.vue - no maps", () => {
  let component: RenderResult;

  beforeEach(async () => {
    vi.resetAllMocks();

    vi.spyOn(EntityService.prototype, "getPartialEntity").mockResolvedValue({ "http://endhealth.info/im#hasMap": []});
    vi.spyOn(EntityService.prototype, "getNamespaces").mockResolvedValue(testData.NAMESPACES);
    vi.spyOn(EntityService.prototype, "getMatchedFrom").mockResolvedValue([]);
    vi.spyOn(EntityService.prototype, "getMatchedTo").mockResolvedValue([]);

    component = render(Mappings, {
      global: {
        plugins: [PrimeVue],
        components: { ProgressSpinner, OrganizationChart, OverlayPanel, SimpleMaps, DataTable, Column },
      },
      props: { conceptIri: "http://snomed.info/sct#723312009" }
    });

    await flushPromises();
  });

  it("displays mappings", async () => {
    component.getByTestId("mappings");
  });

  it("does not display Has Map", async () => {
    const hasMap = component.queryByTestId("hasMap");
    expect(hasMap).toBeFalsy();
  });
});
