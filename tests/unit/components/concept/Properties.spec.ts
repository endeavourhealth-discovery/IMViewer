import {beforeEach, describe, expect, it, vi} from 'vitest';
import { Services } from "im-library";
const { EntityService } = Services;

import Properties from "@/components/concept/Properties.vue";
import DataTable from "primevue/datatable";
import Button from "primevue/button";
import Column from "primevue/column";
import testData from "./Properties.testData.json";
import {fireEvent, render, RenderResult, within} from '@testing-library/vue';

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

describe("Properties.vue", () => {

  let component: RenderResult;

  beforeEach(async () => {
    vi.resetAllMocks();

    vi.spyOn(EntityService.prototype, "getDataModelProperties").mockResolvedValue(testData);

    component = render(Properties, {
      global: {
        components: { DataTable, Column, Button },
      },
      props: { conceptIri: "http://endhealth.info/im#Immunisation" }
    });
  });

  it("renders the properties", async () => {
    const table = component.getByTestId("table");

    for(const prop of testData)
      expect(table.textContent).toContain(prop.property.name);
  });

  it("navigates when clicked", async () =>{
    const table = component.getByTestId("table");
    const names = within(table).getAllByTestId("name");

    expect(mockPush).toHaveBeenCalledTimes(0);
    await fireEvent.click(names[0]);
    expect(mockPush).toHaveBeenCalledOnce();
    expect(mockPush).toHaveBeenCalledWith(
      {
        "name": "Concept",
        "params": {
          "selectedIri": testData[0].property['@id']
        }
      }
    );
  });
});
  /*









  let wrapper;
  let mockRouter;
  let mockRoute;
  let mockRef;
  let docSpy;
  let mockEntityService;

  beforeEach(async () => {
    vi.resetAllMocks();

    mockRouter = {
      push: vi.fn()
    };

    mockRoute = {
      name: "Concept"
    };

    mockRef = { render: () => {}, methods: { exportCSV: vi.fn() } };

    docSpy = vi.spyOn(document, "getElementById");
    docSpy.mockReturnValue(undefined);

    mockEntityService = {
      getDataModelProperties: vi.fn().mockResolvedValue(testData)
    };

    const error = console.error;
    console.error = vi.fn();

    wrapper = shallowMount(Properties, {
      global: {
        components: { DataTable, Column, Button },
        mocks: { $router: mockRouter, $route: mockRoute, $entityService: mockEntityService },
        stubs: { DataTable: mockRef }
      },
      props: { conceptIri: "http://endhealth.info/im#Immunisation" }
    });

    await flushPromises();
    await wrapper.vm.$nextTick();
    vi.clearAllMocks();

    console.error = error;
  });

  it("adds event listener to setScrollHeight on resize", async () => {
    wrapper.vm.setScrollHeight = vi.fn();
    window.dispatchEvent(new Event("resize"));
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.setScrollHeight).toHaveBeenCalledTimes(1);
  });

  it("can remove eventListener", () => {
    const spy = vi.spyOn(window, "removeEventListener");
    wrapper.unmount();
    expect(spy).toHaveBeenCalled();
    spy.mockReset();
  });

  it("sets scrollHeight ___ container fail", async () => {
    wrapper.vm.setScrollHeight();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.scrollHeight).toBe("");
  });

  it("sets scrollHeight ___ container success", async () => {
    const mockElement = document.createElement("div");
    mockElement.getBoundingClientRect = vi.fn().mockReturnValue({ height: 100 });
    mockElement.getElementsByClassName = vi.fn().mockReturnValue([mockElement]);
    docSpy.mockReturnValue(mockElement);
    wrapper.vm.setScrollHeight();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.scrollHeight).not.toBe("500px");
    docSpy.mockReset();
    vi.clearAllMocks();
  });

  it("sets scrollHeight ___ container no paginator", async () => {
    const mockElement = document.createElement("div");
    mockElement.getBoundingClientRect = vi.fn().mockReturnValue({ height: 100 });
    mockElement.getElementsByClassName = vi.fn().mockReturnValue([null]);
    docSpy.mockReturnValue(mockElement);
    wrapper.vm.setScrollHeight();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.scrollHeight).not.toBe("500px");
    docSpy.mockReset();
    vi.clearAllMocks();
  });

  it("getsDataModelProps on conceptIri change", async () => {
    wrapper.vm.getDataModelProps = vi.fn();
    wrapper.vm.$options.watch.conceptIri.call(wrapper.vm, "http://endhealth.info/im#DiscoveryOntology");
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.getDataModelProps).toHaveBeenCalledTimes(1);
  });

  it("can resize", () => {
    wrapper.vm.setScrollHeight = vi.fn();
    wrapper.vm.onResize();
    expect(wrapper.vm.setScrollHeight).toHaveBeenCalledTimes(1);
  });

  it("can getDataModelProps", async () => {
    wrapper.vm.getDataModelProps();
    expect(wrapper.vm.loading).toBe(true);
    await flushPromises();
    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.dataModelPropsData).toStrictEqual([
      {
        propertyId: "http://endhealth.info/im#manufacturer",
        propertyName: "manufacturer",
        propertyDisplay: "manufacturer",
        typeId: "http://endhealth.info/im#Concept",
        typeName: "Concept",
        typeDisplay: "Concept",
        inheritedId: undefined,
        inheritedName: undefined,
        inheritedDisplay: "-",
        cardinality: "0 : *"
      },
      {
        propertyId: "http://endhealth.info/im#reaction",
        propertyName: "reaction",
        propertyDisplay: "reaction",
        typeId: "http://endhealth.info/im#Concept",
        typeName: "Concept",
        typeDisplay: "Concept",
        inheritedId: undefined,
        inheritedName: "InheritedParent",
        inheritedDisplay: "InheritedParent",
        cardinality: "1 : *"
      },
      {
        propertyId: "http://endhealth.info/im#vaccinationProcedure",
        propertyName: "vaccination procedure",
        propertyDisplay: "vaccination procedure",
        typeId: "http://endhealth.info/im#VSET_Immunisations_CareConnect",
        typeName: "Value set Immunisations - Care connect",
        typeDisplay: "Value set Immunisations - Care connect",
        inheritedId: undefined,
        inheritedName: undefined,
        inheritedDisplay: "-",
        cardinality: "2 : *"
      },
      {
        propertyId: "http://endhealth.info/im#vaccineProduct",
        propertyName: "vaccine product",
        propertyDisplay: "vaccine product",
        typeId: "http://endhealth.info/im#Concept",
        typeName: "Concept",
        typeDisplay: "Concept",
        inheritedId: undefined,
        inheritedName: undefined,
        inheritedDisplay: "-",
        cardinality: "0 : 3"
      },
      {
        propertyId: "http://endhealth.info/im#batchNumber",
        propertyName: "batch number",
        propertyDisplay: "batch number",
        typeId: "http://www.w3.org/2001/XMLSchema#string",
        typeName: undefined,
        typeDisplay: "http://www.w3.org/2001/XMLSchema#string",
        inheritedId: undefined,
        inheritedName: undefined,
        inheritedDisplay: "-",
        cardinality: "0 : 4"
      },
      {
        propertyId: "http://endhealth.info/im#doseSequence",
        propertyName: "dose sequence",
        propertyDisplay: "dose sequence",
        typeId: "http://www.w3.org/2001/XMLSchema#string",
        typeName: undefined,
        typeDisplay: "http://www.w3.org/2001/XMLSchema#string",
        inheritedId: undefined,
        inheritedName: undefined,
        inheritedDisplay: "-",
        cardinality: "0 : *"
      },
      {
        propertyId: "http://endhealth.info/im#dosesRequired",
        propertyName: "doses required",
        propertyDisplay: "doses required",
        typeId: "http://www.w3.org/2001/XMLSchema#string",
        typeName: undefined,
        typeDisplay: "http://www.w3.org/2001/XMLSchema#string",
        inheritedId: undefined,
        inheritedName: undefined,
        inheritedDisplay: "-",
        cardinality: "0 : *"
      },
      {
        propertyId: "http://endhealth.info/im#expiryDate",
        propertyName: "expiry date",
        propertyDisplay: "expiry date",
        typeId: "http://www.w3.org/2001/XMLSchema#string",
        typeName: undefined,
        typeDisplay: "http://www.w3.org/2001/XMLSchema#string",
        inheritedId: undefined,
        inheritedName: undefined,
        inheritedDisplay: "-",
        cardinality: "0 : *"
      }
    ]);
  });

  it("can navigate ___ iri", () => {
    wrapper.vm.navigate("testIri");
    expect(mockRouter.push).toHaveBeenCalledTimes(1);
    expect(mockRouter.push).toHaveBeenCalledWith({ name: "Concept", params: { selectedIri: "testIri" } });
  });

  it("can navigate ___ no iri", () => {
    wrapper.vm.navigate();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it("can exportCSV", () => {
    wrapper.vm.exportCSV();
    expect(mockRef.methods.exportCSV).toBeCalledTimes(1);
  });
});
*/
