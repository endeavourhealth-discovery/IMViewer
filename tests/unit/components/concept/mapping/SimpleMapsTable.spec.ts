import {beforeEach, describe, expect, it, vi} from 'vitest';
import SimpleMaps from "@/components/concept/mapping/SimpleMaps.vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import {render, RenderResult, within} from '@testing-library/vue';
import PrimeVue from 'primevue/config';

describe("SimpleMapsTable.vue - populated", () => {
  const SIMPLE_MAP = [
    { name: "Concept 1", iri: "http://endhealth.info/im#concept1", scheme: "Concept 1 Scheme", code: "CODE1" },
    { name: "Concept 2", iri: "http://endhealth.info/im#concept2", scheme: "Concept 2 Scheme" }
  ];

  let component: RenderResult;

  beforeEach(() => {
    component = render(SimpleMaps, {
      global: {
        plugins: [PrimeVue],
        components: {DataTable, Column},
      },
      props: { data: SIMPLE_MAP }
    });
  });

  it("renders table", async () => {
    const dataTable = component.getByTestId("mapTable");

    const rows = within(dataTable).getAllByRole("row");

    expect(rows.length).toBe(5);  // 1 header, 2 groups, 2 rows

    // Header row
    let cells = within(rows[0]).getAllByRole("cell");
    expect(cells[0].textContent).toBe("Name")
    expect(cells[1].textContent).toBe("Code")

    // Scheme group 1
    cells = within(rows[1]).getAllByRole("cell");
    expect(cells[0].textContent).toBe(SIMPLE_MAP[0].scheme)
    expect(cells[1]).toBeFalsy()

    // Scheme group 1 content
    cells = within(rows[2]).getAllByRole("cell");
    expect(cells[0].textContent).toContain(SIMPLE_MAP[0].name)
    expect(cells[1].textContent).toContain(SIMPLE_MAP[0].code)

    // Scheme group 2
    cells = within(rows[3]).getAllByRole("cell");
    expect(cells[0].textContent).toBe(SIMPLE_MAP[1].scheme)
    expect(cells[1]).toBeFalsy()

    // Scheme group 2 content
    cells = within(rows[4]).getAllByRole("cell");
    expect(cells[0].textContent).toContain(SIMPLE_MAP[1].name)
  });

});


describe("SimpleMapsTable.vue - empty", () => {
  let component: RenderResult;

  beforeEach(() => {
    component = render(SimpleMaps, {
      global: {
        plugins: [PrimeVue],
        components: {DataTable, Column},
      },
      props: { data: [] }
    });
  });

  it("renders table", async () => {
    const dataTable = component.getByTestId("mapTable");

    const rows = within(dataTable).getAllByRole("row");

    expect(rows.length).toBe(2);  // 1 header, 2 groups, 2 rows

    // Header row
    let cells = within(rows[0]).getAllByRole("cell");
    expect(cells[0].textContent).toBe("Name")
    expect(cells[1].textContent).toBe("Code")

    // Scheme group 1
    cells = within(rows[1]).getAllByRole("cell");
    expect(cells[0].textContent).toBe(" No simple maps found. ")
    expect(cells[1]).toBeFalsy()
  });

});
