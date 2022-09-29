import {beforeEach, describe, expect, it, vi} from 'vitest';
import { Services } from "im-library";
const { EntityService } = Services;

import UsedIn from "@/components/concept/UsedIn.vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import {fireEvent, render, RenderResult, within} from '@testing-library/vue';
import testData from './UsedIn.testData.json';
import {flushPromises} from '@vue/test-utils';

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

describe("UsedIn.vue", () => {
  let component: RenderResult;
  let getUsages: any;

  beforeEach(async () => {
    vi.resetAllMocks();

    getUsages = vi.spyOn(EntityService.prototype, "getEntityUsages").mockResolvedValue(testData.USAGES);
    vi.spyOn(EntityService.prototype, "getUsagesTotalRecords").mockResolvedValue(50);

    component = render(UsedIn, {
      global: {
        components: { DataTable, Column }
      },
      props: { conceptIri: "http://snomed.info/sct#298382003" }
    });

    await flushPromises();
  });

  it("renders used-in", async () => {
    const table = component.getByTestId("table");

    for(const usage of testData.USAGES)
      expect(table.textContent).toContain(usage["http://www.w3.org/2000/01/rdf-schema#label"]);
  });

  it("pages the table", async () => {
    const table = component.getByTestId("table");

    expect(getUsages).toHaveBeenCalledOnce();

    const page2 = within(table).getByText("2");
    await fireEvent.click(page2);

    expect(getUsages).toHaveBeenCalledTimes(2);
  });

  it("navigates on selection", async () => {
    const table = component.getByTestId("table");

    expect(mockPush).not.toHaveBeenCalled();

    const rows = within(table).getAllByRole("row");
    await fireEvent.click(rows[1]);

    expect(mockPush).toHaveBeenCalledOnce();
  });
});
